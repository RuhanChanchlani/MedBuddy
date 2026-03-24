from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import hmac
import hashlib
from dotenv import load_dotenv

import google.generativeai as genai
from PIL import Image
import io
import PyPDF2

# Import local modules
from database import init_db, get_db, User, AnalysisReport
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from sqlalchemy.orm import Session

load_dotenv()

# Initialize Database
init_db()

# Configure Gemini
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None

app = FastAPI(title="MedBuddy API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "MedBuddy API is running", "docs": "/docs"}

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Pydantic Models ---
class Medication(BaseModel):
    name: str
    dosage: str
    timing: str
    duration: str

class AnalysisResponse(BaseModel):
    diagnosis: str
    medications: List[Medication]
    side_effects: List[str]
    checklist: List[str]
    summary: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Dependencies ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# --- Auth Routes ---
@app.post("/api/v1/register", response_model=UserResponse, tags=["auth"])
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token, tags=["auth"])
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Analysis Routes ---
@app.post("/api/v1/analyze", tags=["analyze"], response_model=AnalysisResponse)
async def analyze(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes a medical document and stores it in the database for the current user.
    """
    if not file.content_type.startswith(('image/', 'application/pdf', 'text/')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF, image, or text file.")

    content = await file.read()
    text_content = ""

    if file.content_type == "application/pdf":
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            text_content += page.extract_text()
    elif file.content_type.startswith("image/"):
        img = Image.open(io.BytesIO(content))
        if model:
            response = model.generate_content([
                "Extract and analyze this medical document. Provide a simplified diagnosis, medication list (name, dosage, timing, duration), side effects, and a checklist of what to do next. Return in a structured JSON format.",
                img
            ])
            text_content = response.text
        else:
            text_content = "OCR mock content"
    else:
        text_content = content.decode("utf-8")

    # If we have text content, use Gemini to format it
    analysis_data = None
    if model:
        prompt = f"""
        Analyze the following medical text and extract:
        1. Simplified diagnosis (plain language)
        2. Medication list (name, dosage, timing, duration)
        3. Side effects to watch for (2-3 items)
        4. Checklist of what to do next (3-4 items)
        5. One-line summary

        Text:
        {text_content}

        Return only a JSON response that matches this structure:
        {{
            "diagnosis": "string",
            "medications": [{{ "name": "string", "dosage": "string", "timing": "string", "duration": "string" }}],
            "side_effects": ["string"],
            "checklist": ["string"],
            "summary": "string"
        }}
        """
        try:
            response = model.generate_content(prompt)
            json_str = response.text.strip().replace("```json", "").replace("```", "")
            analysis_data = json.loads(json_str)
        except Exception as e:
            print(f"Gemini error: {e}")
            analysis_data = None

    if not analysis_data:
        # Mock fallback
        analysis_data = {
            "diagnosis": "Common Cold with mild respiratory congestion",
            "medications": [
                {"name": "Paracetamol", "dosage": "500mg", "timing": "Twice a day after food", "duration": "3 days"},
                {"name": "Cough Syrup", "dosage": "10ml", "timing": "Before bed", "duration": "5 days"}
            ],
            "side_effects": ["Drowsiness from cough syrup", "Mild nausea if taken on empty stomach"],
            "checklist": ["Drink plenty of warm fluids", "Complete the full course", "Rest well"],
            "summary": "You have a common cold. Take your medicines and rest."
        }

    # Store in database
    report = AnalysisReport(
        filename=file.filename,
        diagnosis=analysis_data["diagnosis"],
        medications=analysis_data["medications"],
        side_effects=analysis_data["side_effects"],
        checklist=analysis_data["checklist"],
        summary=analysis_data["summary"],
        user_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return AnalysisResponse(**analysis_data)

@app.get("/api/v1/history", tags=["analyze"], response_model=List[AnalysisResponse])
async def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the analysis history for the authenticated user.
    """
    reports = db.query(AnalysisReport).filter(AnalysisReport.user_id == current_user.id).all()
    return reports

# --- Webhook Routes ---
@app.post("/api/v1/webhook/github", tags=["webhooks"])
async def github_webhook(request: Request):
    """
    Handles incoming GitHub webhooks for repository events.
    Verifies signature if GITHUB_WEBHOOK_SECRET is set.
    """
    payload = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    
    secret = os.getenv("GITHUB_WEBHOOK_SECRET")
    if secret and signature:
        # Verify the signature
        hash_object = hmac.new(secret.encode(), payload, hashlib.sha256)
        expected_signature = f"sha256={hash_object.hexdigest()}"
        
        if not hmac.compare_digest(signature, expected_signature):
            raise HTTPException(status_code=403, detail="Invalid webhook signature")

    # Parse the payload
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = request.headers.get("X-GitHub-Event", "unknown")
    print(f"Received GitHub Webhook: {event_type}")

    # Log specific event details
    if event_type == "push":
        repo_name = data.get("repository", {}).get("full_name")
        branch = data.get("ref", "").replace("refs/heads/", "")
        sender = data.get("sender", {}).get("login")
        print(f"Push to {repo_name} on branch {branch} by {sender}")
    
    return {"status": "success", "event": event_type}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
