"""
Pydantic models for Self-Supervised Learning Medical Imaging Framework
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class Modality(str, Enum):
    CT = "ct"
    MRI = "mri"
    PET = "pet"


class ModelArchitecture(str, Enum):
    UNET_3D = "3d_unet"
    VIT = "vit"


class TrainingStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class PretrainingMethod(str, Enum):
    CONTRASTIVE = "contrastive"
    MAE = "mae"
    CROSS_MODALITY = "cross_modality"


# Dataset Models
class DatasetBase(BaseModel):
    name: str
    modality: Modality
    description: Optional[str] = None
    num_samples: int = 0
    num_labeled: int = 0
    resolution: Optional[str] = "256x256x128"


class DatasetCreate(DatasetBase):
    pass


class Dataset(DatasetBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    file_path: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Model Configuration Models
class ModelConfigBase(BaseModel):
    name: str
    architecture: ModelArchitecture
    encoder_depth: int = 5
    num_channels: int = 1
    feature_dim: int = 512
    projection_dim: int = 128
    use_pretrained: bool = False


class ModelConfigCreate(ModelConfigBase):
    pass


class ModelConfig(ModelConfigBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    parameters_count: Optional[int] = None


# Training Configuration
class TrainingConfig(BaseModel):
    learning_rate: float = 1e-4
    batch_size: int = 4
    num_epochs: int = 100
    warmup_epochs: int = 10
    temperature: float = 0.07
    loss_type: str = "nt_xent"
    optimizer: str = "adamw"
    scheduler: str = "cosine"
    augmentation_strength: float = 0.5


# Pretraining Experiment Models
class ExperimentBase(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_id: str
    model_config_id: str
    pretraining_method: PretrainingMethod
    training_config: TrainingConfig = Field(default_factory=TrainingConfig)


class ExperimentCreate(ExperimentBase):
    pass


class Experiment(ExperimentBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: TrainingStatus = TrainingStatus.PENDING
    current_epoch: int = 0
    best_loss: Optional[float] = None
    metrics_history: List[Dict[str, Any]] = Field(default_factory=list)


# Fine-tuning Models
class FinetuneConfigBase(BaseModel):
    experiment_id: str
    labeled_dataset_id: str
    learning_rate: float = 1e-5
    batch_size: int = 2
    num_epochs: int = 50
    freeze_encoder: bool = False
    decoder_type: str = "segmentation"


class FinetuneConfigCreate(FinetuneConfigBase):
    pass


class FinetuneConfig(FinetuneConfigBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: TrainingStatus = TrainingStatus.PENDING
    current_epoch: int = 0


# Evaluation Metrics
class EvaluationMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    experiment_id: str
    finetune_id: Optional[str] = None
    dice_score: float
    hausdorff_distance: float
    precision: float
    recall: float
    iou: float
    label_efficiency: Optional[float] = None
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Training Metrics (for real-time updates)
class TrainingMetric(BaseModel):
    epoch: int
    loss: float
    contrastive_loss: Optional[float] = None
    reconstruction_loss: Optional[float] = None
    learning_rate: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Summary Stats
class DashboardStats(BaseModel):
    total_datasets: int
    total_experiments: int
    completed_experiments: int
    running_experiments: int
    avg_dice_score: Optional[float] = None
    best_model_name: Optional[str] = None
