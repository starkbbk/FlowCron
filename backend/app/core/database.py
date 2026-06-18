from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./flowcron.db")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

connect_args = {}
if "postgresql" in DATABASE_URL:
    parsed = urlparse(DATABASE_URL)
    query = dict(parse_qsl(parsed.query))
    if "sslmode" in query:
        query.pop("sslmode")
        connect_args["ssl"] = True
    if "channel_binding" in query:
        query.pop("channel_binding")
    new_query = urlencode(query)
    parsed = parsed._replace(query=new_query)
    DATABASE_URL = urlunparse(parsed)

engine = create_async_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
