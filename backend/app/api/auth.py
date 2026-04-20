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
    result = await db.execute(
        select(models.User).filter(
            (models.User.email == user_in.email) | 
            (models.User.username == user_in.email)
        )
    )
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

@router.post("/forgot-password")
async def forgot_password(req: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == req.email))
    user = result.scalars().first()
    
    if user:
        reset_token = security.create_reset_token(user.email)
        # Mocking email sending by printing to console
        print(f"\n[{'='*40}]")
        print(f"MOCK EMAIL SENT TO: {user.email}")
        print(f"RESET LINK: http://localhost:5173/reset-password?token={reset_token}")
        print(f"[{'='*40}]\n")
        
    # Always return 200 for security reasons (don't reveal if email exists)
    return {"message": "If this email is registered, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(req: schemas.ResetPasswordRequest, db: AsyncSession = Depends(deps.get_db)):
    email = security.verify_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
        
    result = await db.execute(select(models.User).filter(models.User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user.")
        
    user.password_hash = security.get_password_hash(req.new_password)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset password.")
        
    return {"message": "Password successfully reset."}
    
@router.patch("/profile", response_model=schemas.User)
async def update_profile(
    profile_in: schemas.ProfileUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if profile_in.username:
        # Check if username is taken by another user
        res = await db.execute(select(models.User).filter(models.User.username == profile_in.username, models.User.id != current_user.id))
        if res.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = profile_in.username
    
    if profile_in.profile_image is not None:
        current_user.profile_image = profile_in.profile_image
        
    await db.commit()
    await db.refresh(current_user)
    return current_user
