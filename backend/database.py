from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# .env file load kar rahe hain
load_dotenv()

# Database URL fetch kar rahe hain
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nexora.db")

# SQLite ke liye check_same_thread False karna padta hai FastAPI me
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Base class jisko inherit karke models banenge
Base = declarative_base()

# Dependency function jo database connection manage karega
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()