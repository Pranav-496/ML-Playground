"""Pydantic schemas for authentication requests/responses."""

from pydantic import BaseModel, EmailStr, field_validator
import re


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    first_name: str
    last_name: str
    username: str
    email: str
    password: str
    confirm_password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 30:
            raise ValueError("Username must be at most 30 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_names(cls, v: str) -> str:
        if len(v.strip()) < 1:
            raise ValueError("Name cannot be empty")
        if len(v) > 50:
            raise ValueError("Name must be at most 50 characters")
        return v.strip()


class LoginRequest(BaseModel):
    """Schema for user login. Accepts either username or email."""
    identifier: str  # username or email
    password: str


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth login."""
    credential: str  # The ID token from Google


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Public user data returned in API responses."""
    username: str
    email: str
    first_name: str
    last_name: str
    is_google_user: bool

    class Config:
        from_attributes = True


# Resolve forward reference
TokenResponse.model_rebuild()
