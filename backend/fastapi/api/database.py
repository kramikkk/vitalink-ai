from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment (defaults to SQLite for local dev)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vitalink.db")

# Determine database type
is_sqlite = "sqlite" in SQLALCHEMY_DATABASE_URL
is_postgres = SQLALCHEMY_DATABASE_URL.startswith("postgresql")

# Configure engine based on database type
if is_sqlite:
    # SQLite configuration
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    print("🗄️  Using SQLite database (local development)")
elif is_postgres:
    # PostgreSQL/Neon configuration
    # Use NullPool for serverless environments (Neon, Supabase, etc.)
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=NullPool,  # Better for serverless
        pool_pre_ping=True,  # Verify connections before using
        echo=False
    )
    print("🐘 Using PostgreSQL database (Neon)")
else:
    # Fallback for other databases
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    print(f"🗄️  Using database: {SQLALCHEMY_DATABASE_URL.split('://')[0]}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





