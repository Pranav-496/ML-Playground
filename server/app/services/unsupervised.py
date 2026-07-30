"""Unsupervised algorithm services — PCA, DBSCAN, K-Means."""

import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import make_blobs, make_moons, make_circles
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score


# ─── Data Generators ─────────────────────────────────────────────

def _generate_unsupervised_data(
    dataset_type: str = "blobs",
    n_samples: int = 300,
    noise: float = 1.0,
    n_centers: int = 3,
    random_state: int = 42,
    n_features: int = 2,
) -> tuple[np.ndarray, np.ndarray | None]:
    """Generate synthetic data for unsupervised learning.

    Returns:
        (X, true_labels) — true_labels is None if no ground truth.
    """
    if dataset_type == "moons":
        X, y = make_moons(n_samples=n_samples, noise=noise * 0.1, random_state=random_state)
        return X, y
    elif dataset_type == "circles":
        X, y = make_circles(n_samples=n_samples, noise=noise * 0.05, factor=0.5, random_state=random_state)
        return X, y
    elif dataset_type == "anisotropic":
        X, y = make_blobs(n_samples=n_samples, centers=n_centers, cluster_std=noise, random_state=random_state)  # type: ignore
        transformation = np.array([[0.6, -0.6], [-0.4, 0.8]])
        X = X @ transformation
        return X, y
    elif dataset_type == "varied":
        # Clusters with varying density
        rng = np.random.RandomState(random_state)
        n_per = n_samples // 3
        remainder = n_samples - 3 * n_per
        X1 = rng.normal(0, 0.5, size=(n_per, 2))
        X2 = rng.normal(4, 1.5, size=(n_per, 2))
        X3 = rng.normal(8, 0.8, size=(n_per + remainder, 2))
        X = np.vstack([X1, X2, X3])
        y = np.concatenate([np.zeros(n_per), np.ones(n_per), np.full(n_per + remainder, 2)])
        idx = rng.permutation(len(y))
        return X[idx], y[idx].astype(int)
    else:  # "blobs"
        X, y = make_blobs(
            n_samples=n_samples, centers=n_centers,
            cluster_std=noise, random_state=random_state,
            n_features=n_features,
        )  # type: ignore
        return X, y


def _generate_pca_data(
    dataset_type: str = "blobs_3d",
    n_samples: int = 300,
    noise: float = 1.0,
    random_state: int = 42,
) -> tuple[np.ndarray, np.ndarray]:
    """Generate higher-dimensional data for PCA demonstration."""
    rng = np.random.RandomState(random_state)

    if dataset_type == "blobs_3d":
        X, y = make_blobs(
            n_samples=n_samples, centers=3, n_features=3,
            cluster_std=noise, random_state=random_state,
        )  # type: ignore
    elif dataset_type == "blobs_5d":
        X, y = make_blobs(
            n_samples=n_samples, centers=4, n_features=5,
            cluster_std=noise, random_state=random_state,
        )  # type: ignore
    elif dataset_type == "blobs_10d":
        X, y = make_blobs(
            n_samples=n_samples, centers=5, n_features=10,
            cluster_std=noise, random_state=random_state,
        )  # type: ignore
    elif dataset_type == "correlated":
        # Generate correlated features — ideal for PCA
        mean = [0, 0, 0]
        cov = [[3.0, 2.5, 1.0],
               [2.5, 3.0, 2.0],
               [1.0, 2.0, 2.0]]
        X = rng.multivariate_normal(mean, cov, size=n_samples)
        # Add noise dimensions
        X = np.hstack([X, rng.normal(0, noise * 0.3, size=(n_samples, 2))])
        y = (X[:, 0] > 0).astype(int)
    elif dataset_type == "swiss_roll":
        t = 1.5 * np.pi * (1 + 2 * rng.rand(n_samples))
        x = t * np.cos(t)
        y_coord = 10 * rng.rand(n_samples)
        z = t * np.sin(t)
        X = np.column_stack([x, y_coord, z]) + rng.normal(0, noise * 0.3, (n_samples, 3))
        y = (t > 3 * np.pi).astype(int)
    else:
        X, y = make_blobs(
            n_samples=n_samples, centers=3, n_features=3,
            cluster_std=noise, random_state=random_state,
        )  # type: ignore
    return X, y


# ─── PCA ─────────────────────────────────────────────────────────

def train_pca(
    n_samples: int = 300,
    noise: float = 1.0,
    random_state: int = 42,
    dataset_type: str = "blobs_3d",
    n_components: int = 2,
) -> dict:
    """Perform PCA on high-dimensional data and return projections + variance info."""
    X_raw, y = _generate_pca_data(
        dataset_type=dataset_type,
        n_samples=n_samples,
        noise=noise,
        random_state=random_state,
    )

    # Standardize features
    scaler = StandardScaler()
    X = scaler.fit_transform(X_raw)

    n_features = X.shape[1]
    n_comp = min(n_components, n_features)

    # Fit PCA with all components for scree plot
    pca_full = PCA(random_state=random_state)
    pca_full.fit(X)

    # Fit PCA with requested components for projection
    pca = PCA(n_components=n_comp, random_state=random_state)
    X_projected = pca.fit_transform(X)

    # Explained variance
    explained_variance_ratio = pca_full.explained_variance_ratio_.tolist()
    cumulative_variance = np.cumsum(pca_full.explained_variance_ratio_).tolist()
    singular_values = pca_full.singular_values_.tolist()

    # Component loadings (each row is a component, each column is a feature)
    components = pca.components_.tolist()

    # Build response
    result = {
        "n_features_original": n_features,
        "n_components": n_comp,
        "explained_variance_ratio": explained_variance_ratio,
        "cumulative_variance": cumulative_variance,
        "singular_values": singular_values,
        "components": components,
        "total_variance_retained": float(sum(pca.explained_variance_ratio_)),
        "projection": {
            "x": X_projected[:, 0].tolist(),
            "y": X_projected[:, 1].tolist() if n_comp >= 2 else [0.0] * len(X_projected),
        },
        "labels": y.tolist(),
    }

    # If original data is 3D, include it for a 3D scatter
    if n_features == 3:
        result["original_3d"] = {
            "x": X[:, 0].tolist(),
            "y": X[:, 1].tolist(),
            "z": X[:, 2].tolist(),
        }

    return result


# ─── DBSCAN ──────────────────────────────────────────────────────

def train_dbscan(
    n_samples: int = 300,
    noise: float = 1.0,
    random_state: int = 42,
    dataset_type: str = "moons",
    eps: float = 0.5,
    min_samples: int = 5,
    n_centers: int = 3,
) -> dict:
    """Perform DBSCAN clustering and return results."""
    X, y_true = _generate_unsupervised_data(
        dataset_type=dataset_type,
        n_samples=n_samples,
        noise=noise,
        n_centers=n_centers,
        random_state=random_state,
    )

    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit DBSCAN
    db = DBSCAN(eps=eps, min_samples=min_samples)
    cluster_labels = db.fit_predict(X_scaled)

    # Metrics
    n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
    n_noise = int(np.sum(cluster_labels == -1))

    # Silhouette score (only if >= 2 clusters and not all noise)
    sil_score = None
    if n_clusters >= 2 and n_noise < len(cluster_labels):
        mask = cluster_labels != -1
        if len(set(cluster_labels[mask])) >= 2:
            sil_score = float(silhouette_score(X_scaled[mask], cluster_labels[mask]))

    # Core sample mask
    core_mask = np.zeros(len(X), dtype=bool)
    core_mask[db.core_sample_indices_] = True

    return {
        "n_clusters": n_clusters,
        "n_noise": n_noise,
        "n_samples": int(len(X)),
        "silhouette_score": sil_score,
        "cluster_labels": cluster_labels.tolist(),
        "core_sample_mask": core_mask.tolist(),
        "plot_data": {
            "x": X_scaled[:, 0].tolist(),
            "y": X_scaled[:, 1].tolist(),
        },
        "true_labels": y_true.tolist() if y_true is not None else None,
        "eps": eps,
        "min_samples": min_samples,
    }


# ─── K-Means ─────────────────────────────────────────────────────

def train_kmeans(
    n_samples: int = 300,
    noise: float = 1.0,
    random_state: int = 42,
    dataset_type: str = "blobs",
    n_clusters: int = 3,
    max_iter: int = 300,
    init: str = "k-means++",
    n_init: int = 10,
) -> dict:
    """Perform K-Means clustering and return results."""
    X, y_true = _generate_unsupervised_data(
        dataset_type=dataset_type,
        n_samples=n_samples,
        noise=noise,
        n_centers=n_clusters,
        random_state=random_state,
    )

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(
        n_clusters=n_clusters,
        max_iter=max_iter,
        init=init,
        n_init=n_init,
        random_state=random_state,
    )
    cluster_labels = model.fit_predict(X_scaled)

    # Metrics
    sil_score = None
    if n_clusters >= 2:
        sil_score = float(silhouette_score(X_scaled, cluster_labels))

    centroids = model.cluster_centers_.tolist()

    # Elbow curve — compute inertia for k=1 to k=10
    inertias = []
    k_range = list(range(1, min(11, n_samples)))
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=random_state, n_init=n_init)
        km.fit(X_scaled)
        inertias.append(float(km.inertia_))

    return {
        "n_clusters": n_clusters,
        "n_samples": int(len(X)),
        "inertia": float(model.inertia_),
        "silhouette_score": sil_score,
        "n_iter": int(model.n_iter_),
        "cluster_labels": cluster_labels.tolist(),
        "centroids": centroids,
        "plot_data": {
            "x": X_scaled[:, 0].tolist(),
            "y": X_scaled[:, 1].tolist(),
        },
        "true_labels": y_true.tolist() if y_true is not None else None,
        "elbow_curve": {
            "k_values": k_range,
            "inertias": inertias,
        },
    }
