<div align="center">

# 👑 VALORIS
### *Knowledge is Power — The Interactive Machine Learning Kingdom*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.5-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=black)](https://scikit-learn.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Tokens-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
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

### 🐉 House Targaryen — Ensemble Methods & The Battle Arena
- **Random Forest Classifier & Regressor**: An ensemble of decorrelated decision trees that vote together for unbeatable robustness.
- **Gradient Boosting**: Sequential ensemble that builds trees to correct the errors of previous trees — fire and blood.
- **⚔️ The Great Battle Arena**: A multi-model colosseum. Pit up to 3 classifiers against each other on identical data splits. Compare side-by-side decision boundaries and exact metrics (Accuracy, Precision, Recall, F1) to crown the ultimate champion.

### ☀️ House Martell — Unsupervised Learning
- **Principal Component Analysis (PCA)**: Reduce high-dimensional data (up to 10D) to its most informative axes. Features 2D/3D projections and explained variance scree plots.
- **DBSCAN**: Density-based clustering that discovers arbitrary-shaped clusters (like moons and circles) and automatically isolates noise and outliers.
- **K-Means Clustering**: Partition data into k clusters using centroid optimization, complete with an interactive Elbow Method plot.

### 🌊 House Velaryon — Deep Learning (In Progress)
- **MLP Classifier & Regressor**: Multi-Layer Perceptrons for complex non-linear representations.
- Interactive network architecture building and real-time Loss Curve visualizations across training epochs.

### 🔮 Beyond the Narrow Sea — Future Realms
- **Dragonpit**: Computer Vision (Convolutional Networks, Object Detection).
- **The Citadel**: Natural Language Processing (Embeddings, Tokenization).
- **The Red Keep**: Generative AI (LLMs, Diffusion Models).

---

## ⚔️ Key Features & Highlights

- **🔒 Authentication & Authorization System**:
  - **User Registration**: Register with First Name, Last Name, Unique Username (Primary Key), Email, and Password with strict complexity rules (8+ chars, uppercase, lowercase, digit).
  - **Flexible Sign In**: Authenticate via Username OR Email with bcrypt password hashing.
  - **Google OAuth 2.0**: Native "Continue with Google" popup authentication powered by Google Identity Services.
  - **Strict JWT Authorization**: Secured session state via signed JWT bearer tokens (`HTTPBearer`), request header interceptors, and automatic 401 token invalidation.
  - **👑 Lord's Chambers (User Profile & Settings)**: Dedicated profile management page (`/profile`) allowing users to view details, update personal info (First Name, Last Name, Username), and securely update passwords using current password verification.
  - **🗄️ Supabase PostgreSQL Integration**: Persistent cloud database storage using SQLAlchemy ORM with automatic schema initialization on startup.
- **🐉 Immersive Game of Thrones Entrance**:
  - **Cinematic Landing Gate**: Rising ember particle system, Targaryen sigil, and Cersei Lannister quote (*"When you play the game of thrones, you win or you die..."*).
  - **Ambient Fire Sound**: Looped fire-crackling audio triggered on interaction, fading gracefully when entering the realm.
  - **Smart Session Storage**: Remembers entrance per session—doesn't re-trigger on refresh.
- **🎵 GoT Theme Audio Player**: Ambient Game of Thrones theme music player built directly into the navigation bar.
- **🎨 Dark Claymorphism & Aesthetics**: Sculpted obsidian cards, Valyrian crimson glow, gold foil accents, and metallic iron borders.
- **⚡ Reactive Real-Time Auto-Training**: Parameter tweaks recalculate predictions and re-render visualizations instantly.
- **🌳 Interactive Tree Visualizer**: Zoomable and pannable decision tree graph displaying node impurity, sample splits, and thresholds.
- **📊 Interactive Analysis Suite**:
  - **Valyrian Steel Regularization Path**: Coefficient trajectories across regularization strength ($\alpha$).
  - **War Strategy (Bias-Variance Tradeoff)**: Train vs Test loss divergence across model complexity.
  - **Army Growth Campaign (Learning Curves)**: Model convergence across expanding training sets.
- **🔄 Dual-Mode Architecture**: Seamlessly toggle between Classification and Regression modes (House Lannister ↔ House Stark) directly within dual-capable algorithm interfaces (KNN, SVM, Decision Trees, Random Forests, Gradient Boosting) via a dynamic animated controller.

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
- **Authentication**: Google Identity Services + JWT Token Management
- **Charts & Visualization**: Plotly.js + React Plotly
- **Graph Controls**: React Zoom Pan Pinch
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database & ORM**: SQLAlchemy + SQLite (PostgreSQL compatible)
- **Security & Auth**: Passlib (Bcrypt), Python-Jose (JWT), Google Auth
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

### 2. Configure Environment Variables

**Frontend (`client/.env`)**:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:8000/api
```

**Backend (`server/.env`)**:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET_KEY=valoris-secret-key-super-secure-jwt-2026
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

### 3. Launch the Backend Server
```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
*The FastAPI backend will be live at `http://localhost:8000` (Swagger API Docs at `http://localhost:8000/docs`).*

### 4. Launch the Frontend Application
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
│   │   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   │   └── shared/          # SplashScreen, ValorisLogoIcon, ControlPanel, MetricCard
│   │   ├── contexts/            # AuthContext (JWT & User state management)
│   │   ├── config/              # Algorithms Registry & House Metadata
│   │   ├── hooks/               # useAlgorithm Custom State Hook
│   │   ├── pages/               # AuthPage, HomePage, AlgorithmsPage, AlgorithmPage
│   │   ├── lib/                 # Axios API Client with Auth Interceptors
│   │   └── index.css            # Dark Claymorphism Design System & Ember Animations
│   ├── package.json
│   ├── vercel.json              # SPA Client-Side Routing Rewrites
│   └── tsconfig.app.json
│
└── server/                      # FastAPI Python Backend
    ├── app/
    │   ├── models/              # SQLAlchemy & Pydantic Models (User, Auth, ML Request/Response)
    │   │   ├── user.py
    │   │   └── auth_schemas.py
    │   ├── routers/             # API Endpoints (Auth, Regression, Classification, Clustering)
    │   │   ├── auth.py
    │   │   ├── classification.py
    │   │   └── regression.py
    │   ├── services/            # Machine Learning Service Functions
    │   ├── utils/               # Auth Utilities (Bcrypt, JWT, Google OAuth Token Verification)
    │   └── database.py          # SQLAlchemy Session & Engine Setup
    ├── requirements.txt
    └── main.py
```

---

## 📜 License & Acknowledgments

Created with passion by **Pranav Landge** ([pranavlandge.in](https://pranavlandge.in)).

*Valoris — "Knowledge is Power"*