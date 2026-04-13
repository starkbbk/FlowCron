from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime

# Auth
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: UUID
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None

# Workflow
class WorkflowBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    trigger_type: str = "manual"
    cron_expression: Optional[str] = None
    cron_timezone: str = "UTC"

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    trigger_type: Optional[str] = None
    cron_expression: Optional[str] = None
    cron_timezone: Optional[str] = None
    nodes_data: Optional[List[Any]] = None
    edges_data: Optional[List[Any]] = None

class Workflow(WorkflowBase):
    id: UUID
    user_id: UUID
    status: str
    webhook_token: Optional[str] = None
    nodes_data: List[Any]
    edges_data: List[Any]
    last_executed_at: Optional[datetime] = None
    total_executions: int = 0
    success_count: int = 0
    failure_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Node Execution
class NodeExecutionBase(BaseModel):
    node_id: str
    node_type: str
    node_label: Optional[str] = None
    status: str
    input_data: Optional[Any] = None
    output_data: Optional[Any] = None
    config_data: Optional[Any] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None

class NodeExecution(NodeExecutionBase):
    id: UUID
    execution_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Execution
class Execution(BaseModel):
    id: UUID
    workflow_id: UUID
    user_id: UUID
    workflow_name: Optional[str] = None
    status: str
    trigger_type: str
    trigger_data: Optional[Any] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error_message: Optional[str] = None
    nodes_completed: int = 0
    nodes_failed: int = 0
    nodes_total: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class ExecutionWithNodes(Execution):
    node_executions: List[NodeExecution] = []

# Dashboard
class DashboardOverview(BaseModel):
    total_workflows: int
    active_workflows: int
    total_executions_today: int
    success_rate: float
    recent_executions: List[Execution]
    execution_chart_data: List[Dict[str, Any]]
