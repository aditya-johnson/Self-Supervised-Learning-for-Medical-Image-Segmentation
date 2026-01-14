import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { TrainingChart } from '../components/dashboard/TrainingChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Activity, 
  Clock,
  TrendingDown,
  Zap
} from 'lucide-react';
import { experimentsApi } from '../lib/api';
import { formatPretrainingMethod, getStatusColor } from '../lib/utils';
import { toast } from 'sonner';

export function Training() {
  const [experiments, setExperiments] = useState([]);
  const [selectedExpId, setSelectedExpId] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExperiments = useCallback(async () => {
    try {
      const res = await experimentsApi.getAll();
      setExperiments(res.data);
      // Auto-select first completed or running experiment
      const active = res.data.find(e => e.status === 'running' || e.status === 'completed');
      if (active && !selectedExpId) {
        setSelectedExpId(active.id);
      }
    } catch (error) {
      toast.error('Failed to load experiments');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExpId]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  useEffect(() => {
    if (selectedExpId) {
      fetchMetrics(selectedExpId);
    }
  }, [selectedExpId]);

  const fetchMetrics = async (expId) => {
    try {
      const res = await experimentsApi.getMetrics(expId);
      setMetrics(res.data);
    } catch (error) {
      console.error('Failed to fetch metrics');
    }
  };

  const selectedExp = experiments.find(e => e.id === selectedExpId);
  const progress = selectedExp?.training_config?.num_epochs 
    ? (selectedExp.current_epoch / selectedExp.training_config.num_epochs) * 100 
    : 0;

  // Calculate statistics from metrics
  const metricsHistory = metrics?.metrics_history || [];
  const currentLoss = metricsHistory.length > 0 
    ? metricsHistory[metricsHistory.length - 1].loss 
    : null;
  const avgLoss = metricsHistory.length > 0 
    ? metricsHistory.reduce((sum, m) => sum + m.loss, 0) / metricsHistory.length 
    : null;
  const minLoss = metricsHistory.length > 0 
    ? Math.min(...metricsHistory.map(m => m.loss)) 
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Training Monitor" 
        subtitle="Real-time training progress and metrics"
        onRefresh={() => {
          fetchExperiments();
          if (selectedExpId) fetchMetrics(selectedExpId);
        }}
        isRefreshing={isLoading}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Experiment Selector */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Select Experiment</Label>
                <Select value={selectedExpId} onValueChange={setSelectedExpId}>
                  <SelectTrigger data-testid="training-experiment-select">
                    <SelectValue placeholder="Choose an experiment to monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiments.map(exp => (
                      <SelectItem key={exp.id} value={exp.id}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            exp.status === 'running' ? 'bg-cyan-400 animate-pulse' :
                            exp.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-400'
                          }`} />
                          {exp.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedExp && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {formatPretrainingMethod(selectedExp.pretraining_method)}
                  </Badge>
                  <span className={`text-sm capitalize ${getStatusColor(selectedExp.status)}`}>
                    {selectedExp.status}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedExp ? (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Epoch</p>
                      <p className="text-2xl font-bold font-mono">{selectedExp.current_epoch}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Loss</p>
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        {currentLoss?.toFixed(4) || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Best Loss</p>
                      <p className="text-2xl font-bold font-mono text-cyan-400">
                        {minLoss?.toFixed(4) || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold font-mono">{progress.toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training Progress Bar */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Training Progress</span>
                    <span className="font-mono">
                      {selectedExp.current_epoch} / {selectedExp.training_config?.num_epochs || 100} epochs
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Training Chart */}
            <TrainingChart 
              data={metricsHistory}
              title={`Loss Curves: ${selectedExp.name}`}
            />

            {/* Training Config */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Training Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Learning Rate</p>
                    <p className="font-mono text-lg">
                      {selectedExp.training_config?.learning_rate || 0.0001}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Batch Size</p>
                    <p className="font-mono text-lg">
                      {selectedExp.training_config?.batch_size || 4}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Warmup Epochs</p>
                    <p className="font-mono text-lg">
                      {selectedExp.training_config?.warmup_epochs || 10}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Temperature (τ)</p>
                    <p className="font-mono text-lg">
                      {selectedExp.training_config?.temperature || 0.07}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No experiment selected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Select an experiment above to view training progress
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function Label({ children, className, ...props }) {
  return <label className={`text-sm font-medium ${className}`} {...props}>{children}</label>;
}

export default Training;
