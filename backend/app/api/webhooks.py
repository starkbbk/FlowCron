from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import SessionLocal
from ..models import models
from ..engine.executor import WorkflowExecutor
import asyncio

router = APIRouter()

@router.post("/{webhook_token}")
async def public_webhook_trigger(webhook_token: str, request: Request):
    # This is a public endpoint, so we don't use deps.get_current_user
    async with SessionLocal() as db:
        result = await db.execute(
            select(models.Workflow).filter(models.Workflow.webhook_token == webhook_token)
        )
        wf = result.scalar_one_or_none()
        if not wf:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        if wf.status != "active":
            raise HTTPException(status_code=400, detail="Workflow is not active")

        # Parse payload
        try:
            payload = await request.json()
        except:
            payload = {}

        # Create execution record
        execution = models.Execution(
            workflow_id=wf.id,
            user_id=wf.user_id,
            trigger_type="webhook",
            trigger_data={"payload": payload, "headers": dict(request.headers)},
            status="queued",
            nodes_total=len(wf.nodes_data)
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)

        # Start execution
        executor = WorkflowExecutor(db, execution.id)
        asyncio.create_task(executor.execute())

        return {"execution_id": execution.id, "status": "triggered"}
