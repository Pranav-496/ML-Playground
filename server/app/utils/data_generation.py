"""Synthetic data generators for ML algorithms."""

import numpy as np
from typing import Tuple


# ─── Regression Data Generators ──────────────────────────────────

def generate_regression_data(
    n_samples: int = 100,
    noise: float = 10.0,
    random_state: int = 42,
    x_range: Tuple[float, float] = (0, 10),
    dataset_type: str = "linear",
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic data for regression tasks.

    Args:
        n_samples: Number of data points to generate.
        noise: Standard deviation of Gaussian noise.
        random_state: Seed for reproducibility.
        x_range: Tuple of (min, max) for x values.
        dataset_type: One of 'linear', 'sinusoidal', 'exponential', 'step', 'quadratic'.

    Returns:
        Tuple of (X, y) numpy arrays.
    """
    rng = np.random.RandomState(random_state)
    X = rng.uniform(x_range[0], x_range[1], size=(n_samples, 1))
    x = X.ravel()

    if dataset_type == "sinusoidal":
        y = 3.0 * np.sin(1.5 * x) + 1.5 * np.cos(0.5 * x)
    elif dataset_type == "exponential":
        # Normalise x to [0, 3] range for reasonable exponential values
        x_norm = (x - x_range[0]) / (x_range[1] - x_range[0]) * 3.0
        y = 2.0 * np.exp(x_norm) - 5.0
    elif dataset_type == "step":
        y = np.where(x < (x_range[0] + x_range[1]) / 2, -3.0, 3.0).astype(float)
        # Add a smooth transition zone for visual interest
        mid = (x_range[0] + x_range[1]) / 2
        transition = 1.0 / (1.0 + np.exp(-5.0 * (x - mid)))
        y = -3.0 + 6.0 * transition
    elif dataset_type == "quadratic":
        y = 0.5 * x**2 - 3.0 * x + 2.0
    else:  # "linear"
        y = 3.0 * x + 7.0

    y += rng.normal(0, noise, size=n_samples)
    return X, y


def generate_polynomial_data(
    n_samples: int = 100,
    noise: float = 10.0,
    random_state: int = 42,
    x_range: Tuple[float, float] = (-5, 5),
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate non-linear synthetic data for polynomial regression tasks.

    Args:
        n_samples: Number of data points to generate.
        noise: Standard deviation of Gaussian noise.
        random_state: Seed for reproducibility.
        x_range: Tuple of (min, max) for x values.

    Returns:
        Tuple of (X, y) numpy arrays.
    """
    rng = np.random.RandomState(random_state)
    X = rng.uniform(x_range[0], x_range[1], size=(n_samples, 1))
    # True function: y = 0.5 * x^3 - 2 * x^2 - 3 * x + 10
    x_flat = X.ravel()
    y = 0.5 * (x_flat ** 3) - 2.0 * (x_flat ** 2) - 3.0 * x_flat + 10.0
    y += rng.normal(0, noise, size=n_samples)
    return X, y


# ─── Classification Data Generators ──────────────────────────────

def generate_classification_data(
    n_samples: int = 200,
    n_features: int = 2,
    n_classes: int = 2,
    random_state: int = 42,
    cluster_std: float = 1.5,
    dataset_type: str = "blobs",
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic data for classification tasks.

    Args:
        n_samples: Number of data points.
        n_features: Number of features (dimensions).
        n_classes: Number of classes.
        random_state: Seed for reproducibility.
        cluster_std: Standard deviation of clusters / noise for moons.
        dataset_type: One of 'blobs', 'moons', 'circles', 'xor', 'spirals', 'anisotropic'.

    Returns:
        Tuple of (X, y) numpy arrays.
    """
    rng = np.random.RandomState(random_state)

    if dataset_type == "moons":
        from sklearn.datasets import make_moons
        noise = cluster_std * 0.1
        X, y = make_moons(n_samples=n_samples, noise=noise, random_state=random_state)

    elif dataset_type == "circles":
        from sklearn.datasets import make_circles
        noise = cluster_std * 0.05
        X, y = make_circles(n_samples=n_samples, noise=noise, factor=0.5, random_state=random_state)

    elif dataset_type == "xor":
        # Generate XOR pattern: 4 Gaussian clusters in quadrants
        n_per = n_samples // 4
        remainder = n_samples - 4 * n_per
        noise = cluster_std * 0.3
        # Quadrant centers: (+,+), (-,-) → class 0; (+,-), (-,+) → class 1
        centers = np.array([[2, 2], [-2, -2], [2, -2], [-2, 2]], dtype=float)
        labels = np.array([0, 0, 1, 1])
        X_parts, y_parts = [], []
        for i in range(4):
            count = n_per + (1 if i < remainder else 0)
            X_parts.append(rng.normal(centers[i], noise, size=(count, 2)))
            y_parts.append(np.full(count, labels[i]))
        X = np.vstack(X_parts)
        y = np.concatenate(y_parts)
        # Shuffle
        idx = rng.permutation(len(y))
        X, y = X[idx], y[idx]

    elif dataset_type == "spirals":
        # Two intertwined spirals
        n_per = n_samples // 2
        noise = cluster_std * 0.15
        theta = np.sqrt(rng.rand(n_per)) * 3 * np.pi
        r_a = 2 * theta + np.pi
        x_a = r_a * np.cos(theta) + rng.normal(0, noise, n_per)
        y_a = r_a * np.sin(theta) + rng.normal(0, noise, n_per)

        r_b = -2 * theta - np.pi
        x_b = r_b * np.cos(theta) + rng.normal(0, noise, n_per)
        y_b = r_b * np.sin(theta) + rng.normal(0, noise, n_per)

        X = np.vstack([np.column_stack([x_a, y_a]), np.column_stack([x_b, y_b])])
        y = np.concatenate([np.zeros(n_per), np.ones(n_per)]).astype(int)
        # Normalise to reasonable range
        X = (X - X.mean(axis=0)) / X.std(axis=0) * 2
        idx = rng.permutation(len(y))
        X, y = X[idx], y[idx]

    elif dataset_type == "anisotropic":
        from sklearn.datasets import make_blobs
        X, y = make_blobs(
            n_samples=n_samples,
            n_features=2,
            centers=n_classes,
            cluster_std=cluster_std,
            random_state=random_state,
        )
        # Apply a random linear transformation to stretch clusters
        transformation = np.array([[0.6, -0.6], [-0.4, 0.8]])
        X = X @ transformation

    else:  # "blobs"
        from sklearn.datasets import make_blobs
        X, y = make_blobs(
            n_samples=n_samples,
            n_features=n_features,
            centers=n_classes,
            cluster_std=cluster_std,
            random_state=random_state,
        )

    return X, y


# ─── Clustering Data Generators ──────────────────────────────────

def generate_clustering_data(
    n_samples: int = 300,
    n_centers: int = 3,
    random_state: int = 42,
    cluster_std: float = 1.0,
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic data for clustering tasks.

    Args:
        n_samples: Number of data points.
        n_centers: Number of cluster centers.
        random_state: Seed for reproducibility.
        cluster_std: Standard deviation of clusters.

    Returns:
        Tuple of (X, true_labels) numpy arrays.
    """
    from sklearn.datasets import make_blobs

    X, y = make_blobs(
        n_samples=n_samples,
        centers=n_centers,
        cluster_std=cluster_std,
        random_state=random_state,
    )
    return X, y

