import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = 'default',
  className 
}) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-muted-foreground';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/30 hover:border-primary/50';
      case 'success':
        return 'border-emerald-500/30 hover:border-emerald-500/50';
      case 'warning':
        return 'border-amber-500/30 hover:border-amber-500/50';
      case 'danger':
        return 'border-red-500/30 hover:border-red-500/50';
      default:
        return 'border-border/50 hover:border-primary/30';
    }
  };

  return (
    <Card className={cn(
      "stat-card transition-all duration-300",
      getVariantStyles(),
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight font-['Manrope']">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              variant === 'primary' ? 'bg-primary/20 text-primary' :
              variant === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              variant === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              variant === 'danger' ? 'bg-red-500/20 text-red-400' :
              'bg-muted text-muted-foreground'
            )}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
