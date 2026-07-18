from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship define kar rahe hain taaki user ki history fetch kar sakein
    histories = relationship("History", back_populates="owner", cascade="all, delete-orphan")


class History(Base):
    __tablename__ = "histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tool_name = Column(String(50), nullable=False) # e.g., 'Blog Generator', 'SEO Keywords'
    prompt_input = Column(Text, nullable=False)
    generated_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="histories")