from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .engine.scheduler import workflow_scheduler
import os

app = FastAPI(title="FlowCron API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await workflow_scheduler.start()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Auth & Workflows
from .api import auth, workflows, executions, webhooks, ws, api_keys, dashboard

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(executions.router, prefix="/api/executions", tags=["executions"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(api_keys.router, prefix="/api/api-keys", tags=["api-keys"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])
