from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.user import User

class CitadelSubmission(Base):
    __tablename__ = "citadel_submissions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    campaign_id = Column(String, index=True, nullable=False)
    score = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
