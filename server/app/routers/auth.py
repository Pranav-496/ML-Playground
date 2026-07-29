"""Authentication router: register, login, Google OAuth, and user profile."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User
from app.models.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
)
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_google_token,
    get_current_user,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with username, email, and password."""

    # Validate passwords match
    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    # Check if username already exists
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    # Check if email already exists
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        username=req.username.lower(),
        email=req.email.lower(),
        first_name=req.first_name.strip(),
        last_name=req.last_name.strip(),
        hashed_password=hash_password(req.password),
        is_google_user=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate JWT
    token = create_access_token(data={"sub": user.username})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with username or email and password."""

    # Find user by username or email
    identifier = req.identifier.lower()
    user = db.query(User).filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.is_google_user and not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google sign-in. Please continue with Google.",
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Generate JWT
    token = create_access_token(data={"sub": user.username})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Login or register via Google OAuth."""

    # Verify the Google token
    google_info = verify_google_token(req.credential)
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    # Check if user already exists by google_id or email
    user = db.query(User).filter(
        or_(
            User.google_id == google_info["google_id"],
            User.email == google_info["email"].lower(),
        )
    ).first()

    if user:
        # Existing user — update google_id if missing
        if not user.google_id:
            user.google_id = google_info["google_id"]
            user.is_google_user = True
            db.commit()
    else:
        # New user — auto-generate username from email
        base_username = google_info["email"].split("@")[0].lower()
        base_username = "".join(c for c in base_username if c.isalnum() or c == "_")
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=google_info["email"].lower(),
            first_name=google_info["first_name"] or "User",
            last_name=google_info["last_name"] or "",
            is_google_user=True,
            google_id=google_info["google_id"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT
    token = create_access_token(data={"sub": user.username})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse.model_validate(current_user)
