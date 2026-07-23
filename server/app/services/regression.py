"""Regression algorithm services."""

import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
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
    dataset_type: str = "linear",
    positive: bool = False,
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
        dataset_type=dataset_type,
    )

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    # Train
    model = LinearRegression(fit_intercept=fit_intercept, positive=positive)
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


def train_lasso_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    alpha: float = 1.0,
    degree: int = 15,
    fit_intercept: bool = True,
) -> dict:
    """Train a lasso regression model on synthetic non-linear data to show L1 regularization.

    Lasso differs from Ridge by driving some coefficients exactly to zero,
    effectively performing feature selection.
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

    # Train Lasso model (max_iter higher for convergence at high degree)
    model = Lasso(alpha=alpha, fit_intercept=fit_intercept, max_iter=10000)
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

    # Coefficient analysis — key difference from Ridge
    coefs = model.coef_
    intercept = model.intercept_ if fit_intercept else 0.0
    n_zero_coefs = int(np.sum(np.abs(coefs) < 1e-10))
    n_nonzero_coefs = len(coefs) - n_zero_coefs

    # Format polynomial equation (show first 5 non-zero terms)
    nonzero_terms = [(i, c) for i, c in enumerate(coefs) if abs(c) > 1e-10]
    equation = f"y = {intercept:.2f}"
    for idx, (i, coef) in enumerate(nonzero_terms[:5]):
        power = i + 1
        sign = "+" if coef >= 0 else "-"
        equation += f" {sign} {abs(coef):.2f}x^{power}"
    if len(nonzero_terms) > 5:
        equation += " + ..."

    # Original X for plotting
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
        "n_zero_coefs": n_zero_coefs,
        "n_nonzero_coefs": n_nonzero_coefs,
        "total_coefs": len(coefs),
        "model_params": {
            "fit_intercept": fit_intercept,
            "alpha": alpha,
            "degree": degree,
            "n_samples": n_samples,
            "noise": noise,
            "test_size": test_size,
        },
    }


def train_elasticnet_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    alpha: float = 1.0,
    l1_ratio: float = 0.5,
    degree: int = 15,
    fit_intercept: bool = True,
) -> dict:
    """Train an ElasticNet regression model on synthetic non-linear data.

    ElasticNet combines L1 (Lasso) and L2 (Ridge) penalties.
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

    # Train ElasticNet model
    model = ElasticNet(alpha=alpha, l1_ratio=l1_ratio, fit_intercept=fit_intercept, max_iter=10000)
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

    # Coefficient analysis
    coefs = model.coef_
    intercept = model.intercept_ if fit_intercept else 0.0
    n_zero_coefs = int(np.sum(np.abs(coefs) < 1e-10))
    n_nonzero_coefs = len(coefs) - n_zero_coefs

    # Format polynomial equation
    nonzero_terms = [(i, c) for i, c in enumerate(coefs) if abs(c) > 1e-10]
    equation = f"y = {intercept:.2f}"
    for idx, (i, coef) in enumerate(nonzero_terms[:5]):
        power = i + 1
        sign = "+" if coef >= 0 else "-"
        equation += f" {sign} {abs(coef):.2f}x^{power}"
    if len(nonzero_terms) > 5:
        equation += " + ..."

    # Original X for plotting
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
        "n_zero_coefs": n_zero_coefs,
        "n_nonzero_coefs": n_nonzero_coefs,
        "total_coefs": len(coefs),
        "model_params": {
            "fit_intercept": fit_intercept,
            "alpha": alpha,
            "l1_ratio": l1_ratio,
            "degree": degree,
            "n_samples": n_samples,
            "noise": noise,
            "test_size": test_size,
        },
    }


def compute_regularization_path(
    n_samples: int = 100,
    noise: float = 10.0,
    random_state: int = 42,
    degree: int = 10,
    model_type: str = "ridge",
    n_alphas: int = 50,
    alpha_max: float = 100.0,
) -> dict:
    """Sweep alpha from ~0 to alpha_max and record coefficients at each step."""
    X, y = generate_polynomial_data(
        n_samples=n_samples, noise=noise, random_state=random_state, x_range=(-5, 5)
    )
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)

    alphas = np.logspace(-3, np.log10(alpha_max), n_alphas).tolist()
    coef_paths: list[list[float]] = []  # list of coefficient vectors

    ModelClass = Ridge if model_type == "ridge" else (Lasso if model_type == "lasso" else ElasticNet)

    for a in alphas:
        kwargs = {"alpha": a, "fit_intercept": True}
        if model_type in ["lasso", "elasticnet"]:
            kwargs["max_iter"] = 10000
        if model_type == "elasticnet":
            kwargs["l1_ratio"] = 0.5  # Just use 0.5 for the path if not provided
            
        m = ModelClass(**kwargs)
        m.fit(X_poly, y)
        coef_paths.append(m.coef_.tolist())

    # Transpose so each series is one coefficient across all alphas
    n_coefs = len(coef_paths[0])
    series = []
    for i in range(n_coefs):
        series.append({
            "name": f"x^{i+1}",
            "values": [cp[i] for cp in coef_paths],
        })

    return {
        "alphas": alphas,
        "series": series,
        "model_type": model_type,
        "degree": degree,
    }


def compute_bias_variance_curve(
    n_samples: int = 100,
    noise: float = 10.0,
    random_state: int = 42,
    test_size: float = 0.2,
    sweep_param: str = "degree",
    model_type: str = "polynomial",
    alpha: float = 1.0,
) -> dict:
    """Sweep degree (or alpha) and compute train/test MSE at each step."""
    X, y = generate_polynomial_data(
        n_samples=n_samples, noise=noise, random_state=random_state, x_range=(-5, 5)
    )

    if sweep_param == "degree":
        sweep_values = list(range(1, 21))
    else:  # sweep alpha
        sweep_values = np.logspace(-3, 2, 30).tolist()

    train_errors = []
    test_errors = []

    for val in sweep_values:
        deg = int(val) if sweep_param == "degree" else 10
        alph = val if sweep_param == "alpha" else alpha

        poly = PolynomialFeatures(degree=deg, include_bias=False)
        X_poly = poly.fit_transform(X)
        X_tr, X_te, y_tr, y_te = train_test_split(
            X_poly, y, test_size=test_size, random_state=random_state
        )

        if model_type == "polynomial":
            m = LinearRegression()
        elif model_type == "ridge":
            m = Ridge(alpha=alph)
        elif model_type == "lasso":
            m = Lasso(alpha=alph, max_iter=10000)
        else:
            m = ElasticNet(alpha=alph, l1_ratio=0.5, max_iter=10000)

        m.fit(X_tr, y_tr)
        train_errors.append(float(mean_squared_error(y_tr, m.predict(X_tr))))
        test_errors.append(float(mean_squared_error(y_te, m.predict(X_te))))

    return {
        "sweep_values": [float(v) for v in sweep_values],
        "train_mse": train_errors,
        "test_mse": test_errors,
        "sweep_param": sweep_param,
        "model_type": model_type,
    }


def compute_learning_curve(
    noise: float = 10.0,
    random_state: int = 42,
    test_size: float = 0.2,
    degree: int = 3,
    alpha: float = 1.0,
    model_type: str = "polynomial",
    max_samples: int = 300,
) -> dict:
    """Vary the number of training samples and compute train/test MSE."""
    # Generate a large pool of data
    X, y = generate_polynomial_data(
        n_samples=max_samples, noise=noise, random_state=random_state, x_range=(-5, 5)
    )

    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X_poly, y, test_size=test_size, random_state=random_state
    )

    sample_counts = list(range(degree + 2, len(X_tr), max(1, len(X_tr) // 25)))
    if sample_counts[-1] != len(X_tr):
        sample_counts.append(len(X_tr))

    train_errors = []
    test_errors = []

    for n in sample_counts:
        X_sub = X_tr[:n]
        y_sub = y_tr[:n]

        if model_type == "polynomial":
            m = LinearRegression()
        elif model_type == "ridge":
            m = Ridge(alpha=alpha)
        elif model_type == "lasso":
            m = Lasso(alpha=alpha, max_iter=10000)
        else:
            m = ElasticNet(alpha=alpha, l1_ratio=0.5, max_iter=10000)

        m.fit(X_sub, y_sub)
        train_errors.append(float(mean_squared_error(y_sub, m.predict(X_sub))))
        test_errors.append(float(mean_squared_error(y_te, m.predict(X_te))))

    return {
        "sample_counts": sample_counts,
        "train_mse": train_errors,
        "test_mse": test_errors,
        "model_type": model_type,
        "degree": degree,
    }


def train_knn_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "linear",
    n_neighbors: int = 5,
    weights: str = "uniform",
    p: int = 2,
    algorithm: str = "auto",
    leaf_size: int = 30,
    metric: str = "minkowski",
) -> dict:
    """Train a KNN Regression model and return results and plot data."""
    X, y = generate_regression_data(
        n_samples=n_samples, noise=noise, random_state=random_state, x_range=(0, 10),
        dataset_type=dataset_type,
    )
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model = KNeighborsRegressor(
        n_neighbors=n_neighbors,
        weights=weights,
        p=p,
        algorithm=algorithm,
        leaf_size=leaf_size,
        metric=metric,
    )
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Sort data for smooth line plotting
    sort_idx = np.argsort(X_train.ravel())
    x_train_sorted = X_train[sort_idx]
    
    # We want a high-res line for the prediction boundary
    x_line = np.linspace(X.min() - 1, X.max() + 1, 300).reshape(-1, 1)
    y_line = model.predict(x_line)

    metrics = {
        "r2_score": float(r2_score(y_test, y_test_pred)),
        "mse": float(mean_squared_error(y_test, y_test_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
        "mae": float(mean_absolute_error(y_test, y_test_pred)),
    }

    plot_data = {
        "x_train": X_train.ravel().tolist(),
        "y_train": y_train.tolist(),
        "x_test": X_test.ravel().tolist(),
        "y_test": y_test.tolist(),
        "x_line": x_line.ravel().tolist(),
        "y_line": y_line.tolist(),
        "y_train_pred": y_train_pred.tolist(),
        "y_test_pred": y_test_pred.tolist(),
        "residuals_train": (y_train - y_train_pred).tolist(),
        "residuals_test": (y_test - y_test_pred).tolist(),
    }

    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "equation": f"KNN(k={n_neighbors}, weights={weights})",
        "coefficients": [],
        "intercept": 0,
        "model_params": model.get_params(),
    }


def train_svr(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    C: float = 1.0,
    kernel: str = "rbf",
    gamma: str = "scale",
    epsilon: float = 0.1,
    degree: int = 3,
) -> dict:
    """Train a Support Vector Regressor and return results.

    SVR fits data within an epsilon-tube. Points inside the tube
    incur no penalty; only those outside contribute to the loss.
    """
    X, y = generate_polynomial_data(
        n_samples=n_samples, noise=noise, random_state=random_state, x_range=(-5, 5)
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model = SVR(
        C=C,
        kernel=kernel,
        gamma=gamma,
        epsilon=epsilon,
        degree=degree,
    )
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Smooth prediction line
    x_line = np.linspace(X.min(), X.max(), 300).reshape(-1, 1)
    y_line = model.predict(x_line)

    # Epsilon tube boundaries
    y_line_upper = y_line + epsilon
    y_line_lower = y_line - epsilon

    # Support vectors
    sv_indices = model.support_
    sv_x = X_train[sv_indices].ravel().tolist()
    sv_y = y_train[sv_indices].tolist()

    metrics = {
        "r2_score": float(r2_score(y_test, y_test_pred)),
        "mse": float(mean_squared_error(y_test, y_test_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
        "mae": float(mean_absolute_error(y_test, y_test_pred)),
    }

    plot_data = {
        "x_train": X_train.ravel().tolist(),
        "y_train": y_train.tolist(),
        "x_test": X_test.ravel().tolist(),
        "y_test": y_test.tolist(),
        "x_line": x_line.ravel().tolist(),
        "y_line": y_line.tolist(),
        "y_line_upper": y_line_upper.tolist(),
        "y_line_lower": y_line_lower.tolist(),
        "y_train_pred": y_train_pred.tolist(),
        "y_test_pred": y_test_pred.tolist(),
        "residuals_train": (y_train - y_train_pred).tolist(),
        "residuals_test": (y_test - y_test_pred).tolist(),
        "support_vectors_x": sv_x,
        "support_vectors_y": sv_y,
    }

    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "equation": f"SVR(C={C}, kernel={kernel}, ε={epsilon})",
        "n_support_vectors": len(sv_indices),
        "coefficients": [],
        "intercept": float(model.intercept_[0]) if hasattr(model.intercept_, '__len__') else float(model.intercept_),
        "model_params": model.get_params(),
    }


# ─── Decision Tree Regression ─────────────────────────────────

def train_decision_tree_regression(
    n_samples: int = 100,
    noise: float = 10.0,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "quadratic",
    criterion: str = "squared_error",
    splitter: str = "best",
    max_depth: int | None = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: str | None = None,
    max_leaf_nodes: int | None = None,
    min_impurity_decrease: float = 0.0,
) -> dict:
    """Train a Decision Tree Regressor and return results.

    Decision trees for regression predict continuous values by averaging
    the target in each leaf region. The tree partitions the feature space
    into axis-aligned rectangular regions.
    """
    X, y = generate_regression_data(
        n_samples=n_samples, noise=noise, random_state=random_state,
        x_range=(-5, 5), dataset_type=dataset_type,
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model = DecisionTreeRegressor(
        criterion=criterion,
        splitter=splitter,
        max_depth=max_depth if max_depth and max_depth > 0 else None,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        max_features=max_features if max_features and max_features != "none" else None,
        max_leaf_nodes=max_leaf_nodes if max_leaf_nodes and max_leaf_nodes > 0 else None,
        min_impurity_decrease=min_impurity_decrease,
        random_state=random_state,
    )
    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Smooth prediction line
    x_line = np.linspace(X.min(), X.max(), 500).reshape(-1, 1)
    y_line = model.predict(x_line)

    metrics = {
        "r2_score": float(r2_score(y_test, y_test_pred)),
        "mse": float(mean_squared_error(y_test, y_test_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
        "mae": float(mean_absolute_error(y_test, y_test_pred)),
    }

    plot_data = {
        "x_train": X_train.ravel().tolist(),
        "y_train": y_train.tolist(),
        "x_test": X_test.ravel().tolist(),
        "y_test": y_test.tolist(),
        "x_line": x_line.ravel().tolist(),
        "y_line": y_line.tolist(),
        "y_train_pred": y_train_pred.tolist(),
        "y_test_pred": y_test_pred.tolist(),
        "residuals_train": (y_train - y_train_pred).tolist(),
        "residuals_test": (y_test - y_test_pred).tolist(),
    }

    # Extract tree structure for visualization
    def build_tree_dict(node_id: int):
        node_id = int(node_id)
        if node_id == -1:
            return None
        tree = model.tree_
        is_leaf = bool(
            tree.children_left[node_id] == -1
            and tree.children_right[node_id] == -1
        )
        node_dict = {
            "node_id": node_id,
            "samples": int(tree.n_node_samples[node_id]),
            "value": round(float(tree.value[node_id][0][0]), 3),
            "impurity": round(float(tree.impurity[node_id]), 3),
            "is_leaf": is_leaf,
        }
        if not is_leaf:
            node_dict["feature"] = f"Feature {tree.feature[node_id]}"
            node_dict["threshold"] = round(float(tree.threshold[node_id]), 3)
            node_dict["left"] = build_tree_dict(int(tree.children_left[node_id]))
            node_dict["right"] = build_tree_dict(int(tree.children_right[node_id]))
        return node_dict

    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "equation": f"DecisionTreeRegressor(max_depth={max_depth}, criterion={criterion})",
        "coefficients": [],
        "intercept": 0,
        "model_params": model.get_params(),
        "tree_structure": build_tree_dict(0),
    }
