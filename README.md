# 👕 FitChart Generator

**AI-Powered Size Chart Generator for Apparel Sellers**

A full-stack web application that automatically generates dynamic size charts for clothing products and recommends the perfect size for customers based on their body measurements.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  Landing Page → Seller Dashboard → Customer Assistant    │
│  (Vite + React Router + Tailwind CSS + Recharts)        │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API (Axios)
┌─────────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                         │
│  /upload-product  /generate-fit-chart  /recommend-size  │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼─────────┐
    │ SQLite  │   │ Scikit-   │  │   OpenCV      │
    │   DB    │   │ learn KNN │  │ Image Analyzer│
    └─────────┘   └───────────┘  └──────────────┘
```

## 🤖 AI Workflow

```
Product Input
    │
    ├── Measurements (chest, waist, hip...)
    ├── Fabric (composition, stretch%, GSM)
    └── Images (front, back, flat)
         │
         ▼
   OpenCV Analysis ──→ Color, Category, Contour
         │
         ▼
  Fit Chart Generator ──→ XS→XXL grading with stretch/GSM adjustments
         │
         ▼
  Explanation Engine ──→ Rule-based fabric/stretch explanations
         │
         ▼
  Generated Fit Chart (saved to DB)

Customer Flow:
   Body Measurements → KNN Model → Size + Confidence% + Reason
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 8+

---

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
fit-chart-gen/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── database.py                # SQLAlchemy + SQLite setup
│   ├── models.py                  # ORM models (5 tables)
│   ├── schemas.py                 # Pydantic validation schemas
│   ├── requirements.txt
│   ├── routers/
│   │   ├── products.py            # POST /upload-product, GET /products
│   │   ├── fit_chart.py           # POST /generate-fit-chart, GET /fit-chart/{id}
│   │   └── recommend.py           # POST /recommend-size
│   ├── services/
│   │   ├── ai_engine.py           # KNN size predictor (Scikit-learn)
│   │   ├── explanation_engine.py  # Rule-based explanations
│   │   ├── fit_chart_generator.py # Dynamic size grading
│   │   └── image_analyzer.py      # OpenCV analysis
│   ├── data/
│   │   └── training_data.csv      # 150+ row ML training dataset
│   └── uploads/                   # Garment images (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios API client
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DashboardCard.jsx
│   │   │   ├── FitChartTable.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductList.jsx
│   │   │   └── CustomerFitAssistant.jsx
│   │   ├── App.jsx                # Routes
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + global styles
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── sample_data/
│   └── training_data.csv
└── README.md
```

---

## 🗄️ Database Schema

| Table | Key Fields |
|---|---|
| `sellers` | id, name, email, created_at |
| `products` | id, name, category, brand, fabric_composition, stretch_percentage, gsm, description, image_front/back/flat |
| `measurements` | id, product_id, chest, waist, hip, sleeve_length, shoulder, length |
| `generated_fit_charts` | id, product_id, chart_json, explanations_json, image_analysis_json |
| `customer_recommendations` | id, height, weight, chest, waist, hip, recommended_size, confidence, reason |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/upload-product` | Create product with images + measurements |
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get single product |
| DELETE | `/api/products/{id}` | Delete product |
| POST | `/api/generate-fit-chart` | Generate AI fit chart for product |
| GET | `/api/fit-chart/{id}` | Get generated fit chart |
| GET | `/api/fit-charts/product/{id}` | All charts for a product |
| POST | `/api/recommend-size` | Customer size recommendation |

---

## 🤖 AI & ML Details

### Size Prediction Model
- **Algorithm**: K-Nearest Neighbors (k=7, distance-weighted)
- **Features**: height, weight, chest, waist, hip
- **Target**: Size label (XS, S, M, L, XL, XXL)
- **Training data**: 150 rows with realistic body measurement distributions
- **Confidence**: KNN probability output (0–100%)

### Fit Chart Generator
- Takes M-size base measurements as input
- Applies standard grading increments by category (Dress, Jeans, Top, etc.)
- Adjusts increments for:
  - **Stretch %**: High-stretch fabrics get compressed grading
  - **GSM**: Heavy fabrics get slight ease added

### Explanation Engine (Rule-Based)
- Cotton → "May shrink after washing"
- Low stretch → "Waist increased by 1 cm because fabric has low stretch"
- High GSM → "Heavy fabric — ensure chest/shoulder measurements fit"
- Category-aware tips for Dresses, Jeans, Tops, Jackets

### Image Analysis (OpenCV)
- **Dominant color**: HSV color space hue analysis
- **Estimated category**: Aspect ratio → Top/Dress/Full-length classification
- **Contour area**: Threshold + largest contour detection
- **Fallback**: If analysis fails, continues with manual measurements

---

## 🔐 Security

- ✅ File type validation (JPEG/PNG/WebP only)
- ✅ File size limit (5MB per upload)
- ✅ No customer body images stored
- ✅ Pydantic input validation on all endpoints
- ✅ CORS limited to localhost origins

---

## 🖥️ UI Pages

| Page | URL | Description |
|---|---|---|
| Landing | `/` | Hero, features, role selection |
| Seller Dashboard | `/seller` | Stats cards, quick actions, recent products |
| Add Product | `/seller/new` | 4-step form: info → measurements → images → generate |
| Product List | `/seller/products` | Browse, search, generate charts, delete |
| Fit Assistant | `/customer` | Measurement form + radar chart + size breakdown |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Backend | FastAPI (Python 3.11) |
| Database | SQLite + SQLAlchemy |
| Image Processing | OpenCV-Python |
| ML | Scikit-learn (KNN) |
| Data Processing | Pandas + NumPy |

---

## 🎨 Design Features

- Dark glassmorphism UI
- Purple/indigo color scheme
- Gradient backgrounds with blur effects
- Micro-animations (fade-in, slide-up)
- Responsive layouts
- Color-coded size badges
- Radar chart for size probability visualization
- Confidence meter with color feedback
