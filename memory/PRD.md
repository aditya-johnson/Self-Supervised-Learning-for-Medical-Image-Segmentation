# MedVision SSL Framework - PRD

## Original Problem Statement
Build a self-supervised learning framework using contrastive methods to improve tumor segmentation and organ localization in limited-labeled medical imaging datasets.

## Architecture
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with TailwindCSS, Recharts, Shadcn/UI
- **Mode**: Demo/Simulation mode with generated training metrics

## User Personas
1. **Medical Imaging Researchers**: Configure and run SSL experiments
2. **Radiologists**: Evaluate segmentation results
3. **ML Engineers**: Fine-tune models for clinical deployment

## Core Requirements (Static)
- Support CT, MRI, PET imaging modalities
- Self-supervised pretraining methods: Contrastive Learning, MAE, Cross-Modality
- Architecture support: 3D UNet Encoder, Vision Transformer (ViT)
- Evaluation metrics: Dice score, Hausdorff distance, Precision, Recall, IoU
- Label efficiency analysis (SSL vs Supervised)

## What's Been Implemented (January 2025)
### Backend
- [x] Dataset CRUD operations (CT/MRI/PET modalities)
- [x] Model configuration management (3D UNet, ViT)
- [x] Experiment creation and tracking
- [x] Simulated training with realistic loss curves
- [x] Evaluation metrics generation
- [x] Visualization data (embeddings, slice data)
- [x] Dashboard statistics API

### Frontend
- [x] Dashboard with stats cards, training charts, recent experiments
- [x] Datasets management page with modality badges
- [x] Models configuration page with architecture comparison
- [x] Experiments page with status indicators and training controls
- [x] Training monitor with real-time metrics display
- [x] Results page with Volume Viewer, Embeddings visualization
- [x] Label efficiency comparison charts (SSL vs Supervised)

## Prioritized Backlog
### P0 (Critical)
- All core features implemented ✅

### P1 (High Priority)
- [ ] Real MONAI/PyTorch training integration (requires GPU)
- [ ] DICOM/NIfTI file upload and processing
- [ ] 3D volume rendering with WebGL

### P2 (Nice to Have)
- [ ] Model export/download functionality
- [ ] User authentication and multi-user support
- [ ] Uncertainty estimation visualization
- [ ] Human-in-the-loop verification workflow

## Next Tasks
1. Enable real training with MONAI when GPU available
2. Add file upload for custom medical imaging data
3. Implement 3D volume rendering with Three.js
4. Add model comparison side-by-side view
