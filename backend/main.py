from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

import models, schemas, security, ai_service
from database import engine, get_db

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexora AI Content Studio API",
    description="Backend API for AI-powered content generation using FastAPI and Google Gemini.",
    version="1.0.0"
)

# CORS Configuration (Security headers for frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, change to your specific frontend URL e.g., "https://nexora.netlify.app"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nexora API Engine"}

# --- AUTHENTICATION ROUTES ---

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- AI GENERATION ROUTES ---

@app.post("/generate", response_model=schemas.ContentResponse)
def generate_content(
    request: schemas.GenerateContentRequest, 
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main endpoint to generate AI content and save it to the user's history.
    """
    # 1. Call Gemini API
    generated_text = ai_service.generate_ai_content(request.prompt)
    
    # 2. Save to History
    new_history = models.History(
        user_id=current_user.id,
        tool_name=request.tool_name,
        prompt_input=request.prompt,
        generated_content=generated_text
    )
    db.add(new_history)
    db.commit()
    db.refresh(new_history)
    
    return schemas.ContentResponse(
        tool_name=request.tool_name, 
        generated_text=generated_text
    )

# --- HISTORY ROUTES ---

@app.get("/history", response_model=List[schemas.HistoryResponse])
def get_user_history(
    skip: int = 0, 
    limit: int = 50, 
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    histories = db.query(models.History)\
                  .filter(models.History.user_id == current_user.id)\
                  .order_by(models.History.created_at.desc())\
                  .offset(skip).limit(limit).all()
    return histories

@app.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    history_id: int, 
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    history_item = db.query(models.History).filter(
        models.History.id == history_id, 
        models.History.user_id == current_user.id
    ).first()
    
    if not history_item:
        raise HTTPException(status_code=404, detail="History record not found")
        
    db.delete(history_item)
    db.commit()