from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List
from uuid import UUID
from ..api import deps
from ..models import models
from ..schemas import schemas
from ..engine.executor import WorkflowExecutor

router = APIRouter()

@router.get("/", response_model=List[schemas.Execution])
async def list_user_executions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    query = (
        select(models.Execution, models.Workflow.name.label("workflow_name"))
        .join(models.Workflow, models.Execution.workflow_id == models.Workflow.id)
        .filter(models.Execution.user_id == current_user.id)
        .order_by(desc(models.Execution.created_at))
    )
    result = await db.execute(query)
    executions = []
    for row in result:
        exec_obj = row[0]
        exec_obj.workflow_name = row[1]
        executions.append(exec_obj)
    return executions

@router.get("/recent", response_model=List[schemas.Execution])
async def list_recent_executions(
    limit: int = 10,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    query = (
        select(models.Execution, models.Workflow.name.label("workflow_name"))
        .join(models.Workflow, models.Execution.workflow_id == models.Workflow.id)
        .filter(models.Execution.user_id == current_user.id)
        .order_by(desc(models.Execution.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    executions = []
    for row in result:
        exec_obj = row[0]
        exec_obj.workflow_name = row[1]
        executions.append(exec_obj)
    return executions

@router.get("/{exec_id}", response_model=schemas.Execution)
async def get_execution(
    exec_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    query = (
        select(models.Execution, models.Workflow.name.label("workflow_name"))
        .join(models.Workflow, models.Execution.workflow_id == models.Workflow.id)
        .filter(models.Execution.id == exec_id, models.Execution.user_id == current_user.id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    exec_obj = row[0]
    exec_obj.workflow_name = row[1]
    return exec_obj

@router.get("/{exec_id}/nodes", response_model=List[schemas.NodeExecution])
async def get_node_executions(
    exec_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Verify execution ownership
    result = await db.execute(
        select(models.Execution).filter(models.Execution.id == exec_id, models.Execution.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Execution not found")

    result = await db.execute(
        select(models.NodeExecution).filter(models.NodeExecution.execution_id == exec_id).order_by(models.NodeExecution.started_at)
    )
    return result.scalars().all()

@router.delete("/{exec_id}")
async def delete_execution(
    exec_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Execution).filter(models.Execution.id == exec_id, models.Execution.user_id == current_user.id)
    )
    execution = result.scalar_one_or_none()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    await db.delete(execution)
    await db.commit()
    return {"message": "Execution deleted"}
