from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Content Generation Schemas
class GenerateContentRequest(BaseModel):
    tool_name: str
    prompt: str

class ContentResponse(BaseModel):
    tool_name: str
    generated_text: str

# History Schema
class HistoryResponse(BaseModel):
    id: int
    tool_name: str
    prompt_input: str
    generated_content: str
    created_at: datetime

    class Config:
        from_attributes = True