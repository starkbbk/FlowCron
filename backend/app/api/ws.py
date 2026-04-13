from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

router = APIRouter()

# Simple In-memory connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)

    async def broadcast(self, room: str, message: dict):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/{execution_id}")
async def websocket_endpoint(websocket: WebSocket, execution_id: str):
    await manager.connect(execution_id, websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(execution_id, websocket)

# This would be called by the Executor to notify progress
async def notify_node_progress(execution_id: str, node_id: str, status: str, output: dict = None):
    await manager.broadcast(execution_id, {
        "type": "node_update",
        "data": {
            "node_id": node_id,
            "status": status,
            "output": output,
            "timestamp": str(asyncio.get_event_loop().time())
        }
    })

async def notify_execution_finished(execution_id: str, status: str, stats: dict):
    await manager.broadcast(execution_id, {
        "type": "execution_finished",
        "data": {
            "status": status,
            **stats
        }
    })
