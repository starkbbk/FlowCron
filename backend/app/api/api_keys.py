from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID
import secrets
import hashlib
from ..api import deps
from ..models import models
from ..schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_api_keys(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(select(models.ApiKey).filter(models.ApiKey.user_id == current_user.id))
    keys = result.scalars().all()
    return [{"id": k.id, "name": k.name, "prefix": k.prefix, "created_at": k.created_at} for k in keys]

@router.post("/")
async def create_api_key(
    name: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    raw_key = f"fc_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    new_key = models.ApiKey(
        user_id=current_user.id,
        name=name,
        key_hash=key_hash,
        prefix=raw_key[:8]
    )
    db.add(new_key)
    await db.commit()
    return {"key": raw_key, "name": name}

@router.delete("/{key_id}")
async def delete_api_key(
    key_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    result = await db.execute(
        select(models.ApiKey).filter(models.ApiKey.id == key_id, models.ApiKey.user_id == current_user.id)
    )
    key = result.scalars().first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    
    await db.delete(key)
    await db.commit()
    return {"status": "success"}
