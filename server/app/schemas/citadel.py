from pydantic import BaseModel
from datetime import datetime

class SubmissionResponse(BaseModel):
    score: float
    message: str

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: float
    submitted_at: datetime
    first_name: str

    class Config:
        from_attributes = True
