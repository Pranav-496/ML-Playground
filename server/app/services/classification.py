"""Classification algorithm services."""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB, BernoulliNB, MultinomialNB
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.utils.data_generation import generate_classification_data


# ─── Shared Helper ────────────────────────────────────────────

def _evaluate_classifier(
    model,
    X: np.ndarray,
    y: np.ndarray,
    test_size: float = 0.2,
    random_state: int = 42,
    mesh_resolution: int = 50,
    extras_fn=None,
) -> dict:
    """Shared evaluation pipeline for all classifiers.

    1. Split data
    2. Fit model
    3. Compute metrics
    4. Build decision-boundary meshgrid
    5. Optionally collect algorithm-specific extras via `extras_fn`

    Args:
        model: An unfitted sklearn-compatible classifier.
        X: Feature matrix (n_samples, 2).
        y: Label vector.
        test_size: Fraction held out for testing.
        random_state: Seed for splitting.
        mesh_resolution: Grid density for the decision boundary.
        extras_fn: Optional callable(model, X_train, X_test, y_train, y_test) -> dict
                   that returns algorithm-specific extra fields to merge into the result.

    Returns:
        dict with keys: metrics, plot_data, model_params, plus anything from extras_fn.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
    }

    # Decision boundary meshgrid
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, mesh_resolution),
        np.linspace(y_min, y_max, mesh_resolution),
    )
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    plot_data = {
        "x_train": X_train.tolist(),
        "y_train": y_train.tolist(),
        "x_test": X_test.tolist(),
        "y_test": y_test.tolist(),
        "x_min": float(x_min),
        "x_max": float(x_max),
        "y_min": float(y_min),
        "y_max": float(y_max),
        "xx": xx.tolist(),
        "yy": yy.tolist(),
        "z": Z.tolist(),
    }

    result = {
        "metrics": metrics,
        "plot_data": plot_data,
        "model_params": model.get_params(),
    }

    if extras_fn:
        result.update(extras_fn(model, X_train, X_test, y_train, y_test))

    return result


# ─── Logistic Regression ──────────────────────────────────────

def train_logistic_regression(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "blobs",
    C: float = 1.0,
    penalty: str = "l2",
    solver: str = "lbfgs",
    max_iter: int = 100,
    l1_ratio: float | None = None,
) -> dict:
    """Train a logistic regression model and return results and plot data."""
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    effective_penalty = None if penalty == "none" else penalty
    kwargs: dict = dict(
        C=C,
        penalty=effective_penalty,
        solver=solver,
        max_iter=max_iter,
        random_state=random_state,
    )
    if penalty == "elasticnet" and l1_ratio is not None:
        kwargs["l1_ratio"] = l1_ratio

    model = LogisticRegression(**kwargs)

    def extras(m, X_train, X_test, y_train, y_test):
        coefficients = m.coef_[0].tolist() if m.coef_.ndim > 1 else m.coef_.tolist()
        return {
            "coefficients": coefficients,
            "intercept": m.intercept_.tolist(),
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── K-Nearest Neighbors ─────────────────────────────────────

def train_knn(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "blobs",
    n_neighbors: int = 5,
    weights: str = "uniform",
    p: int = 2,
    algorithm: str = "auto",
    leaf_size: int = 30,
    metric: str = "minkowski",
) -> dict:
    """Train a K-Nearest Neighbors model and return results and plot data."""
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = KNeighborsClassifier(
        n_neighbors=n_neighbors,
        weights=weights,
        p=p,
        algorithm=algorithm,
        leaf_size=leaf_size,
        metric=metric,
    )

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
    )


# ─── Decision Tree ────────────────────────────────────────────

def train_decision_tree(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "moons",
    criterion: str = "gini",
    splitter: str = "best",
    max_depth: int | None = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: str | None = None,
    max_leaf_nodes: int | None = None,
    min_impurity_decrease: float = 0.0,
) -> dict:
    """Train a Decision Tree model and return results and plot data."""
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = DecisionTreeClassifier(
        criterion=criterion,
        splitter=splitter,
        max_depth=max_depth if max_depth and max_depth > 0 else None,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        max_features=max_features if max_features != "none" else None,
        max_leaf_nodes=max_leaf_nodes if max_leaf_nodes and max_leaf_nodes > 0 else None,
        min_impurity_decrease=min_impurity_decrease,
        random_state=random_state,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract tree structure for visualization."""
        def build_tree_dict(node_id: int):
            node_id = int(node_id)
            if node_id == -1:
                return None
            is_leaf = bool(
                m.tree_.children_left[node_id] == -1
                and m.tree_.children_right[node_id] == -1
            )
            node_dict = {
                "node_id": node_id,
                "samples": int(m.tree_.n_node_samples[node_id]),
                "value": [int(v) for v in m.tree_.value[node_id][0]],
                "impurity": round(float(m.tree_.impurity[node_id]), 3),
                "is_leaf": is_leaf,
            }
            if not is_leaf:
                node_dict["feature"] = f"Feature {m.tree_.feature[node_id]}"
                node_dict["threshold"] = round(float(m.tree_.threshold[node_id]), 3)
                node_dict["left"] = build_tree_dict(int(m.tree_.children_left[node_id]))
                node_dict["right"] = build_tree_dict(int(m.tree_.children_right[node_id]))
            return node_dict

        return {"tree_structure": build_tree_dict(0)}

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        mesh_resolution=100,  # Higher res for sharp orthogonal boundaries
        extras_fn=extras,
    )


# ─── Support Vector Machine (SVC) ────────────────────────────

def train_svm(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "moons",
    C: float = 1.0,
    kernel: str = "rbf",
    gamma: str = "scale",
    degree: int = 3,
    coef0: float = 0.0,
) -> dict:
    """Train a Support Vector Machine classifier and return results.

    SVM finds the optimal hyperplane that maximizes the margin between classes.
    The kernel trick allows it to handle non-linear boundaries.
    """
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = SVC(
        C=C,
        kernel=kernel,
        gamma=gamma,
        degree=degree,
        coef0=coef0,
        random_state=random_state,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract SVM-specific data: support vectors and decision function."""
        sv = m.support_vectors_
        # Decision function values on the meshgrid for margin visualization
        x_min, x_max = np.concatenate([X_train, X_test])[:, 0].min() - 1, np.concatenate([X_train, X_test])[:, 0].max() + 1
        y_min, y_max = np.concatenate([X_train, X_test])[:, 1].min() - 1, np.concatenate([X_train, X_test])[:, 1].max() + 1
        xx, yy = np.meshgrid(
            np.linspace(x_min, x_max, 80),
            np.linspace(y_min, y_max, 80),
        )
        decision_values = m.decision_function(np.c_[xx.ravel(), yy.ravel()])
        decision_values = decision_values.reshape(xx.shape)

        return {
            "support_vectors": sv.tolist(),
            "n_support_vectors": int(len(sv)),
            "decision_function": {
                "xx": xx.tolist(),
                "yy": yy.tolist(),
                "values": decision_values.tolist(),
            },
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        mesh_resolution=80,
        extras_fn=extras,
    )


# ─── Gaussian Naive Bayes ─────────────────────────────────────

def train_gaussian_nb(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "blobs",
    var_smoothing: float = 1e-9,
) -> dict:
    """Train a Gaussian Naive Bayes classifier.

    Assumes features follow a Gaussian (normal) distribution within each class.
    var_smoothing adds a portion of the largest variance to all features for stability.
    """
    if var_smoothing <= 0:
        var_smoothing = 10 ** var_smoothing

    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = GaussianNB(var_smoothing=var_smoothing)

    def extras(m, X_train, X_test, y_train, y_test):
        return {
            "class_prior": m.class_prior_.tolist(),
            "theta": m.theta_.tolist(),  # Mean of each feature per class
            "var": m.var_.tolist(),       # Variance of each feature per class
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── Bernoulli Naive Bayes ────────────────────────────────────

def train_bernoulli_nb(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "blobs",
    alpha: float = 1.0,
    binarize: float = 0.0,
    fit_prior: bool = True,
) -> dict:
    """Train a Bernoulli Naive Bayes classifier.

    Designed for binary/boolean features. The binarize threshold converts
    continuous features to binary (feature > threshold → 1, else → 0).
    """
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = BernoulliNB(alpha=alpha, binarize=binarize, fit_prior=fit_prior)

    def extras(m, X_train, X_test, y_train, y_test):
        return {
            "class_log_prior": m.class_log_prior_.tolist(),
            "feature_log_prob": m.feature_log_prob_.tolist(),
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── Multinomial Naive Bayes ──────────────────────────────────

def train_multinomial_nb(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "blobs",
    alpha: float = 1.0,
    fit_prior: bool = True,
) -> dict:
    """Train a Multinomial Naive Bayes classifier.

    Requires non-negative features. We apply MinMaxScaler to shift data
    into [0, max] range, simulating count-like features.
    """
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    # Multinomial NB requires non-negative features
    scaler = MinMaxScaler()
    X = scaler.fit_transform(X)

    model = MultinomialNB(alpha=alpha, fit_prior=fit_prior)

    def extras(m, X_train, X_test, y_train, y_test):
        return {
            "class_log_prior": m.class_log_prior_.tolist(),
            "feature_log_prob": m.feature_log_prob_.tolist(),
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )
