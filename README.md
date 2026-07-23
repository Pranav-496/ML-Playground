<div align="center">

# 👑 VALORIS
### *Knowledge is Power — The Interactive Machine Learning Kingdom*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.4-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=black)](https://scikit-learn.org/)
[![Plotly](https://img.shields.io/badge/Plotly-2.29-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

<p align="center">
  <b>VALORIS</b> is an interactive classical and modern Machine Learning laboratory inspired by the <b>Game of Thrones</b> and <b>House of the Dragon</b> universe.
  <br/>
  Machine Learning is treated like ancient knowledge and strategic warfare. Learn, visualize, experiment, compare, and conquer the Seven Kingdoms of ML.
</p>

</div>

---

## 🏰 The Great Houses & Disciplines

Valoris categorizes algorithms into the Great Houses of Westeros, offering interactive 2D/3D visualizations, hyperparameter tuning, decision boundaries, mathematical intuition, and battle metrics.

### 🛡️ House Stark — Regression Disciplines
- **Ordinary Least Squares (OLS) Linear Regression**: Fit linear relationships with non-negativity constraint support.
- **Polynomial Regression**: Model non-linear curved trends with adjustable polynomial degrees.
- **Ridge Regression (L2)**: Regularized regression to prevent overfitting by shrinking coefficients.
- **Lasso Regression (L1)**: Regularization featuring automatic feature selection by driving weights to zero.
- **Elastic Net**: Combined L1 and L2 penalty for optimal high-dimensional regression.
- **KNN Regression**: Non-parametric stepwise prediction based on spatial neighbor averaging.
- **Support Vector Regressor (SVR)**: Non-linear regression using Valyrian kernel tricks within $\varepsilon$-insensitive tubes.
- **Decision Tree Regressor**: Piecewise step-function fitting with interactive tree structure visualization.

### 👑 House Lannister — Classification Disciplines
- **Logistic Regression**: Linear classification with Sigmoid probability mappings and L1/L2/ElasticNet penalties.
- **K-Nearest Neighbors (KNN)**: Instance-based majority vote classification with Manhattan, Euclidean, and Minkowski norms.
- **Decision Tree Classifier**: Axis-aligned rectangular partitioning with Gini Impurity and Entropy split criteria.
- **Support Vector Machine (SVM)**: Maximum-margin hyperplane separation with RBF, Linear, Polynomial, and Sigmoid kernels.
- **Gaussian Naive Bayes**: Continuous probabilistic classification assuming Gaussian feature distributions.
- **Bernoulli Naive Bayes**: Binary feature classification using discrete probability thresholds.
- **Multinomial Naive Bayes**: Count-based probabilistic classification with Laplace smoothing.

### 🐉 House Targaryen & Beyond — Advanced Realms
- **Clustering & Ensembles**: K-Means, Random Forest, Gradient Boosting, XGBoost.
- **House Velaryon**: Deep Learning (Neural Networks, Loss Surfaces).
- **Dragonpit**: Computer Vision (Convolutional Networks, Object Detection).
- **The Citadel**: Natural Language Processing (Embeddings, Tokenization).
- **The Red Keep**: Generative AI (LLMs, Diffusion Models).
- **Three-Eyed Raven**: Retrieval-Augmented Generation (RAG).
- **Master of Whisperers**: Autonomous AI Agents.

---

## 🐉 Features & Highlights

- **Dark Claymorphism & Game of Thrones Aesthetics**: Sculpted obsidian cards, Valyrian crimson glow, gold foil accents, and metallic iron borders.
- **Reactive Real-Time Auto-Training**: Selecting a dataset or tweaking a parameter instantly recalculates predictions and updates visualizations on screen.
- **Interactive Tree Visualizer**: Full zoomable/pannable decision tree graph rendering node values, sample counts, thresholds, and impurity scores.
- **Interactive Analysis Suite**:
  - **Valyrian Steel Regularization Path**: Visualize L1/L2 coefficient evolution as $\alpha$ scales.
  - **War Strategy (Bias-Variance Tradeoff)**: Track train vs test MSE divergence across model complexity.
  - **Army Growth Campaign (Learning Curves)**: Analyze model performance as training sample size expands.
- **The Grand Maester's Wisdom & Small Council Advises**: In-depth theoretical lore, equations, hyperparameter impact guides, advantages, disadvantages, and real-world applications.

---

## ⚡ Westeros Terminology Codex

| Standard ML Term | Valoris Westeros Term |
|---|---|
| **Run / Train Model** | `🐉 Dracarys` |
| **Training State** | `The Maesters are calculating...` |
| **Completed State** | `The Realm Stands.` |
| **Failed State** | `The Iron Throne Rejects You.` |
| **Hyperparameters** | `🏰 Small Council` |
| **Learning Rate** | `March Speed` |
| **Epochs** | `Campaign Length` |
| **Batch Size** | `Army Strength` |
| **Max Depth** | `Castle Depth` |
| **Regularization ($C / \alpha$)** | `Valyrian Steel Armor` |
| **Polynomial Degree** | `Dragon Bloodline` |
| **Neighbors ($K$)** | `Sworn Allies` |
| **Random State** | `The Hand's Decision` |
| **Accuracy** | `Battle Accuracy` |
| **Precision** | `Sword Precision` |
| **Recall** | `Battle Recall` |
| **F1 Score** | `Victory Score` |
| **Loss Curve** | `Battle Casualties` |
| **Decision Boundary** | `Borders of the Realm` |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + Dark Claymorphism Design System
- **Charts & Visualization**: Plotly.js + React Plotly
- **Graph Controls**: React Zoom Pan Pinch
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Machine Learning**: Scikit-Learn, NumPy, Pandas
- **Server**: Uvicorn

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/Pranav-496/ML-Playground.git
cd ML-Playground
```

### 2. Launch the Backend Server
```bash
cd server

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
*The FastAPI backend will be live at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 3. Launch the Frontend Application
In a new terminal window:
```bash
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Open `http://localhost:5173` in your browser to enter Valoris.*

---

## 📂 Project Architecture

```
ML-Playground/
├── client/                      # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── algorithms/      # Model Discipline Pages & Visualizers
│   │   │   │   ├── DecisionTree/
│   │   │   │   ├── DecisionTreeRegression/
│   │   │   │   ├── Knn/
│   │   │   │   ├── KnnRegression/
│   │   │   │   ├── LinearRegression/
│   │   │   │   ├── LogisticRegression/
│   │   │   │   ├── Svm/
│   │   │   │   ├── Svr/
│   │   │   │   └── ...
│   │   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   │   └── shared/          # ControlPanel, MetricCard, TheorySection
│   │   ├── config/              # Algorithms Registry & House Metadata
│   │   ├── hooks/               # useAlgorithm Custom State Hook
│   │   ├── pages/               # HomePage, AlgorithmsPage, AlgorithmPage
│   │   └── index.css            # Dark Claymorphism Design System & Ember Animations
│   ├── package.json
│   └── tsconfig.app.json
│
└── server/                      # FastAPI Python Backend
    ├── app/
    │   ├── routers/             # API Router Endpoints
    │   │   ├── classification.py
    │   │   └── regression.py
    │   ├── services/            # Machine Learning Service Functions
    │   │   ├── classification.py
    │   │   └── regression.py
    │   └── utils/               # Synthetic Data Generators (Blobs, Moons, Circles, XOR, Spirals, etc.)
    │       └── data_generation.py
    ├── requirements.txt
    └── main.py
```

---

## 📜 License & Acknowledgments

Created with passion by **Pranav Landge**.

*Valoris — "Knowledge is power."*