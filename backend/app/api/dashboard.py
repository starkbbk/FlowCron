from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from ..api import deps
from ..models import models
from ..schemas import schemas
from datetime import datetime, timedelta
from typing import Dict, Any, List

router = APIRouter()

@router.get("/overview", response_model=schemas.DashboardOverview)
async def get_dashboard_overview(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Total Workflows
    wf_count_res = await db.execute(select(func.count(models.Workflow.id)).filter(models.Workflow.user_id == current_user.id))
    total_workflows = wf_count_res.scalar() or 0

    # 2. Active Workflows
    active_wf_res = await db.execute(select(func.count(models.Workflow.id)).filter(models.Workflow.user_id == current_user.id, models.Workflow.status == "active"))
    active_workflows = active_wf_res.scalar() or 0
    
    # 3. Executions today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    exec_today_res = await db.execute(select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id, models.Execution.created_at >= today))
    total_executions_today = exec_today_res.scalar() or 0
    
    # 4. Success rate
    total_exec_res = await db.execute(select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id))
    t_count = total_exec_res.scalar() or 0
    success_exec_res = await db.execute(select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id, models.Execution.status == "completed"))
    s_count = success_exec_res.scalar() or 0
    success_rate = (s_count / t_count * 100) if t_count > 0 else 0

    # 5. Recent Executions
    recent_exec_res = await db.execute(select(models.Execution).filter(models.Execution.user_id == current_user.id).order_by(desc(models.Execution.created_at)).limit(5))
    recent_executions = recent_exec_res.scalars().all()

    # 6. Chart Data (Last 7 days) — real counts per day
    chart_data = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_count_res = await db.execute(
            select(func.count(models.Execution.id)).filter(
                models.Execution.user_id == current_user.id,
                models.Execution.created_at >= day_start,
                models.Execution.created_at < day_end
            )
        )
        chart_data.append({"name": day_start.strftime("%Y-%m-%d"), "executions": day_count_res.scalar() or 0})

    return {
        "total_workflows": total_workflows,
        "active_workflows": active_workflows,
        "total_executions_today": total_executions_today,
        "success_rate": round(success_rate, 1),
        "recent_executions": recent_executions,
        "execution_chart_data": chart_data
    }
