import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from io import StringIO

from app.database import get_db
from app.models.citadel import CitadelSubmission
from app.schemas.citadel import SubmissionResponse, LeaderboardEntry
from app.services.citadel import evaluate_submission
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/projects/{campaign_id}/evaluate", response_model=SubmissionResponse)
async def evaluate_campaign_submission(
    campaign_id: str,
    campaign_type: str, # "Classification" or "Regression" passed as query param for MVP
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Accepts a CSV file of predictions, evaluates it against the ground truth,
    and stores the score in the leaderboard.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    try:
        score = evaluate_submission(campaign_id, df, campaign_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evaluation failed: {str(e)}")

    # Save to database
    submission = CitadelSubmission(
        username=current_user.username,
        campaign_id=campaign_id,
        score=score
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        score=score,
        message=f"Successfully evaluated! Your score is {score:.4f}"
    )

@router.get("/projects/{campaign_id}/leaderboard", response_model=List[LeaderboardEntry])
def get_campaign_leaderboard(
    campaign_id: str,
    campaign_type: str, # passed to determine sort order (accuracy DESC, RMSE ASC)
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Returns the top scores for a campaign.
    """
    # Fetch best score per user using a subquery or just fetch all and group in python for simplicity
    submissions = db.query(CitadelSubmission).filter(CitadelSubmission.campaign_id == campaign_id).all()
    
    if not submissions:
        return []

    # Get best score per user
    best_scores = {}
    for sub in submissions:
        username = sub.username
        # Note: In real app, we need to join User to get first_name. We'll handle this.
        # But wait, we have a relationship! sub.user.first_name
        first_name = sub.user.first_name if sub.user else username
        
        current_best = best_scores.get(username)
        if current_best is None:
            best_scores[username] = sub
        else:
            if campaign_type == "Classification" and sub.score > current_best.score:
                best_scores[username] = sub
            elif campaign_type == "Regression" and sub.score < current_best.score:
                best_scores[username] = sub

    # Sort
    sorted_subs = list(best_scores.values())
    if campaign_type == "Classification":
        sorted_subs.sort(key=lambda x: x.score, reverse=True)
    else:
        sorted_subs.sort(key=lambda x: x.score, reverse=False)

    # Take top `limit`
    top_subs = sorted_subs[:limit]

    return [
        LeaderboardEntry(
            rank=i + 1,
            username=sub.username,
            score=sub.score,
            submitted_at=sub.submitted_at,
            first_name=sub.user.first_name if sub.user else "Unknown"
        )
        for i, sub in enumerate(top_subs)
    ]

from sqlalchemy import func
from app.models.user import User

@router.get("/leaderboard/global")
def get_global_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns the global leaderboard across all campaigns (The Iron Throne).
    Ranks all users in the realm, even those with 0 campaigns.
    """
    results = (
        db.query(
            User.username,
            func.count(func.distinct(CitadelSubmission.campaign_id)).label("campaigns_conquered"),
            func.count(CitadelSubmission.id).label("total_submissions")
        )
        .outerjoin(CitadelSubmission, User.username == CitadelSubmission.username)
        .group_by(User.username)
        .order_by(
            func.count(func.distinct(CitadelSubmission.campaign_id)).desc(),
            func.count(CitadelSubmission.id).desc()
        )
        .limit(limit)
        .all()
    )
    
    leaderboard = []
    for i, res in enumerate(results):
        leaderboard.append({
            "rank": i + 1,
            "username": res.username,
            "campaigns_conquered": res.campaigns_conquered,
            "total_submissions": res.total_submissions
        })
    return leaderboard

from fastapi.responses import FileResponse

@router.get("/projects/{campaign_id}/kit")
async def download_kit(campaign_id: str):
    """
    Returns the ZIP file containing train.csv, test.csv, and instructions.txt.
    """
    file_path = os.path.join("assets", "citadel", "kits", f"{campaign_id}.zip")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Kit not found. Please run the generation script.")
    
    return FileResponse(
        path=file_path,
        filename=f"{campaign_id}_kit.zip",
        media_type="application/zip"
    )
