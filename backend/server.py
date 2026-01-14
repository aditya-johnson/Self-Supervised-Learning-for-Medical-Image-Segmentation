"""
Self-Supervised Learning Medical Imaging Framework - Backend API
"""
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
import asyncio

from models import (
    Dataset, DatasetCreate,
    ModelConfig, ModelConfigCreate,
    Experiment, ExperimentCreate,
    FinetuneConfig, FinetuneConfigCreate,
    EvaluationMetrics,
    DashboardStats,
    TrainingStatus,
    Modality, ModelArchitecture, PretrainingMethod
)
from training_simulator import (
    generate_training_curve,
    generate_evaluation_metrics,
    generate_label_efficiency_curve,
    generate_contrastive_embeddings,
    generate_slice_data
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="MedVision SSL Framework API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============== DATASETS ==============

@api_router.get("/datasets", response_model=List[Dataset])
async def get_datasets():
    """Get all datasets"""
    datasets = await db.datasets.find({}, {"_id": 0}).to_list(1000)
    for d in datasets:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return datasets


@api_router.get("/datasets/{dataset_id}", response_model=Dataset)
async def get_dataset(dataset_id: str):
    """Get a specific dataset"""
    dataset = await db.datasets.find_one({"id": dataset_id}, {"_id": 0})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if isinstance(dataset.get('created_at'), str):
        dataset['created_at'] = datetime.fromisoformat(dataset['created_at'])
    return dataset


@api_router.post("/datasets", response_model=Dataset)
async def create_dataset(input_data: DatasetCreate):
    """Create a new dataset entry"""
    dataset = Dataset(**input_data.model_dump())
    doc = dataset.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.datasets.insert_one(doc)
    return dataset


@api_router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    result = await db.datasets.delete_one({"id": dataset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"message": "Dataset deleted successfully"}


# ============== MODEL CONFIGURATIONS ==============

@api_router.get("/models", response_model=List[ModelConfig])
async def get_model_configs():
    """Get all model configurations"""
    models = await db.model_configs.find({}, {"_id": 0}).to_list(1000)
    for m in models:
        if isinstance(m.get('created_at'), str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return models


@api_router.get("/models/{model_id}", response_model=ModelConfig)
async def get_model_config(model_id: str):
    """Get a specific model configuration"""
    model = await db.model_configs.find_one({"id": model_id}, {"_id": 0})
    if not model:
        raise HTTPException(status_code=404, detail="Model configuration not found")
    if isinstance(model.get('created_at'), str):
        model['created_at'] = datetime.fromisoformat(model['created_at'])
    return model


@api_router.post("/models", response_model=ModelConfig)
async def create_model_config(input_data: ModelConfigCreate):
    """Create a new model configuration"""
    model = ModelConfig(**input_data.model_dump())
    
    # Calculate approximate parameter count
    if input_data.architecture == ModelArchitecture.UNET_3D:
        model.parameters_count = 31_000_000  # ~31M for 3D UNet
    else:
        model.parameters_count = 86_000_000  # ~86M for ViT-Base
    
    doc = model.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.model_configs.insert_one(doc)
    return model


@api_router.delete("/models/{model_id}")
async def delete_model_config(model_id: str):
    """Delete a model configuration"""
    result = await db.model_configs.delete_one({"id": model_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Model configuration not found")
    return {"message": "Model configuration deleted successfully"}


# ============== EXPERIMENTS ==============

@api_router.get("/experiments", response_model=List[Experiment])
async def get_experiments():
    """Get all experiments"""
    experiments = await db.experiments.find({}, {"_id": 0}).to_list(1000)
    for e in experiments:
        if isinstance(e.get('created_at'), str):
            e['created_at'] = datetime.fromisoformat(e['created_at'])
    return experiments


@api_router.get("/experiments/{experiment_id}", response_model=Experiment)
async def get_experiment(experiment_id: str):
    """Get a specific experiment"""
    experiment = await db.experiments.find_one({"id": experiment_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if isinstance(experiment.get('created_at'), str):
        experiment['created_at'] = datetime.fromisoformat(experiment['created_at'])
    return experiment


@api_router.post("/experiments", response_model=Experiment)
async def create_experiment(input_data: ExperimentCreate):
    """Create a new experiment"""
    # Verify dataset exists
    dataset = await db.datasets.find_one({"id": input_data.dataset_id}, {"_id": 0})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Verify model config exists
    model = await db.model_configs.find_one({"id": input_data.model_config_id}, {"_id": 0})
    if not model:
        raise HTTPException(status_code=404, detail="Model configuration not found")
    
    experiment = Experiment(**input_data.model_dump())
    doc = experiment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.experiments.insert_one(doc)
    return experiment


@api_router.post("/experiments/{experiment_id}/start")
async def start_experiment(experiment_id: str, background_tasks: BackgroundTasks):
    """Start training an experiment (simulated)"""
    experiment = await db.experiments.find_one({"id": experiment_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Update status to running
    await db.experiments.update_one(
        {"id": experiment_id},
        {"$set": {"status": TrainingStatus.RUNNING.value}}
    )
    
    # Generate simulated training metrics
    training_config = experiment.get('training_config', {})
    num_epochs = training_config.get('num_epochs', 100)
    warmup = training_config.get('warmup_epochs', 10)
    
    metrics = generate_training_curve(
        num_epochs=num_epochs,
        warmup_epochs=warmup
    )
    
    # Update experiment with metrics
    best_loss = min(m['loss'] for m in metrics)
    await db.experiments.update_one(
        {"id": experiment_id},
        {
            "$set": {
                "status": TrainingStatus.COMPLETED.value,
                "current_epoch": num_epochs,
                "best_loss": best_loss,
                "metrics_history": metrics
            }
        }
    )
    
    return {"message": "Training completed", "epochs": num_epochs, "best_loss": best_loss}


@api_router.get("/experiments/{experiment_id}/metrics")
async def get_experiment_metrics(experiment_id: str):
    """Get training metrics for an experiment"""
    experiment = await db.experiments.find_one({"id": experiment_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    return {
        "experiment_id": experiment_id,
        "status": experiment.get('status'),
        "current_epoch": experiment.get('current_epoch', 0),
        "best_loss": experiment.get('best_loss'),
        "metrics_history": experiment.get('metrics_history', [])
    }


@api_router.delete("/experiments/{experiment_id}")
async def delete_experiment(experiment_id: str):
    """Delete an experiment"""
    result = await db.experiments.delete_one({"id": experiment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {"message": "Experiment deleted successfully"}


# ============== FINE-TUNING ==============

@api_router.get("/finetune", response_model=List[FinetuneConfig])
async def get_finetune_configs():
    """Get all fine-tuning configurations"""
    configs = await db.finetune_configs.find({}, {"_id": 0}).to_list(1000)
    for c in configs:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return configs


@api_router.post("/finetune", response_model=FinetuneConfig)
async def create_finetune_config(input_data: FinetuneConfigCreate):
    """Create a new fine-tuning configuration"""
    # Verify experiment exists
    experiment = await db.experiments.find_one({"id": input_data.experiment_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    config = FinetuneConfig(**input_data.model_dump())
    doc = config.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.finetune_configs.insert_one(doc)
    return config


@api_router.post("/finetune/{finetune_id}/start")
async def start_finetune(finetune_id: str):
    """Start fine-tuning (simulated)"""
    config = await db.finetune_configs.find_one({"id": finetune_id}, {"_id": 0})
    if not config:
        raise HTTPException(status_code=404, detail="Fine-tune configuration not found")
    
    # Get labeled dataset info
    dataset = await db.datasets.find_one({"id": config.get('labeled_dataset_id')}, {"_id": 0})
    label_percent = 10.0
    if dataset:
        total = dataset.get('num_samples', 100)
        labeled = dataset.get('num_labeled', 10)
        label_percent = (labeled / total * 100) if total > 0 else 10.0
    
    # Generate evaluation metrics
    metrics = generate_evaluation_metrics(
        num_labels_percent=label_percent,
        is_ssl_pretrained=True
    )
    
    # Create evaluation record
    eval_metrics = EvaluationMetrics(
        experiment_id=config.get('experiment_id'),
        finetune_id=finetune_id,
        **metrics
    )
    
    eval_doc = eval_metrics.model_dump()
    eval_doc['evaluated_at'] = eval_doc['evaluated_at'].isoformat()
    await db.evaluations.insert_one(eval_doc)
    
    # Update fine-tune status
    await db.finetune_configs.update_one(
        {"id": finetune_id},
        {
            "$set": {
                "status": TrainingStatus.COMPLETED.value,
                "current_epoch": config.get('num_epochs', 50)
            }
        }
    )
    
    return {"message": "Fine-tuning completed", "metrics": metrics}


# ============== EVALUATIONS ==============

@api_router.get("/evaluations")
async def get_evaluations():
    """Get all evaluation results"""
    evals = await db.evaluations.find({}, {"_id": 0}).to_list(1000)
    for e in evals:
        if isinstance(e.get('evaluated_at'), str):
            e['evaluated_at'] = datetime.fromisoformat(e['evaluated_at'])
    return evals


@api_router.get("/evaluations/compare")
async def compare_models():
    """Compare SSL vs supervised models with label efficiency"""
    comparison = generate_label_efficiency_curve()
    return comparison


# ============== VISUALIZATION DATA ==============

@api_router.get("/visualization/embeddings")
async def get_embeddings(num_samples: int = 100):
    """Get contrastive learning embeddings for visualization"""
    embeddings = generate_contrastive_embeddings(num_samples=num_samples)
    return {"embeddings": embeddings}


@api_router.get("/visualization/slice/{slice_idx}")
async def get_slice_data(slice_idx: int, total_slices: int = 128):
    """Get mock slice data for volume viewer"""
    data = generate_slice_data(
        slice_idx=slice_idx,
        total_slices=total_slices,
        include_segmentation=True
    )
    return data


# ============== DASHBOARD ==============

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_datasets = await db.datasets.count_documents({})
    total_experiments = await db.experiments.count_documents({})
    completed = await db.experiments.count_documents({"status": TrainingStatus.COMPLETED.value})
    running = await db.experiments.count_documents({"status": TrainingStatus.RUNNING.value})
    
    # Get average dice score from evaluations
    pipeline = [
        {"$group": {"_id": None, "avg_dice": {"$avg": "$dice_score"}}}
    ]
    avg_result = await db.evaluations.aggregate(pipeline).to_list(1)
    avg_dice = avg_result[0]['avg_dice'] if avg_result else None
    
    # Get best performing model
    best_eval = await db.evaluations.find_one(
        {},
        {"_id": 0},
        sort=[("dice_score", -1)]
    )
    best_model = None
    if best_eval:
        exp = await db.experiments.find_one({"id": best_eval.get('experiment_id')}, {"_id": 0})
        if exp:
            best_model = exp.get('name')
    
    return DashboardStats(
        total_datasets=total_datasets,
        total_experiments=total_experiments,
        completed_experiments=completed,
        running_experiments=running,
        avg_dice_score=round(avg_dice, 4) if avg_dice else None,
        best_model_name=best_model
    )


@api_router.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "MedVision SSL Framework API",
        "version": "1.0.0",
        "endpoints": {
            "datasets": "/api/datasets",
            "models": "/api/models",
            "experiments": "/api/experiments",
            "finetune": "/api/finetune",
            "evaluations": "/api/evaluations",
            "visualization": "/api/visualization",
            "dashboard": "/api/dashboard/stats"
        }
    }


# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_demo_data():
    """Seed database with demo data for testing"""
    
    # Clear existing data
    await db.datasets.delete_many({})
    await db.model_configs.delete_many({})
    await db.experiments.delete_many({})
    await db.finetune_configs.delete_many({})
    await db.evaluations.delete_many({})
    
    # Create sample datasets
    datasets = [
        Dataset(
            name="BraTS 2023 - Brain Tumor",
            modality=Modality.MRI,
            description="Multi-institutional brain tumor MRI dataset",
            num_samples=1500,
            num_labeled=150,
            resolution="240x240x155"
        ),
        Dataset(
            name="NIH Chest CT",
            modality=Modality.CT,
            description="Chest CT scans from NIH Clinical Center",
            num_samples=2400,
            num_labeled=240,
            resolution="512x512x256"
        ),
        Dataset(
            name="BTCV - Abdomen CT",
            modality=Modality.CT,
            description="Beyond The Cranial Vault abdomen CT",
            num_samples=800,
            num_labeled=80,
            resolution="512x512x128"
        ),
        Dataset(
            name="PET-CT Lung",
            modality=Modality.PET,
            description="PET-CT lung cancer imaging data",
            num_samples=600,
            num_labeled=60,
            resolution="128x128x64"
        )
    ]
    
    for ds in datasets:
        doc = ds.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.datasets.insert_one(doc)
    
    # Create model configurations
    models = [
        ModelConfig(
            name="3D UNet Encoder",
            architecture=ModelArchitecture.UNET_3D,
            encoder_depth=5,
            num_channels=1,
            feature_dim=512,
            projection_dim=128,
            parameters_count=31_000_000
        ),
        ModelConfig(
            name="ViT-Base 3D",
            architecture=ModelArchitecture.VIT,
            encoder_depth=12,
            num_channels=1,
            feature_dim=768,
            projection_dim=256,
            parameters_count=86_000_000
        ),
        ModelConfig(
            name="3D UNet Light",
            architecture=ModelArchitecture.UNET_3D,
            encoder_depth=4,
            num_channels=1,
            feature_dim=256,
            projection_dim=64,
            parameters_count=12_000_000
        )
    ]
    
    for m in models:
        doc = m.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.model_configs.insert_one(doc)
    
    # Create experiments with metrics
    experiments_data = [
        {
            "name": "Brain Tumor SSL - Contrastive",
            "dataset_id": datasets[0].id,
            "model_config_id": models[0].id,
            "pretraining_method": PretrainingMethod.CONTRASTIVE,
            "status": TrainingStatus.COMPLETED,
            "epochs": 100
        },
        {
            "name": "Chest CT - MAE Pretraining",
            "dataset_id": datasets[1].id,
            "model_config_id": models[1].id,
            "pretraining_method": PretrainingMethod.MAE,
            "status": TrainingStatus.COMPLETED,
            "epochs": 80
        },
        {
            "name": "Abdomen SSL - Cross-Modality",
            "dataset_id": datasets[2].id,
            "model_config_id": models[0].id,
            "pretraining_method": PretrainingMethod.CROSS_MODALITY,
            "status": TrainingStatus.RUNNING,
            "epochs": 50
        }
    ]
    
    for exp_data in experiments_data:
        metrics = generate_training_curve(
            num_epochs=exp_data["epochs"],
            warmup_epochs=10
        )
        
        experiment = Experiment(
            name=exp_data["name"],
            description=f"Self-supervised pretraining experiment",
            dataset_id=exp_data["dataset_id"],
            model_config_id=exp_data["model_config_id"],
            pretraining_method=exp_data["pretraining_method"],
            status=exp_data["status"],
            current_epoch=exp_data["epochs"] if exp_data["status"] == TrainingStatus.COMPLETED else exp_data["epochs"] // 2,
            best_loss=min(m['loss'] for m in metrics),
            metrics_history=metrics
        )
        
        doc = experiment.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.experiments.insert_one(doc)
        
        # Create evaluation for completed experiments
        if exp_data["status"] == TrainingStatus.COMPLETED:
            dataset = next(d for d in datasets if d.id == exp_data["dataset_id"])
            label_pct = (dataset.num_labeled / dataset.num_samples * 100)
            
            eval_metrics = generate_evaluation_metrics(
                num_labels_percent=label_pct,
                is_ssl_pretrained=True
            )
            
            evaluation = EvaluationMetrics(
                experiment_id=experiment.id,
                **eval_metrics
            )
            
            eval_doc = evaluation.model_dump()
            eval_doc['evaluated_at'] = eval_doc['evaluated_at'].isoformat()
            await db.evaluations.insert_one(eval_doc)
    
    return {
        "message": "Demo data seeded successfully",
        "datasets": len(datasets),
        "models": len(models),
        "experiments": len(experiments_data)
    }


# Include router in app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
