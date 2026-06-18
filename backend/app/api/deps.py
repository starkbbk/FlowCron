import uuid
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import httpx
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

# Cache JWKS key sets by issuer
_jwks_cache = {}

async def verify_clerk_token(token: str) -> dict:
    try:
        unverified_headers = jwt.get_unverified_header(token)
        unverified_payload = jwt.get_unverified_claims(token)
    except Exception as e:
        raise JWTError(f"Failed to parse token headers or claims: {e}")
        
    alg = unverified_headers.get("alg")
    if alg != "RS256":
        raise JWTError(f"Unsupported algorithm: {alg}")
        
    iss = unverified_payload.get("iss")
    kid = unverified_headers.get("kid")
    
    if not iss or not kid:
        raise JWTError("Missing issuer (iss) or key ID (kid) in token")
        
    jwks = _jwks_cache.get(iss)
    if not jwks:
        jwks_url = f"{iss.rstrip('/')}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url)
            if resp.status_code == 200:
                jwks = resp.json()
                _jwks_cache[iss] = jwks
            else:
                raise JWTError(f"Failed to fetch JWKS from {jwks_url}")
                
    # Verify the token signature and expiration using JWKS
    payload = jwt.decode(
        token, 
        jwks, 
        algorithms=["RS256"], 
        options={"verify_aud": False}
    )
    return payload

async def get_clerk_payload(token: str = Depends(reusable_oauth2)) -> dict:
    try:
        unverified_headers = jwt.get_unverified_header(token)
        alg = unverified_headers.get("alg")
        if alg == "RS256":
            payload = await verify_clerk_token(token)
            return payload
        else:
            raise JWTError("Expected RS256 Clerk token")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        unverified_headers = jwt.get_unverified_header(token)
        alg = unverified_headers.get("alg")
        
        if alg == "RS256":
            # Clerk token
            payload = await verify_clerk_token(token)
            clerk_id = payload.get("sub")
            if clerk_id is None:
                raise JWTError("Missing sub claim in Clerk token")
            
            result = await db.execute(select(models.User).filter(models.User.clerk_id == clerk_id))
            user = result.scalars().first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail="Clerk user not found in local database. Please sync first."
                )
            return user
            
        elif alg == "HS256":
            # Legacy token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise JWTError("Missing sub claim")
            user_uuid = uuid.UUID(user_id)
            
            result = await db.execute(select(models.User).filter(models.User.id == user_uuid))
            user = result.scalars().first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
            
        else:
            raise JWTError(f"Unsupported token algorithm: {alg}")
            
    except (JWTError, AttributeError, ValueError, HTTPException) as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

