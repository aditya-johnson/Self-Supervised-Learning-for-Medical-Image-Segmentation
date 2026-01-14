import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with K/M suffix
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format a percentage
 */
export function formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a metric value with appropriate precision
 */
export function formatMetric(value, type = 'default') {
  if (value === null || value === undefined) return '—';
  
  switch (type) {
    case 'dice':
    case 'iou':
    case 'precision':
    case 'recall':
      return (value * 100).toFixed(1) + '%';
    case 'hausdorff':
      return value.toFixed(2) + ' mm';
    case 'loss':
      return value.toFixed(4);
    case 'parameters':
      return formatNumber(value);
    default:
      return typeof value === 'number' ? value.toFixed(4) : value;
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'text-emerald-400';
    case 'running':
      return 'text-cyan-400';
    case 'failed':
      return 'text-red-400';
    case 'paused':
      return 'text-amber-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get status dot class
 */
export function getStatusDotClass(status) {
  switch (status) {
    case 'completed':
      return 'status-dot-completed';
    case 'running':
      return 'status-dot-running';
    case 'failed':
      return 'status-dot-failed';
    default:
      return 'status-dot-pending';
  }
}

/**
 * Get modality color
 */
export function getModalityColor(modality) {
  switch (modality) {
    case 'mri':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'ct':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'pet':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format architecture name for display
 */
export function formatArchitecture(arch) {
  switch (arch) {
    case '3d_unet':
      return '3D UNet';
    case 'vit':
      return 'ViT';
    default:
      return arch;
  }
}

/**
 * Format pretraining method for display
 */
export function formatPretrainingMethod(method) {
  switch (method) {
    case 'contrastive':
      return 'Contrastive Learning';
    case 'mae':
      return 'Masked Autoencoding';
    case 'cross_modality':
      return 'Cross-Modality';
    default:
      return method;
  }
}
