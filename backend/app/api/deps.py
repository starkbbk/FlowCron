import uuid
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import SessionLocal
from ..core.security import SECRET_KEY, ALGORITHM
from ..models import models
from sqlalchemy import select

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

async def get_db() -> Generator:
    async with SessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise JWTError("Missing sub claim")
        # Convert string ID back to UUID object for SQLAlchemy
        user_uuid = uuid.UUID(user_id)
    except (JWTError, AttributeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    result = await db.execute(select(models.User).filter(models.User.id == user_uuid))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
