from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core import security
from ..api import deps
from ..models import models
from ..schemas import schemas

router = APIRouter()

@router.post("/signup", response_model=schemas.Token)
async def signup(user_in: schemas.UserCreate, db: AsyncSession = Depends(deps.get_db)):
    # Check email
    result = await db.execute(select(models.User).filter(models.User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Check username
    result = await db.execute(select(models.User).filter(models.User.username == user_in.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="This username is already taken.")
    
    new_user = models.User(
        email=user_in.email,
        username=user_in.username,
        password_hash=security.get_password_hash(user_in.password)
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not create user account. Please try again.")
    
    access_token = security.create_access_token(new_user.id)
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=schemas.Token)
async def login(user_in: schemas.UserLogin, db: AsyncSession = Depends(deps.get_db)):
    # Note: For production use OAuth2PasswordRequestForm
    result = await db.execute(select(models.User).filter(models.User.email == user_in.email))
    user = result.scalars().first()
    if not user or not security.verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(user.id)
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(deps.get_current_user)):
    return current_user
