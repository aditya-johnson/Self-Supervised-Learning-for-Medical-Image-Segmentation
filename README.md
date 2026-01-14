# MedVision SSL Framework

A self-supervised learning framework for medical imaging that uses contrastive methods to improve tumor segmentation and organ localization with limited labeled data.

![Dashboard](https://placehold.co/800x400/020617/06b6d4?text=MedVision+SSL+Dashboard)

## 🎯 Overview

MedVision provides a complete pipeline for self-supervised pretraining on medical imaging data (CT, MRI, PET), enabling high-quality segmentation models even with limited labeled samples. The framework demonstrates the power of SSL techniques through interactive visualizations and comparative analysis.

### Key Features

- **Multi-Modality Support**: CT, MRI, and PET imaging data
- **SSL Pretraining Methods**: 
  - Contrastive Learning (NT-Xent/InfoNCE)
  - Masked Autoencoding (MAE)
  - Cross-Modality Prediction
- **Dual Architecture Support**: 3D UNet Encoder & Vision Transformer (ViT)
- **Comprehensive Evaluation**: Dice score, Hausdorff distance, Precision, Recall, IoU
- **Label Efficiency Analysis**: Compare SSL vs Supervised performance at various label percentages
- **Interactive Visualizations**: Training curves, t-SNE embeddings, Volume viewer

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MedVision SSL Framework                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Recharts + Shadcn/UI)                    │
│  ├── Dashboard: Stats, Training Progress, Recent Experiments │
│  ├── Datasets: Manage CT/MRI/PET imaging data               │
│  ├── Models: Configure 3D UNet / ViT architectures          │
│  ├── Experiments: SSL pretraining configuration             │
│  ├── Training: Real-time metrics monitoring                 │
│  └── Results: Evaluation metrics, Volume Viewer, Embeddings │
├─────────────────────────────────────────────────────────────┤
│  Backend (FastAPI + MongoDB)                                 │
│  ├── Dataset Management API                                  │
│  ├── Model Configuration API                                 │
│  ├── Experiment Tracking API                                 │
│  ├── Training Simulation Engine                              │
│  └── Visualization Data API                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd medvision-ssl
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Environment Configuration**

Backend `.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="medvision_ssl"
CORS_ORIGINS="*"
```

Frontend `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Running the Application

**Start Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Start Frontend:**
```bash
cd frontend
yarn start
```

Access the application at `http://localhost:3000`

## 📚 API Reference

### Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List all datasets |
| GET | `/api/datasets/{id}` | Get dataset by ID |
| POST | `/api/datasets` | Create new dataset |
| DELETE | `/api/datasets/{id}` | Delete dataset |

### Model Configurations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List all model configs |
| GET | `/api/models/{id}` | Get model config by ID |
| POST | `/api/models` | Create new model config |
| DELETE | `/api/models/{id}` | Delete model config |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List all experiments |
| GET | `/api/experiments/{id}` | Get experiment by ID |
| POST | `/api/experiments` | Create new experiment |
| POST | `/api/experiments/{id}/start` | Start training |
| GET | `/api/experiments/{id}/metrics` | Get training metrics |
| DELETE | `/api/experiments/{id}` | Delete experiment |

### Visualization

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visualization/embeddings` | Get t-SNE embeddings |
| GET | `/api/visualization/slice/{idx}` | Get slice data for viewer |
| GET | `/api/evaluations/compare` | SSL vs Supervised comparison |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| POST | `/api/seed` | Seed demo data |

## 🧪 Demo Mode

The framework runs in **demo mode** by default, which simulates training with realistic metrics generation. This allows you to explore all features without requiring actual GPU resources.

To seed demo data:
```bash
curl -X POST http://localhost:8001/api/seed
```

This creates:
- 4 sample datasets (BraTS, NIH Chest CT, BTCV Abdomen, PET-CT Lung)
- 3 model configurations (3D UNet, ViT-Base, 3D UNet Light)
- 3 experiments with simulated training metrics

## 📊 SSL Pipeline Workflow

```
Unlabeled Medical Images
         ↓
┌─────────────────────────┐
│  Self-Supervised        │
│  Pretraining            │
│  • Contrastive Learning │
│  • Masked Autoencoding  │
│  • Cross-Modality       │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Fine-Tuning with       │
│  Limited Labels         │
│  (10% labeled data)     │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Evaluation             │
│  • Dice Score           │
│  • Hausdorff Distance   │
│  • Label Efficiency     │
└─────────────────────────┘
         ↓
    Clinical Use
```

## 🎨 UI Features

### Dashboard
- Real-time statistics cards
- Training progress charts with loss curves
- Recent experiments sidebar
- SSL pipeline architecture overview

### Volume Viewer
- Mock medical scan visualization
- Slice navigation slider
- Tumor region highlighting
- Intensity statistics

### Embeddings Visualization
- t-SNE cluster visualization
- Organ-specific color coding
- Confidence indicators

### Label Efficiency Charts
- SSL vs Supervised comparison
- Performance at different label percentages
- Improvement metrics

## 🔧 Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- MongoDB - Document database
- Pydantic - Data validation
- Motor - Async MongoDB driver

**Frontend:**
- React 19 - UI framework
- TailwindCSS - Styling
- Recharts - Data visualization
- Shadcn/UI - Component library
- Lucide React - Icons

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application
│   ├── models.py           # Pydantic models
│   ├── training_simulator.py # Metrics generation
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Sidebar, Header
│   │   │   ├── dashboard/  # Stats, Charts
│   │   │   ├── visualization/ # VolumeViewer, Embeddings
│   │   │   └── ui/         # Shadcn components
│   │   ├── pages/          # Dashboard, Datasets, Models, etc.
│   │   ├── lib/            # API client, utilities
│   │   └── App.js
│   ├── package.json
│   └── .env
├── memory/
│   └── PRD.md              # Product requirements
└── README.md
```

## 🚧 Roadmap

### Phase 1 (Current) ✅
- [x] Demo mode with simulated training
- [x] Full UI implementation
- [x] API endpoints
- [x] Visualization components

### Phase 2 (Planned)
- [ ] Real MONAI/PyTorch training integration
- [ ] DICOM/NIfTI file upload
- [ ] 3D volume rendering with WebGL

### Phase 3 (Future)
- [ ] Model export/download
- [ ] User authentication
- [ ] Uncertainty estimation
- [ ] Clinical report generation

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ for medical imaging researchers and clinicians.
