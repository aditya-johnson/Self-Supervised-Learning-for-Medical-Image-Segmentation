"""
Training Simulator for Demo Mode
Generates realistic training metrics for visualization
"""
import random
import math
from typing import List, Dict, Any
from datetime import datetime, timezone


def generate_training_curve(
    num_epochs: int,
    initial_loss: float = 2.5,
    final_loss: float = 0.15,
    noise_level: float = 0.05,
    warmup_epochs: int = 10
) -> List[Dict[str, Any]]:
    """Generate realistic training loss curve with warmup and decay"""
    metrics = []
    
    for epoch in range(1, num_epochs + 1):
        # Warmup phase
        if epoch <= warmup_epochs:
            progress = epoch / warmup_epochs
            lr = 1e-4 * progress
            # Loss decreases slowly during warmup
            base_loss = initial_loss - (initial_loss - final_loss) * 0.1 * progress
        else:
            # Cosine annealing after warmup
            progress = (epoch - warmup_epochs) / (num_epochs - warmup_epochs)
            lr = 1e-4 * (1 + math.cos(math.pi * progress)) / 2
            
            # Exponential decay with plateau regions
            decay_factor = math.exp(-3 * progress)
            base_loss = final_loss + (initial_loss * 0.4 - final_loss) * decay_factor
        
        # Add realistic noise
        noise = random.gauss(0, noise_level * base_loss)
        loss = max(0.01, base_loss + noise)
        
        # Contrastive loss component
        contrastive_loss = loss * 0.7 + random.gauss(0, 0.02)
        
        # Reconstruction loss for MAE
        reconstruction_loss = loss * 0.3 + random.gauss(0, 0.01)
        
        metrics.append({
            "epoch": epoch,
            "loss": round(loss, 4),
            "contrastive_loss": round(max(0, contrastive_loss), 4),
            "reconstruction_loss": round(max(0, reconstruction_loss), 4),
            "learning_rate": round(lr, 6),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return metrics


def generate_evaluation_metrics(
    num_labels_percent: float = 10.0,
    is_ssl_pretrained: bool = True
) -> Dict[str, float]:
    """Generate evaluation metrics based on SSL pretraining and label availability"""
    
    # Base metrics for fully supervised with 100% labels
    base_dice = 0.85
    base_hausdorff = 5.0
    base_precision = 0.88
    base_recall = 0.83
    
    # SSL pretrained models perform better with limited labels
    if is_ssl_pretrained:
        # SSL models degrade less with fewer labels
        label_factor = 0.7 + 0.3 * (num_labels_percent / 100)
        ssl_bonus = 0.08
    else:
        # Supervised models degrade more with fewer labels
        label_factor = 0.4 + 0.6 * (num_labels_percent / 100)
        ssl_bonus = 0
    
    # Add realistic variation
    dice = min(0.95, (base_dice * label_factor + ssl_bonus) + random.gauss(0, 0.02))
    hausdorff = max(1.0, base_hausdorff / label_factor + random.gauss(0, 0.5))
    precision = min(0.95, (base_precision * label_factor + ssl_bonus * 0.5) + random.gauss(0, 0.02))
    recall = min(0.95, (base_recall * label_factor + ssl_bonus * 0.5) + random.gauss(0, 0.02))
    iou = dice * 0.92  # IoU typically slightly lower than Dice
    
    return {
        "dice_score": round(dice, 4),
        "hausdorff_distance": round(hausdorff, 2),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "iou": round(iou, 4),
        "label_efficiency": round(dice / (num_labels_percent / 100), 4) if num_labels_percent > 0 else 0
    }


def generate_label_efficiency_curve(
    label_percentages: List[float] = [1, 5, 10, 25, 50, 100]
) -> Dict[str, List[Dict[str, float]]]:
    """Generate label efficiency comparison between SSL and supervised"""
    
    ssl_metrics = []
    supervised_metrics = []
    
    for pct in label_percentages:
        ssl = generate_evaluation_metrics(pct, is_ssl_pretrained=True)
        sup = generate_evaluation_metrics(pct, is_ssl_pretrained=False)
        
        ssl_metrics.append({"label_percent": pct, **ssl})
        supervised_metrics.append({"label_percent": pct, **sup})
    
    return {
        "ssl_pretrained": ssl_metrics,
        "supervised": supervised_metrics
    }


def generate_contrastive_embeddings(
    num_samples: int = 100,
    num_clusters: int = 5
) -> List[Dict[str, Any]]:
    """Generate 2D t-SNE like embeddings for visualization"""
    embeddings = []
    
    # Create cluster centers
    centers = [
        (random.uniform(-8, 8), random.uniform(-8, 8))
        for _ in range(num_clusters)
    ]
    
    organ_labels = ["liver", "kidney", "spleen", "lung", "heart"]
    
    for i in range(num_samples):
        cluster_idx = i % num_clusters
        cx, cy = centers[cluster_idx]
        
        x = cx + random.gauss(0, 1.5)
        y = cy + random.gauss(0, 1.5)
        
        embeddings.append({
            "id": i,
            "x": round(x, 2),
            "y": round(y, 2),
            "cluster": cluster_idx,
            "label": organ_labels[cluster_idx],
            "confidence": round(0.7 + random.random() * 0.3, 2)
        })
    
    return embeddings


def generate_slice_data(
    slice_idx: int = 64,
    total_slices: int = 128,
    include_segmentation: bool = True
) -> Dict[str, Any]:
    """Generate mock slice data with intensity and segmentation info"""
    
    # Simulate intensity histogram
    intensities = [
        {"bin": i, "count": int(100 * math.exp(-((i - 128) ** 2) / 2000) + random.randint(0, 10))}
        for i in range(0, 256, 8)
    ]
    
    data = {
        "slice_index": slice_idx,
        "total_slices": total_slices,
        "dimensions": {"width": 256, "height": 256},
        "intensity_histogram": intensities,
        "mean_intensity": 125 + random.gauss(0, 10),
        "std_intensity": 45 + random.gauss(0, 5)
    }
    
    if include_segmentation:
        data["segmentation"] = {
            "num_regions": random.randint(1, 3),
            "tumor_volume_percent": round(random.uniform(0.5, 5.0), 2),
            "organ_coverage_percent": round(random.uniform(60, 85), 1)
        }
    
    return data
