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
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Fetch counts (Total, Active, Executions Today, Total Executions, Success Executions) in one query using subqueries
    sub_total_workflows = select(func.count(models.Workflow.id)).filter(models.Workflow.user_id == current_user.id).scalar_subquery()
    sub_active_workflows = select(func.count(models.Workflow.id)).filter(models.Workflow.user_id == current_user.id, models.Workflow.status == "active").scalar_subquery()
    sub_exec_today = select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id, models.Execution.created_at >= today).scalar_subquery()
    sub_total_exec = select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id).scalar_subquery()
    sub_success_exec = select(func.count(models.Execution.id)).filter(models.Execution.user_id == current_user.id, models.Execution.status == "completed").scalar_subquery()
    
    counts_query = select(
        sub_total_workflows.label("total_workflows"),
        sub_active_workflows.label("active_workflows"),
        sub_exec_today.label("exec_today"),
        sub_total_exec.label("total_exec"),
        sub_success_exec.label("success_exec")
    )
    
    counts_res = await db.execute(counts_query)
    row = counts_res.first()
    
    total_workflows = row.total_workflows if row else 0
    active_workflows = row.active_workflows if row else 0
    total_executions_today = row.exec_today if row else 0
    t_count = row.total_exec if row else 0
    s_count = row.success_exec if row else 0
    success_rate = (s_count / t_count * 100) if t_count > 0 else 0

    # 2. Recent Executions (1 query)
    recent_exec_res = await db.execute(
        select(models.Execution)
        .filter(models.Execution.user_id == current_user.id)
        .order_by(desc(models.Execution.created_at))
        .limit(5)
    )
    recent_executions = recent_exec_res.scalars().all()

    # 3. Chart Data (Last 7 days) — 1 query to get created_at timestamps, grouped in Python to avoid 7 roundtrips
    seven_days_ago = today - timedelta(days=6)
    chart_query = (
        select(models.Execution.created_at)
        .filter(
            models.Execution.user_id == current_user.id,
            models.Execution.created_at >= seven_days_ago
        )
    )
    chart_res = await db.execute(chart_query)
    execution_dates = chart_res.scalars().all()
    
    date_counts = {}
    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        date_counts[day] = 0
        
    for dt in execution_dates:
        dt_str = dt.strftime("%Y-%m-%d")
        if dt_str in date_counts:
            date_counts[dt_str] += 1
            
    chart_data = [{"name": day, "executions": count} for day, count in date_counts.items()]

    # 4. Node Reliability (1 query)
    reliability = {
        "manual_trigger": "100%",
        "http_request": "100%",
        "send_email": "100%",
        "storage": "100%"
    }
    
    node_stats_res = await db.execute(
        select(
            models.NodeExecution.node_type,
            func.count(models.NodeExecution.id).label("total"),
            func.count(models.NodeExecution.id).filter(models.NodeExecution.status == "completed").label("success")
        )
        .join(models.Execution)
        .filter(models.Execution.user_id == current_user.id)
        .group_by(models.NodeExecution.node_type)
    )
    
    for row in node_stats_res.all():
        node_type, total, success = row
        if total > 0:
            rate = (success / total) * 100
            reliability[node_type] = f"{rate:.1f}%"

    return {
        "total_workflows": total_workflows,
        "active_workflows": active_workflows,
        "total_executions_today": total_executions_today,
        "success_rate": round(success_rate, 1),
        "recent_executions": recent_executions,
        "execution_chart_data": chart_data,
        "node_reliability": reliability,
        "system_uptime": "99.9%"
    }
