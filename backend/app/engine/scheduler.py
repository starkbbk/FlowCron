from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import models
from .executor import WorkflowExecutor
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

class WorkflowScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    async def start(self):
        self.scheduler.start()
        await self.load_active_workflows()

    async def load_active_workflows(self):
        # This will be called on startup
        from ..core.database import SessionLocal
        async with SessionLocal() as db:
            result = await db.execute(
                select(models.Workflow).filter(models.Workflow.status == "active", models.Workflow.trigger_type == "cron")
            )
            workflows = result.scalars().all()
            for wf in workflows:
                await self.add_workflow(wf)

    async def add_workflow(self, workflow: models.Workflow):
        if not workflow.cron_expression:
            return

        job_id = f"wf_{workflow.id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)

        self.scheduler.add_job(
            self.trigger_execution,
            CronTrigger.from_crontab(workflow.cron_expression),
            id=job_id,
            args=[workflow.id],
            replace_existing=True
        )
        logger.info(f"Scheduled workflow {workflow.name} with cron {workflow.cron_expression}")

    async def remove_workflow(self, workflow_id: UUID):
        job_id = f"wf_{workflow_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)

    async def trigger_execution(self, workflow_id: UUID):
        from ..core.database import SessionLocal
        async with SessionLocal() as db:
            # Refresh workflow to get user_id and nodes
            result = await db.execute(
                select(models.Workflow).filter(models.Workflow.id == workflow_id)
            )
            wf = result.scalar_one_or_none()
            if not wf or wf.status != "active":
                return

            # Create execution record
            execution = models.Execution(
                workflow_id=workflow_id,
                user_id=wf.user_id,
                trigger_type="cron",
                status="queued",
                nodes_total=len(wf.nodes_data)
            )
            db.add(execution)
            await db.commit()
            await db.refresh(execution)
            
            # Execute
            executor = WorkflowExecutor(db, execution.id)
            await executor.execute()

workflow_scheduler = WorkflowScheduler()
