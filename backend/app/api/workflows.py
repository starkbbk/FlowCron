from fastapi import APIRouter, Depends, HTTPException, status
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import List, Dict, Any
from uuid import UUID, uuid4
from ..api import deps
from ..models import models
from ..schemas import schemas
from ..engine.executor import WorkflowExecutor
from ..engine.scheduler import workflow_scheduler

router = APIRouter()

@router.get("/node-types")
async def get_node_types():
    # Return the static list of node types as defined in Section 5
    return {
        "node_types": [
            {"id": "manual_trigger", "category": "trigger", "name": "Manual Trigger", "icon": "Play", "color": "#007AFF", "config_fields": []},
            {"id": "cron_trigger", "category": "trigger", "name": "Schedule (Cron)", "icon": "Clock", "color": "#007AFF", "config_fields": [
                {"name": "interval_type", "type": "select", "options": ["minutes", "hours", "days"], "default": "minutes", "label": "Run Every"},
                {"name": "interval_value", "type": "number", "default": 5, "label": "Interval", "min": 1, "max": 1440}
            ]},
            {"id": "webhook_trigger", "category": "trigger", "name": "Webhook", "icon": "Webhook", "color": "#007AFF", "config_fields": []},
            {"id": "http_request", "category": "action", "name": "HTTP Request", "icon": "Globe", "color": "#34C759", "config_fields": [
                {"name": "url", "type": "text", "label": "URL", "placeholder": "https://api.example.com/data", "required": True},
                {"name": "method", "type": "select", "options": ["GET", "POST", "PUT", "DELETE", "PATCH"], "default": "GET", "label": "Method"},
                {"name": "headers", "type": "key_value_pairs", "label": "Headers"},
                {"name": "body", "type": "json_editor", "label": "Request Body"},
                {"name": "timeout_seconds", "type": "number", "label": "Timeout (seconds)", "default": 30}
            ]},
            {"id": "send_email", "category": "action", "name": "Send Email", "icon": "Mail", "color": "#34C759", "config_fields": [
                {"name": "to", "type": "text", "label": "To Email", "required": True},
                {"name": "subject", "type": "text", "label": "Subject", "required": True},
                {"name": "body", "type": "textarea", "label": "Email Body", "required": True}
            ]},
            {"id": "send_slack", "category": "action", "name": "Slack Message", "icon": "MessageSquare", "color": "#34C759", "config_fields": [
                {"name": "webhook_url", "type": "text", "label": "Slack Webhook URL", "required": True},
                {"name": "message", "type": "textarea", "label": "Message", "required": True}
            ]},
            {"id": "send_discord", "category": "action", "name": "Discord Message", "icon": "MessageCircle", "color": "#34C759", "config_fields": [
                {"name": "webhook_url", "type": "text", "label": "Discord Webhook URL", "required": True},
                {"name": "content", "type": "textarea", "label": "Message Content", "required": True}
            ]},
            {"id": "if_condition", "category": "condition", "name": "If / Else", "icon": "GitBranch", "color": "#FFCC00", "config_fields": [
                {"name": "field", "type": "text", "label": "Field to Check", "placeholder": "{{node_1.output.status_code}}", "required": True},
                {"name": "operator", "type": "select", "options": ["equals", "not_equals", "greater_than", "less_than", "contains"], "label": "Operator", "required": True},
                {"name": "value", "type": "text", "label": "Compare Value", "placeholder": "200"}
            ]},
            {"id": "delay_node", "category": "logic", "name": "Delay", "icon": "Timer", "color": "#AF52DE", "config_fields": [
                {"name": "delay_seconds", "type": "number", "label": "Delay (seconds)", "default": 5, "min": 1, "max": 300}
            ]},
            {"id": "transform_node", "category": "logic", "name": "Transform Data", "icon": "Wand2", "color": "#AF52DE", "config_fields": [
                {"name": "template", "type": "json_editor", "label": "Output Template", "placeholder": "{ \"name\": \"{{node_1.output.user.name}}\" }"}
            ]},
            {"id": "code_node", "category": "logic", "name": "Run Code", "icon": "Code", "color": "#AF52DE", "config_fields": [
                {"name": "code", "type": "code_editor", "label": "JavaScript Code", "placeholder": "return { result: input.value * 2 };"}
            ]}
        ]
    }

@router.get("/", response_model=List[schemas.Workflow])
async def list_workflows(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(select(models.Workflow).filter(models.Workflow.user_id == current_user.id).order_by(models.Workflow.updated_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=schemas.Workflow)
async def create_workflow(
    wf_in: schemas.WorkflowCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    new_wf = models.Workflow(
        **wf_in.dict(),
        user_id=current_user.id,
        status="draft",
        webhook_token=str(uuid4()),
        nodes_data=[],
        edges_data=[]
    )
    db.add(new_wf)
    await db.commit()
    await db.refresh(new_wf)
    return new_wf

@router.get("/{wf_id}", response_model=schemas.Workflow)
async def get_workflow(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@router.put("/{wf_id}", response_model=schemas.Workflow)
async def update_workflow(
    wf_id: UUID,
    wf_in: schemas.WorkflowUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    update_data = wf_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(wf, field, value)
    
    await db.commit()
    await db.refresh(wf)
    return wf

@router.delete("/{wf_id}")
async def delete_workflow(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    await db.delete(wf)
    await db.commit()
    return {"message": "Workflow deleted"}

@router.post("/{wf_id}/execute")
async def execute_workflow(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Create execution record
    execution = models.Execution(
        workflow_id=wf_id,
        user_id=current_user.id,
        trigger_type="manual",
        status="queued",
        nodes_total=len(wf.nodes_data)
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)

    # Start execution async (in a real app, this would be a Celery task or background task)
    executor = WorkflowExecutor(db, execution.id)
    asyncio.create_task(executor.execute())

    return {"execution_id": execution.id, "message": "Workflow execution started"}

@router.post("/{wf_id}/activate")
async def activate_workflow(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    wf.status = "active"
    await db.commit()
    
    if wf.trigger_type == "cron" and wf.cron_expression:
        await workflow_scheduler.add_workflow(wf)
        
    return {"message": "Workflow activated"}

@router.post("/{wf_id}/pause")
async def pause_workflow(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    wf.status = "paused"
    await db.commit()
    
    await workflow_scheduler.remove_workflow(wf.id)
        
    return {"message": "Workflow paused"}

@router.get("/{wf_id}/webhook-url")
async def get_webhook_url(
    wf_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.Workflow).filter(models.Workflow.id == wf_id, models.Workflow.user_id == current_user.id)
    )
    wf = result.scalar_one_or_none()
    if not wf or not wf.webhook_token:
        raise HTTPException(status_code=404, detail="Webhook token not found")
    
    # In a real app, this would come from settings
    base_url = "http://localhost:8000"
    return {"webhook_url": f"{base_url}/api/webhooks/{wf.webhook_token}"}
