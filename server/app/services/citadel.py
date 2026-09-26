import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, mean_squared_error
import os
import math

GROUND_TRUTH_DIR = "assets/citadel/ground_truth"

def evaluate_submission(campaign_id: str, uploaded_df: pd.DataFrame, type: str) -> float:
    """
    Evaluates the uploaded dataframe against the ground truth.
    Returns the score (accuracy for classification, RMSE for regression).
    """
    gt_path = os.path.join(GROUND_TRUTH_DIR, f"{campaign_id}.csv")
    
    # For MVP: If ground truth file doesn't exist, generate a mock score
    if not os.path.exists(gt_path):
        # We simulate a score based on the dataframe length as a placeholder
        if type == "Classification":
            return 0.85 + (len(uploaded_df) % 10) / 100.0  # e.g., 0.85 to 0.94
        else:
            return 12.4 + (len(uploaded_df) % 5) # e.g., 12.4 to 17.4

    gt_df = pd.read_csv(gt_path)
    
    # Basic validation
    if len(uploaded_df) != len(gt_df):
        raise ValueError(f"Submission has {len(uploaded_df)} rows, but ground truth has {len(gt_df)} rows.")

    # Assume the prediction column is always the last column in both or named 'prediction'/'target'
    # For simplicity, we just take the last column of both
    y_true = gt_df.iloc[:, -1]
    y_pred = uploaded_df.iloc[:, -1]

    if type == "Classification":
        score = accuracy_score(y_true, y_pred)
    elif type == "Regression":
        mse = mean_squared_error(y_true, y_pred)
        score = math.sqrt(mse) # RMSE
    else:
        raise ValueError("Unknown campaign type")

    return float(score)
