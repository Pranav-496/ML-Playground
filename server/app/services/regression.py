"""Regression algorithm services."""

import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from sklearn.preprocessing import PolynomialFeatures

from app.utils.data_generation import generate_regression_data, generate_polynomial_data


def _gradient_descent(
    X: np.ndarray,
    y: np.ndarray,
    learning_rate: float,
    epochs: int,
    gd_type: str = "batch",
    batch_size: int = 32,
    random_state: int = 42,
) -> dict:
    """Run gradient descent from scratch.

    Args:
        X: Feature matrix (n_samples, 1) — already raw, NOT augmented.
        y: Target vector.
        learning_rate: Step size.
        epochs: Number of passes over the data.
        gd_type: One of "batch", "stochastic", "mini-batch".
        batch_size: Only used when gd_type == "mini-batch".
        random_state: Seed for shuffling.

    Returns:
        Dictionary with loss_history, param_history, final w and b.
    """
    rng = np.random.RandomState(random_state)
    n = len(y)

    # Initialize parameters randomly (small values)
    w = rng.randn() * 0.01
    b = rng.randn() * 0.01

    loss_history: list[float] = []
    param_history: list[dict] = []  # [{w, b}, ...]

    x_flat = X.ravel()

    for epoch in range(epochs):
        if gd_type == "batch":
            # Compute gradients over entire dataset
            y_pred = w * x_flat + b
            dw = -(2.0 / n) * np.sum(x_flat * (y - y_pred))
            db = -(2.0 / n) * np.sum(y - y_pred)
            w -= learning_rate * dw
            b -= learning_rate * db

        elif gd_type == "stochastic":
            # Shuffle and update per sample
            indices = rng.permutation(n)
            for i in indices:
                y_pred_i = w * x_flat[i] + b
                error = y[i] - y_pred_i
                dw = -2.0 * x_flat[i] * error
                db = -2.0 * error
                w -= learning_rate * dw
                b -= learning_rate * db

        elif gd_type == "mini-batch":
            indices = rng.permutation(n)
            for start in range(0, n, batch_size):
                end = min(start + batch_size, n)
                batch_idx = indices[start:end]
                x_batch = x_flat[batch_idx]
                y_batch = y[batch_idx]
                bs = len(batch_idx)

                y_pred_batch = w * x_batch + b
                dw = -(2.0 / bs) * np.sum(x_batch * (y_batch - y_pred_batch))
                db = -(2.0 / bs) * np.sum(y_batch - y_pred_batch)
                w -= learning_rate * dw
                b -= learning_rate * db

        # Record loss (MSE over full dataset) at end of epoch
        y_pred_all = w * x_flat + b
        mse = float(np.mean((y - y_pred_all) ** 2))
        loss_history.append(round(mse, 6))
        param_history.append({"w": round(float(w), 6), "b": round(float(b), 6)})

    return {
        "w": float(w),
        "b": float(b),
        "loss_history": loss_history,
        "param_history": param_history,
    }


def train_linear_regression_gd(
    n_samples: int = 100,
    noise: float = 10.0,
    learning_rate: float = 0.01,
    epochs: int = 100,
    gd_type: str = "batch",
    batch_size: int = 32,
    random_state: int = 42,
) -> dict:
    """Train linear regression using gradient descent and return visualisation data.

    Returns metrics, loss curve, parameter trajectory, regression line data,
    and the OLS solution for comparison.
    """
    X, y = generate_regression_data(
        n_samples=n_samples, noise=noise, random_state=random_state
    )

    # Normalise X for stable gradient descent
    x_mean = float(X.mean())
    x_std = float(X.std())
    X_norm = (X - x_mean) / x_std

    # Run gradient descent on normalised data
    gd_result = _gradient_descent(
        X_norm,
        y,
        learning_rate=learning_rate,
        epochs=epochs,
        gd_type=gd_type,
        batch_size=batch_size,
        random_state=random_state,
    )

    # Convert GD params back to original scale
    w_norm = gd_result["w"]
    b_norm = gd_result["b"]
    w_orig = w_norm / x_std
    b_orig = b_norm - w_norm * x_mean / x_std

    # Regression line
    x_line = np.linspace(X.min(), X.max(), 200).reshape(-1, 1)
    y_line_gd = (w_orig * x_line.ravel() + b_orig).tolist()

    # OLS for comparison
    ols_model = LinearRegression()
    ols_model.fit(X, y)
    y_line_ols = ols_model.predict(x_line).tolist()
    ols_w = float(ols_model.coef_[0])
    ols_b = float(ols_model.intercept_)

    # Predictions and metrics
    y_pred = w_orig * X.ravel() + b_orig
    r2 = r2_score(y, y_pred)
    mse = mean_squared_error(y, y_pred)
    rmse = float(np.sqrt(mse))
    mae = mean_absolute_error(y, y_pred)

    sign_gd = "+" if b_orig >= 0 else "-"
    sign_ols = "+" if ols_b >= 0 else "-"

    return {
        "metrics": {
            "r2_score": round(r2, 6),
            "mse": round(mse, 6),
            "rmse": round(rmse, 6),
            "mae": round(mae, 6),
        },
        "gd_equation": f"y = {w_orig:.4f}x {sign_gd} {abs(b_orig):.4f}",
        "ols_equation": f"y = {ols_w:.4f}x {sign_ols} {abs(ols_b):.4f}",
        "loss_history": gd_result["loss_history"],
        "param_history": gd_result["param_history"],
        "plot_data": {
            "x_data": X.ravel().tolist(),
            "y_data": y.tolist(),
            "x_line": x_line.ravel().tolist(),
            "y_line_gd": y_line_gd,
            "y_line_ols": y_line_ols,
        },
        "final_params": {
            "gd": {"w": round(w_orig, 6), "b": round(b_orig, 6)},
            "ols": {"w": round(ols_w, 6), "b": round(ols_b, 6)},
        },
        "model_config": {
            "learning_rate": learning_rate,
            "epochs": epochs,
            "gd_type": gd_type,
            "batch_size": batch_size,
            "n_samples": n_samples,
            "noise": noise,
        },
    }


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


def train_polynomial_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    degree: int = 2,
    fit_intercept: bool = True,
) -> dict:
    """Train a polynomial regression model on synthetic non-linear data.

    Args:
        n_samples: Number of data points.
        noise: Noise level in the data.
        test_size: Fraction of data for testing.
        random_state: Random seed.
        degree: Degree of the polynomial features.
        fit_intercept: Whether to fit the intercept.

    Returns:
        Dictionary with metrics, plot data, equation, and model parameters.
    """
    # Generate non-linear data
    X, y = generate_polynomial_data(
        n_samples=n_samples,
        noise=noise,
        random_state=random_state,
        x_range=(-5, 5),
    )

    # Transform features to polynomial features
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_poly, y, test_size=test_size, random_state=random_state
    )

    # Train
    model = LinearRegression(fit_intercept=fit_intercept)
    model.fit(X_train, y_train)

    # Predict
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Regression line for plotting
    x_line = np.linspace(X.min(), X.max(), 200).reshape(-1, 1)
    x_line_poly = poly.transform(x_line)
    y_line = model.predict(x_line_poly)

    # Metrics
    r2 = r2_score(y_test, y_test_pred)
    mse = mean_squared_error(y_test, y_test_pred)
    rmse = float(np.sqrt(mse))
    mae = mean_absolute_error(y_test, y_test_pred)

    # Residuals
    residuals_train = (y_train - y_train_pred).tolist()
    residuals_test = (y_test - y_test_pred).tolist()

    # Equation
    coefs = model.coef_
    intercept = model.intercept_ if fit_intercept else 0.0
    
    # Format polynomial equation
    equation = f"y = {intercept:.2f}"
    for i, coef in enumerate(coefs):
        power = i + 1
        sign = "+" if coef >= 0 else "-"
        equation += f" {sign} {abs(coef):.2f}x^{power}"

    # We need the original X for plotting, so we extract it from the first column of X_poly
    # since include_bias=False, X_poly[:, 0] is exactly X.
    X_train_orig = X_train[:, 0]
    X_test_orig = X_test[:, 0]

    return {
        "metrics": {
            "r2_score": round(r2, 6),
            "mse": round(mse, 6),
            "rmse": round(rmse, 6),
            "mae": round(mae, 6),
        },
        "plot_data": {
            "x_train": X_train_orig.tolist(),
            "y_train": y_train.tolist(),
            "x_test": X_test_orig.tolist(),
            "y_test": y_test.tolist(),
            "x_line": x_line.ravel().tolist(),
            "y_line": y_line.tolist(),
            "y_train_pred": y_train_pred.tolist(),
            "y_test_pred": y_test_pred.tolist(),
            "residuals_train": residuals_train,
            "residuals_test": residuals_test,
        },
        "equation": equation,
        "coefficients": coefs.tolist(),
        "intercept": float(intercept),
        "model_params": {
            "fit_intercept": fit_intercept,
            "degree": degree,
            "n_samples": n_samples,
            "noise": noise,
            "test_size": test_size,
        },
    }


def train_ridge_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    alpha: float = 1.0,
    degree: int = 15,
    fit_intercept: bool = True,
) -> dict:
    """Train a ridge regression model on synthetic non-linear data to show regularization.

    Args:
        n_samples: Number of data points.
        noise: Noise level in the data.
        test_size: Fraction of data for testing.
        random_state: Random seed.
        alpha: Regularization strength.
        degree: Polynomial degree (default high to show regularization).
        fit_intercept: Whether to fit the intercept.

    Returns:
        Dictionary with metrics, plot data, equation, and model parameters.
    """
    # Generate non-linear data
    X, y = generate_polynomial_data(
        n_samples=n_samples,
        noise=noise,
        random_state=random_state,
        x_range=(-5, 5),
    )

    # Transform features to polynomial features
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_poly, y, test_size=test_size, random_state=random_state
    )

    # Train Ridge model
    model = Ridge(alpha=alpha, fit_intercept=fit_intercept)
    model.fit(X_train, y_train)

    # Predict
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Regression line for plotting
    x_line = np.linspace(X.min(), X.max(), 200).reshape(-1, 1)
    x_line_poly = poly.transform(x_line)
    y_line = model.predict(x_line_poly)

    # Metrics
    r2 = r2_score(y_test, y_test_pred)
    mse = mean_squared_error(y_test, y_test_pred)
    rmse = float(np.sqrt(mse))
    mae = mean_absolute_error(y_test, y_test_pred)

    # Residuals
    residuals_train = (y_train - y_train_pred).tolist()
    residuals_test = (y_test - y_test_pred).tolist()

    # Equation
    coefs = model.coef_
    intercept = model.intercept_ if fit_intercept else 0.0
    
    # Format polynomial equation (show first 5 terms)
    equation = f"y = {intercept:.2f}"
    for i, coef in enumerate(coefs[:5]):
        power = i + 1
        sign = "+" if coef >= 0 else "-"
        equation += f" {sign} {abs(coef):.2f}x^{power}"
    if len(coefs) > 5:
        equation += " + ..."

    # Original X for plotting (from first column since include_bias=False)
    X_train_orig = X_train[:, 0]
    X_test_orig = X_test[:, 0]

    return {
        "metrics": {
            "r2_score": round(r2, 6),
            "mse": round(mse, 6),
            "rmse": round(rmse, 6),
            "mae": round(mae, 6),
        },
        "plot_data": {
            "x_train": X_train_orig.tolist(),
            "y_train": y_train.tolist(),
            "x_test": X_test_orig.tolist(),
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
            "alpha": alpha,
            "degree": degree,
            "n_samples": n_samples,
            "noise": noise,
            "test_size": test_size,
        },
    }
