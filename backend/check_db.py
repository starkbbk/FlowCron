import asyncio
import sys
import os

# Add the parent directory to sys.path to import from app
sys.path.append(os.getcwd())

from app.models.models import User
from app.core.database import SessionLocal
from sqlalchemy import select

async def check():
    async with SessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print(f"TOTAL_USERS: {len(users)}")
        for u in users:
            print(f"USER: {u.username} | EMAIL: {u.email}")

if __name__ == "__main__":
    asyncio.run(check())
