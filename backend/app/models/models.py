from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Text, Integer, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workflows = relationship("Workflow", back_populates="user")
    executions = relationship("Execution", back_populates="user")

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    name = Column(String, nullable=False, default="Untitled Workflow")
    description = Column(Text, nullable=True)
    status = Column(String, default="draft")  # draft, active, paused
    trigger_type = Column(String, default="manual")  # manual, cron, webhook
    cron_expression = Column(String, nullable=True)
    cron_timezone = Column(String, default="UTC")
    webhook_token = Column(String, unique=True, nullable=True)
    nodes_data = Column(JSON, nullable=False, default=list)
    edges_data = Column(JSON, nullable=False, default=list)
    last_executed_at = Column(DateTime(timezone=True), nullable=True)
    total_executions = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="workflows")
    executions = relationship("Execution", back_populates="workflow")
    versions = relationship("WorkflowVersion", back_populates="workflow")

class WorkflowVersion(Base):
    __tablename__ = "workflow_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), index=True)
    version_number = Column(Integer, nullable=False)
    nodes_data = Column(JSON, nullable=False)
    edges_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workflow = relationship("Workflow", back_populates="versions")

class Execution(Base):
    __tablename__ = "executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    status = Column(String, default="queued")  # queued, running, completed, failed, cancelled
    trigger_type = Column(String) # manual, cron, webhook
    trigger_data = Column(JSON, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    nodes_completed = Column(Integer, default=0)
    nodes_failed = Column(Integer, default=0)
    nodes_total = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workflow = relationship("Workflow", back_populates="executions")
    user = relationship("User", back_populates="executions")
    node_executions = relationship("NodeExecution", back_populates="execution", cascade="all, delete-orphan")

class NodeExecution(Base):
    __tablename__ = "node_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("executions.id"), index=True)
    node_id = Column(String, nullable=False) # The React Flow node ID
    node_type = Column(String, nullable=False)
    node_label = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, running, completed, failed, skipped
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    config_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    execution = relationship("Execution", back_populates="node_executions")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    context_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False)
    prefix = Column(String(8), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
