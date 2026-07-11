"""Regression algorithm services."""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from app.utils.data_generation import generate_regression_data


def train_linear_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    fit_intercept: bool = True,
) -> dict:
    """Train a linear regression model on synthetic data.

    Args:
        n_samples: Number of data points.
        noise: Noise level in the data.
        test_size: Fraction of data for testing.
        random_state: Random seed.
        fit_intercept: Whether to fit the intercept.

    Returns:
        Dictionary with metrics, plot data, equation, and model parameters.
    """
    # Generate data
    X, y = generate_regression_data(
        n_samples=n_samples,
        noise=noise,
        random_state=random_state,
    )

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    # Train
    model = LinearRegression(fit_intercept=fit_intercept)
    model.fit(X_train, y_train)

    # Predict
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Regression line for plotting
    x_line = np.linspace(X.min(), X.max(), 200).reshape(-1, 1)
    y_line = model.predict(x_line)

    # Metrics
    r2 = r2_score(y_test, y_test_pred)
    mse = mean_squared_error(y_test, y_test_pred)
    rmse = float(np.sqrt(mse))
    mae = mean_absolute_error(y_test, y_test_pred)

    # Residuals
    residuals_train = (y_train - y_train_pred).tolist()
    residuals_test = (y_test - y_test_pred).tolist()

    # Equation
    coef = model.coef_[0]
    intercept = model.intercept_ if fit_intercept else 0.0
    sign = "+" if intercept >= 0 else "-"
    equation = f"y = {coef:.4f}x {sign} {abs(intercept):.4f}"

    return {
        "metrics": {
            "r2_score": round(r2, 6),
            "mse": round(mse, 6),
            "rmse": round(rmse, 6),
            "mae": round(mae, 6),
        },
        "plot_data": {
            "x_train": X_train.ravel().tolist(),
            "y_train": y_train.tolist(),
            "x_test": X_test.ravel().tolist(),
            "y_test": y_test.tolist(),
            "x_line": x_line.ravel().tolist(),
            "y_line": y_line.tolist(),
            "y_train_pred": y_train_pred.tolist(),
            "y_test_pred": y_test_pred.tolist(),
            "residuals_train": residuals_train,
            "residuals_test": residuals_test,
        },
        "equation": equation,
        "coefficients": model.coef_.tolist(),
        "intercept": float(model.intercept_) if fit_intercept else 0.0,
        "model_params": {
            "fit_intercept": fit_intercept,
            "n_samples": n_samples,
            "noise": noise,
            "test_size": test_size,
        },
    }
