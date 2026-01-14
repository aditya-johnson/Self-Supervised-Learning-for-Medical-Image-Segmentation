import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { StatsCard } from '../components/dashboard/StatsCard';
import { TrainingChart } from '../components/dashboard/TrainingChart';
import { LabelEfficiencyChart } from '../components/dashboard/LabelEfficiencyChart';
import { EmbeddingsVisualization } from '../components/visualization/EmbeddingsVisualization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Database, 
  FlaskConical, 
  Activity, 
  Target,
  TrendingUp,
  Cpu,
  Play,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { dashboardApi, experimentsApi, seedApi } from '../lib/api';
import { formatMetric, getStatusColor, getStatusDotClass, formatRelativeDate, formatPretrainingMethod } from '../lib/utils';
import { toast } from 'sonner';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, experimentsRes] = await Promise.all([
        dashboardApi.getStats(),
        experimentsApi.getAll()
      ]);
      setStats(statsRes.data);
      setExperiments(experimentsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleSeedData = async () => {
    try {
      await seedApi.seedData();
      toast.success('Demo data seeded successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to seed data');
    }
  };

  const recentExperiments = experiments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  // Get active experiment metrics for chart
  const activeExperiment = experiments.find(e => e.status === 'completed' && e.metrics_history?.length > 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Self-Supervised Learning Framework Overview"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Quick Actions */}
        {(!stats || stats.total_experiments === 0) && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Get started with demo data</p>
                <p className="text-sm text-muted-foreground">Load sample datasets, models, and experiments</p>
              </div>
              <Button onClick={handleSeedData} data-testid="dashboard-seed-btn">
                <Play className="w-4 h-4 mr-2" />
                Load Demo Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Datasets"
            value={stats?.total_datasets || 0}
            icon={Database}
            variant="primary"
            subtitle="CT, MRI, PET"
          />
          <StatsCard
            title="Experiments"
            value={stats?.total_experiments || 0}
            icon={FlaskConical}
            subtitle={`${stats?.completed_experiments || 0} completed`}
          />
          <StatsCard
            title="Running"
            value={stats?.running_experiments || 0}
            icon={Activity}
            variant={stats?.running_experiments > 0 ? 'warning' : 'default'}
            subtitle="Active training"
          />
          <StatsCard
            title="Best Dice Score"
            value={stats?.avg_dice_score ? formatMetric(stats.avg_dice_score, 'dice') : '—'}
            icon={Target}
            variant="success"
            subtitle={stats?.best_model_name || 'No evaluations yet'}
            trend={stats?.avg_dice_score ? 'up' : undefined}
            trendValue={stats?.avg_dice_score ? '+2.1% vs baseline' : undefined}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Training Progress - Large */}
          <div className="lg:col-span-8">
            <TrainingChart 
              data={activeExperiment?.metrics_history || []}
              title={activeExperiment ? `Training Progress: ${activeExperiment.name}` : 'Training Progress'}
            />
          </div>

          {/* Recent Experiments */}
          <div className="lg:col-span-4">
            <Card className="border-border/50 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Recent Experiments</CardTitle>
                <CardDescription>Latest SSL pretraining runs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentExperiments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No experiments yet</p>
                  </div>
                ) : (
                  recentExperiments.map((exp) => (
                    <div 
                      key={exp.id}
                      className="p-3 rounded-lg bg-secondary/30 border border-white/5 hover:border-primary/30 transition-colors"
                      data-testid={`experiment-card-${exp.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{exp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPretrainingMethod(exp.pretraining_method)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`status-dot ${getStatusDotClass(exp.status)}`} />
                          <span className={`text-xs capitalize ${getStatusColor(exp.status)}`}>
                            {exp.status}
                          </span>
                        </div>
                      </div>
                      
                      {exp.status === 'running' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Epoch {exp.current_epoch}</span>
                            <span>{Math.round((exp.current_epoch / exp.training_config?.num_epochs) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(exp.current_epoch / (exp.training_config?.num_epochs || 100)) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                      
                      {exp.status === 'completed' && exp.best_loss && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-muted-foreground">Loss:</span>
                            <span className="font-mono text-emerald-400">{exp.best_loss.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDate(exp.created_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LabelEfficiencyChart />
          <EmbeddingsVisualization />
        </div>

        {/* Architecture Overview */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">SSL Framework Architecture</CardTitle>
            <CardDescription>Self-supervised pretraining pipeline for medical imaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: '1', title: 'Unlabeled Data', desc: 'CT / MRI / PET', icon: Database },
                { step: '2', title: 'SSL Pretraining', desc: 'Contrastive / MAE', icon: Cpu },
                { step: '3', title: 'Fine-tuning', desc: 'Limited labels', icon: Target },
                { step: '4', title: 'Evaluation', desc: 'Dice / Hausdorff', icon: Activity },
                { step: '5', title: 'Deployment', desc: 'Clinical use', icon: TrendingUp },
              ].map((item, idx) => (
                <div 
                  key={item.step}
                  className="relative p-4 rounded-lg bg-secondary/30 border border-white/5 text-center group hover:border-primary/30 transition-colors"
                >
                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-primary/30 z-10" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="mb-2 text-xs">Step {item.step}</Badge>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Dashboard;
