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
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This application uses Clerk authentication. Password management is handled securely by Clerk."
    )

@router.post("/reset-password")
async def reset_password(req: schemas.ResetPasswordRequest, db: AsyncSession = Depends(deps.get_db)):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This application uses Clerk authentication. Password management is handled securely by Clerk."
    )
    
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

@router.post("/sync", response_model=schemas.User)
async def sync_user(
    user_info: schemas.UserSyncInput,
    db: AsyncSession = Depends(deps.get_db),
    payload: dict = Depends(deps.get_clerk_payload)
):
    clerk_id = payload.get("sub")
    
    # Check if user with clerk_id exists
    result = await db.execute(select(models.User).filter(models.User.clerk_id == clerk_id))
    user = result.scalars().first()
    
    if not user:
        # Check if a user with this email already exists
        result_email = await db.execute(select(models.User).filter(models.User.email == user_info.email))
        user = result_email.scalars().first()
        if user:
            # Link clerk_id to existing local user (migration of local account)
            user.clerk_id = clerk_id
            if user_info.profile_image:
                user.profile_image = user_info.profile_image
        else:
            # Create new user
            username = user_info.username or user_info.email.split("@")[0]
            # Ensure unique username
            res_username = await db.execute(select(models.User).filter(models.User.username == username))
            if res_username.scalars().first():
                import uuid
                username = f"{username}_{uuid.uuid4().hex[:6]}"
                
            user = models.User(
                email=user_info.email,
                username=username,
                clerk_id=clerk_id,
                profile_image=user_info.profile_image
            )
            db.add(user)
            
        await db.commit()
        await db.refresh(user)
    else:
        # Sync email/username/profile image if changed
        updated = False
        if user_info.email and user.email != user_info.email:
            res_email = await db.execute(select(models.User).filter(models.User.email == user_info.email, models.User.id != user.id))
            if not res_email.scalars().first():
                user.email = user_info.email
                updated = True
        if user_info.username and user.username != user_info.username:
            res_user = await db.execute(select(models.User).filter(models.User.username == user_info.username, models.User.id != user.id))
            if not res_user.scalars().first():
                user.username = user_info.username
                updated = True
        if user_info.profile_image and user.profile_image != user_info.profile_image:
            user.profile_image = user_info.profile_image
            updated = True
            
        if updated:
            await db.commit()
            await db.refresh(user)
            
    return user

