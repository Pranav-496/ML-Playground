"""Synthetic data generators for ML algorithms."""

import numpy as np
from typing import Tuple


def generate_regression_data(
    n_samples: int = 100,
    noise: float = 10.0,
    random_state: int = 42,
    x_range: Tuple[float, float] = (0, 10),
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic data for regression tasks.

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
    y = 3.0 * X.ravel() + 7.0 + rng.normal(0, noise, size=n_samples)
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
        dataset_type: 'blobs' or 'moons'

    Returns:
        Tuple of (X, y) numpy arrays.
    """
    if dataset_type == "moons":
        from sklearn.datasets import make_moons
        # For moons, cluster_std represents the noise level (usually 0.1 to 0.5 is good, but we can scale it)
        # cluster_std from our slider goes from 0.1 to 5.0. We can scale it down for moons.
        noise = cluster_std * 0.1 
        X, y = make_moons(n_samples=n_samples, noise=noise, random_state=random_state)
    else:
        from sklearn.datasets import make_blobs
        X, y = make_blobs(
            n_samples=n_samples,
            n_features=n_features,
            centers=n_classes,
            cluster_std=cluster_std,
            random_state=random_state,
        )
    return X, y


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
