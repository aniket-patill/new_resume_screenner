from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
import schemas, models, utils, database


def _get_admin_emails() -> list[str]:
    """Load admin email list from ADMIN_EMAILS env var (comma-separated).
    Falls back to ADMIN_EMAIL (singular) for single-email configs.
    """
    raw = os.getenv("ADMIN_EMAILS") or os.getenv("ADMIN_EMAIL", "")
    return [e.strip().lower() for e in raw.split(",") if e.strip()]


def _is_admin_email(email: str) -> bool:
    return email.strip().lower() in _get_admin_emails()

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

from pydantic import BaseModel
class LoginSchema(BaseModel):
    username: str
    password: str

@router.post("/login/", response_model=schemas.Token)
def login(login_data: LoginSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    is_valid = utils.verify_password(login_data.password, user.hashed_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = utils.create_access_token(data={"sub": user.email})
    return {"access": access_token, "token_type": "bearer"}

@router.post("/candidate-login/", response_model=schemas.Token)
def candidate_login(login_data: LoginSchema, db: Session = Depends(database.get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.email == login_data.username).first()
    
    if not candidate:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not candidate.hashed_password:
        raise HTTPException(status_code=401, detail="Access not authorized")
        
    if not utils.verify_password(login_data.password, candidate.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Map to internal user account for JWT auth
    shadow_email = f"candidate_{candidate.id}@hiringai.internal"
    
    shadow_user = db.query(models.User).filter(models.User.email == shadow_email).first()
    if not shadow_user:
         raise HTTPException(status_code=401, detail="System configuration error. Please contact HR.")

    # Check if ALL of THIS candidate's assessments are completed — block login if nothing pending
    all_assessments = db.query(models.Assessment).filter(
        models.Assessment.user_id == shadow_user.id
    ).all()
    
    if all_assessments:
        has_pending = any(a.status in ("pending", "in_progress") for a in all_assessments)
        if not has_pending:
            raise HTTPException(
                status_code=403, 
                detail="All assessments have been completed. Thank you for participating!"
            )

    access_token = utils.create_access_token(data={"sub": shadow_email})
    return {"access": access_token, "token_type": "bearer"}

class ClerkSyncSchema(BaseModel):
    email: str

@router.post("/clerk-sync/", response_model=schemas.Token)
def clerk_sync(sync_data: ClerkSyncSchema, db: Session = Depends(database.get_db)):
    email = sync_data.email.strip().lower()
    role = "admin" if _is_admin_email(email) else "user"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        try:
            user = models.User(
                email=email,
                role=role,
                hashed_password=utils.get_password_hash("clerk_managed_user"),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database sync failed: {str(e)}"
                )
    
    # Sync and update the role in case it was changed or is out of sync with ADMIN_EMAILS
    if user.role != role:
        user.role = role
        db.commit()
        db.refresh(user)
        
    access_token = utils.create_access_token(data={"sub": user.email})
    return {"access": access_token, "token_type": "bearer", "role": user.role, "email": user.email}

# Dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
            
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError as e:
        raise HTTPException(
            status_code=401, 
            detail=f"JWT Error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise HTTPException(
            status_code=401, 
            detail=f"User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    return user

@router.get("/me/")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }
