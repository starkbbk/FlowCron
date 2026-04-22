import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta
import random

# Add current directory to sys.path
sys.path.append(os.getcwd())

from app.models.models import User, Workflow, Execution, NodeExecution, ActivityLog
from app.core.database import SessionLocal
from sqlalchemy import select, delete

async def seed():
    async with SessionLocal() as db:
        # Find test123 user
        res = await db.execute(select(User).filter(User.username == "test123"))
        user = res.scalar_one_or_none()
        
        if not user:
            print("User test123 not found. Please sign up first.")
            return

        print(f"Seeding data for user: {user.username} ({user.id})")

        # 1. Clean up existing data for this user to avoid duplication
        print("Cleaning up old data...")
        await db.execute(delete(NodeExecution).filter(NodeExecution.execution_id.in_(
            select(Execution.id).filter(Execution.user_id == user.id)
        )))
        await db.execute(delete(Execution).filter(Execution.user_id == user.id))
        await db.execute(delete(Workflow).filter(Workflow.user_id == user.id))
        await db.execute(delete(ActivityLog).filter(ActivityLog.user_id == user.id))
        await db.commit()

        # 2. Create Workflows
        workflows_data = [
            {
                "name": "GitHub to Slack Sync",
                "description": "Automatically post GitHub stars to a Slack channel",
                "trigger_type": "webhook",
                "status": "active"
            },
            {
                "name": "Daily DB Backup",
                "description": "Backup production database to S3 every midnight",
                "trigger_type": "cron",
                "cron_expression": "0 0 * * *",
                "status": "active"
            },
            {
                "name": "Test Workflow",
                "description": "A simple manual test flow",
                "trigger_type": "manual",
                "status": "draft"
            }
        ]

        workflows = []
        for wd in workflows_data:
            wf = Workflow(
                user_id=user.id,
                name=wd["name"],
                description=wd["description"],
                trigger_type=wd["trigger_type"],
                status=wd["status"],
                nodes_data=[
                    {"id": "trigger", "type": wd["trigger_type"], "position": {"x": 100, "y": 150}, "data": {"type": wd["trigger_type"], "label": wd["name"]}}, 
                    {"id": "action", "type": "http_request", "position": {"x": 450, "y": 150}, "data": {"type": "http_request", "label": "HTTP Action"}}
                ],
                edges_data=[{"id": "e1-2", "source": "trigger", "target": "action", "type": "glow", "animated": True}]
            )
            db.add(wf)
            workflows.append(wf)
        
        await db.commit()
        for wf in workflows:
            await db.refresh(wf)

        # 3. Create Executions (spread over 7 days)
        print("Creating executions and logs...")
        node_types = ["manual_trigger", "cron_trigger", "webhook_trigger", "http_request", "send_email", "storage"]
        
        for i in range(25):
            wf = random.choice(workflows)
            created_at = datetime.utcnow() - timedelta(
                days=random.randint(0, 6),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            status = random.choices(["completed", "failed"], weights=[0.8, 0.2])[0]
            duration = random.randint(200, 1500)
            
            exec_obj = Execution(
                workflow_id=wf.id,
                user_id=user.id,
                status=status,
                trigger_type=wf.trigger_type,
                started_at=created_at,
                completed_at=created_at + timedelta(milliseconds=duration),
                duration_ms=duration,
                created_at=created_at
            )
            db.add(exec_obj)
            await db.flush() # Get ID

            # Create Node Executions
            num_nodes = random.randint(2, 4)
            for j in range(num_nodes):
                n_type = random.choice(node_types)
                n_status = "completed" if status == "completed" else random.choice(["completed", "failed"])
                
                node_exec = NodeExecution(
                    execution_id=exec_obj.id,
                    node_id=f"node_{j}",
                    node_type=n_type,
                    status=n_status,
                    started_at=created_at,
                    completed_at=created_at + timedelta(milliseconds=random.randint(50, 300)),
                    created_at=created_at
                )
                db.add(node_exec)
            
            # Create Activity Log
            log = ActivityLog(
                user_id=user.id,
                action=f"Workflow {status}",
                resource_type="execution",
                resource_id=str(exec_obj.id),
                context_metadata={"workflow_name": wf.name},
                created_at=created_at
            )
            db.add(log)
        
        # Add some system logs
        system_events = ["Login successful", "API Key created", "Settings updated"]
        for event in system_events:
            db.add(ActivityLog(
                user_id=user.id,
                action=event,
                resource_type="system",
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            ))
        
        await db.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
