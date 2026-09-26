import pandas as pd
import numpy as np
from io import StringIO
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error
from sklearn.impute import SimpleImputer

# Models
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neural_network import MLPClassifier, MLPRegressor

router = APIRouter()

@router.post("/train")
async def train_automl(
    file: UploadFile = File(...),
    target_column: str = Form(...)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    if target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found in the dataset.")

    # Drop fully empty columns
    df = df.dropna(axis=1, how='all')

    # Basic preprocessing
    y = df[target_column]
    X = df.drop(columns=[target_column])

    # Convert non-numeric features to numeric
    for col in X.columns:
        if X[col].dtype == 'object':
            X[col] = LabelEncoder().fit_transform(X[col].astype(str))

    # Handle missing values
    imputer = SimpleImputer(strategy='mean')
    X = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

    # Determine task type (classification or regression)
    is_classification = False
    if y.dtype == 'object' or len(y.unique()) < 20:
        is_classification = True
        if y.dtype == 'object':
            y = LabelEncoder().fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = []

    if is_classification:
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000),
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
            "Support Vector Machine": SVC(probability=True, random_state=42),
            "Multi-Layer Perceptron": MLPClassifier(hidden_layer_sizes=(100,), max_iter=1000, random_state=42)
        }
        
        for name, model in models.items():
            try:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                acc = accuracy_score(y_test, y_pred)
                f1 = f1_score(y_test, y_pred, average='weighted')
                results.append({
                    "name": name,
                    "score": acc,
                    "metric_name": "Accuracy",
                    "secondary_score": f1,
                    "secondary_metric_name": "F1 Score"
                })
            except Exception as e:
                print(f"Model {name} failed: {e}")
        
        # Sort by Accuracy descending
        results.sort(key=lambda x: x['score'], reverse=True)
        task = "Classification"

    else:
        models = {
            "Linear Regression": LinearRegression(),
            "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=42),
            "Support Vector Regressor": SVR(),
            "Multi-Layer Perceptron Regressor": MLPRegressor(hidden_layer_sizes=(100,), max_iter=1000, random_state=42)
        }
        
        for name, model in models.items():
            try:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                r2 = r2_score(y_test, y_pred)
                rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                results.append({
                    "name": name,
                    "score": r2,
                    "metric_name": "R2 Score",
                    "secondary_score": rmse,
                    "secondary_metric_name": "RMSE"
                })
            except Exception as e:
                print(f"Model {name} failed: {e}")
        
        # Sort by R2 descending
        results.sort(key=lambda x: x['score'], reverse=True)
        task = "Regression"

    if not results:
        raise HTTPException(status_code=500, detail="All models failed to train.")

    return {
        "task": task,
        "champion": results[0],
        "leaderboard": results,
        "dataset_stats": {
            "rows": len(df),
            "features": len(X.columns)
        }
    }
