"""SQLAlchemy User model for the database."""

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for Google OAuth users
    is_google_user = Column(Boolean, default=False)
    google_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
