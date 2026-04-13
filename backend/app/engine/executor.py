import asyncio
import json
import re
from typing import Any, Dict, List, Optional, Set
from uuid import UUID
from datetime import datetime
from .handlers import NodeHandlers
from ..models import models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..api.ws import notify_node_progress, notify_execution_finished

class WorkflowExecutor:
    def __init__(self, db: AsyncSession, execution_id: UUID):
        self.db = db
        self.execution_id = execution_id
        self.execution_context = {}  # {node_id: output_data}
        self.node_executions = {} # {node_id: model_instance}

    async def execute(self):
        # 1. Fetch Execution and Workflow
        result = await self.db.execute(
            select(models.Execution).filter(models.Execution.id == self.execution_id)
        )
        execution = result.scalar_one_or_none()
        if not execution: return
        
        result = await self.db.execute(
            select(models.Workflow).filter(models.Workflow.id == execution.workflow_id)
        )
        workflow = result.scalar_one_or_none()
        if not workflow: return

        execution.status = "running"
        execution.started_at = datetime.utcnow()
        await self.db.commit()

        # 2. Setup Nodes and Edges
        nodes = workflow.nodes_data
        edges = workflow.edges_data
        node_lookup = {n['id']: n for n in nodes}
        
        # 3. Create initial NodeExecution records
        for node in nodes:
            ne = models.NodeExecution(
                execution_id=self.execution_id,
                node_id=node['id'],
                node_type=node['type'],
                node_label=node.get('data', {}).get('label'),
                status="pending"
            )
            self.db.add(ne)
            self.node_executions[node['id']] = ne
        
        await self.db.commit()

        # 4. Dependency Graph
        adj = {n['id']: [] for n in nodes}
        in_degree = {n['id']: 0 for n in nodes}
        for edge in edges:
            adj[edge['source']].append(edge)
            in_degree[edge['target']] += 1

        # 5. Find Trigger Node
        trigger_node = next((n for n in nodes if n['type'].endswith('_trigger')), None)
        if not trigger_node:
            execution.status = "failed"
            execution.error_message = "No trigger node found"
            await self.db.commit()
            return

        # 6. Execute Trigger Node
        await self._execute_node(trigger_node, execution.trigger_data or {})
        
        # 7. BFS traversal for execution
        queue = [trigger_node['id']]
        visited = {trigger_node['id']}
        skipped = set()

        # Simple BFS-based execution for DAGs with branching
        # Note: In a production app, we'd use a more robust task queue approach
        active_nodes = set(queue)
        
        while active_nodes:
            current_id = active_nodes.pop()
            if current_id in skipped: continue
            
            # Find next nodes
            for edge in adj[current_id]:
                target_id = edge['target']
                
                # Check if we should skip this branch (for conditions)
                source_node = node_lookup[current_id]
                if source_node['type'] == 'if_condition':
                    res = self.execution_context.get(current_id, {}).get('condition_result')
                    branch = "true" if res else "false"
                    if edge.get('sourceHandle') != branch:
                        await self._mark_skipped_recursive(target_id, adj, skipped)
                        continue
                
                if source_node['type'] == 'switch_condition':
                    matched = self.execution_context.get(current_id, {}).get('matched_case', 'default')
                    if edge.get('sourceHandle') != matched:
                        await self._mark_skipped_recursive(target_id, adj, skipped)
                        continue

                # Collect inputs from ALL parents for target
                # (Simple version: just ensure target is only executed once all parents are done/skipped)
                all_parents_done = True
                # In this simplified engine, we just process as nodes become available
                
                if target_id not in visited and target_id not in skipped:
                    target_node = node_lookup[target_id]
                    success = await self._execute_node(target_node, self.execution_context)
                    if not success:
                        execution.status = "failed"
                        # Fail remaining downstream
                        await self._mark_skipped_recursive(target_id, adj, skipped)
                    else:
                        visited.add(target_id)
                        active_nodes.add(target_id)

        # 8. Finalize Execution
        execution.status = "completed" if execution.status == "running" else execution.status
        execution.completed_at = datetime.utcnow()
        execution.duration_ms = int((execution.completed_at - execution.started_at).total_seconds() * 1000)
        
        # Update workflow stats
        workflow.total_executions += 1
        workflow.last_executed_at = execution.completed_at
        if execution.status == "completed":
            workflow.success_count += 1
        else:
            workflow.failure_count += 1
            
        await self.db.commit()
        await notify_execution_finished(
            str(self.execution_id), 
            execution.status, 
            {
                "duration_ms": execution.duration_ms,
                "nodes_completed": execution.nodes_completed,
                "nodes_failed": execution.nodes_failed,
                "nodes_total": execution.nodes_total
            }
        )

    async def _execute_node(self, node: Dict, context: Dict) -> bool:
        node_id = node['id']
        ne = self.node_executions[node_id]
        ne.status = "running"
        ne.started_at = datetime.utcnow()
        await self.db.commit()
        
        await notify_node_progress(str(self.execution_id), node_id, "running")
        
        try:
            config = node.get('data', {}).get('config', {})
            resolved_config = self.interpolate_config(config)
            ne.config_data = resolved_config
            ne.input_data = context
            
            handler = getattr(NodeHandlers, node['type'], None)
            if not handler:
                raise Exception(f"No handler for {node['type']}")
            
            output = await handler(resolved_config, context)
            self.execution_context[node_id] = output
            
            ne.output_data = output
            ne.status = "completed"
            ne.completed_at = datetime.utcnow()
            ne.duration_ms = int((ne.completed_at - ne.started_at).total_seconds() * 1000)
            await self.db.commit()
            
            await notify_node_progress(str(self.execution_id), node_id, "completed", output)
            return True
        except Exception as e:
            ne.status = "failed"
            ne.error_message = str(e)
            ne.completed_at = datetime.utcnow()
            await self.db.commit()
            await notify_node_progress(str(self.execution_id), node_id, "failed", {"error": str(e)})
            return False

    async def _mark_skipped_recursive(self, start_id: str, adj: Dict, skipped: Set):
        if start_id in skipped: return
        skipped.add(start_id)
        ne = self.node_executions.get(start_id)
        if ne:
            ne.status = "skipped"
            await self.db.commit()
            await notify_node_progress(str(self.execution_id), start_id, "skipped")
            
        for edge in adj.get(start_id, []):
            await self._mark_skipped_recursive(edge['target'], adj, skipped)

    def interpolate_config(self, config: Any) -> Any:
        if isinstance(config, str):
            def replacer(match):
                path = match.group(1).strip().split('.')
                # Path format: node_id, "output", ...fields
                node_id = path[0]
                if node_id not in self.execution_context: return "null"
                
                val = self.execution_context[node_id]
                # Skip 'output' if present in path
                start_idx = 1
                if len(path) > 1 and path[start_idx] == 'output':
                    start_idx = 2
                
                for part in path[start_idx:]:
                    if isinstance(val, dict): val = val.get(part)
                    else: return "null"
                return str(val) if val is not None else "null"

            return re.sub(r"\{\{(.*?)\}\}", replacer, config)
        
        if isinstance(config, list):
            return [self.interpolate_config(item) for item in config]
        if isinstance(config, dict):
            return {k: self.interpolate_config(v) for k, v in config.items()}
        return config
