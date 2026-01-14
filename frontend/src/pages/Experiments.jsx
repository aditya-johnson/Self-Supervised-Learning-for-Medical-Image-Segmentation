import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Plus, 
  FlaskConical, 
  Trash2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Pause
} from 'lucide-react';
import { experimentsApi, datasetsApi, modelsApi } from '../lib/api';
import { 
  formatRelativeDate, 
  formatPretrainingMethod, 
  getStatusColor, 
  getStatusDotClass 
} from '../lib/utils';
import { toast } from 'sonner';

export function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    dataset_id: '',
    model_config_id: '',
    pretraining_method: 'contrastive',
    training_config: {
      learning_rate: 0.0001,
      batch_size: 4,
      num_epochs: 100,
      warmup_epochs: 10,
      temperature: 0.07
    }
  });

  const fetchData = useCallback(async () => {
    try {
      const [expRes, dsRes, modelRes] = await Promise.all([
        experimentsApi.getAll(),
        datasetsApi.getAll(),
        modelsApi.getAll()
      ]);
      setExperiments(expRes.data);
      setDatasets(dsRes.data);
      setModels(modelRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!newExperiment.dataset_id || !newExperiment.model_config_id) {
      toast.error('Please select dataset and model');
      return;
    }
    try {
      await experimentsApi.create(newExperiment);
      toast.success('Experiment created');
      setIsDialogOpen(false);
      setNewExperiment({
        name: '',
        description: '',
        dataset_id: '',
        model_config_id: '',
        pretraining_method: 'contrastive',
        training_config: {
          learning_rate: 0.0001,
          batch_size: 4,
          num_epochs: 100,
          warmup_epochs: 10,
          temperature: 0.07
        }
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create experiment');
    }
  };

  const handleStart = async (id) => {
    try {
      toast.info('Starting training...');
      await experimentsApi.start(id);
      toast.success('Training completed');
      fetchData();
    } catch (error) {
      toast.error('Training failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await experimentsApi.delete(id);
      toast.success('Experiment deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete experiment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'running':
        return <Play className="w-4 h-4 text-cyan-400 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Experiments" 
        subtitle="Self-supervised pretraining experiments"
        onRefresh={fetchData}
        isRefreshing={isLoading}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {experiments.length} experiments
            </Badge>
            <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/30">
              {experiments.filter(e => e.status === 'completed').length} completed
            </Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="experiment-add-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create SSL Experiment</DialogTitle>
                <DialogDescription>
                  Configure a self-supervised pretraining experiment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Experiment Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Brain Tumor SSL v1"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                    data-testid="experiment-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dataset</Label>
                  <Select
                    value={newExperiment.dataset_id}
                    onValueChange={(v) => setNewExperiment({ ...newExperiment, dataset_id: v })}
                  >
                    <SelectTrigger data-testid="experiment-dataset-select">
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map(ds => (
                        <SelectItem key={ds.id} value={ds.id}>
                          {ds.name} ({ds.modality.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model Configuration</Label>
                  <Select
                    value={newExperiment.model_config_id}
                    onValueChange={(v) => setNewExperiment({ ...newExperiment, model_config_id: v })}
                  >
                    <SelectTrigger data-testid="experiment-model-select">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pretraining Method</Label>
                  <Select
                    value={newExperiment.pretraining_method}
                    onValueChange={(v) => setNewExperiment({ ...newExperiment, pretraining_method: v })}
                  >
                    <SelectTrigger data-testid="experiment-method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrastive">Contrastive Learning</SelectItem>
                      <SelectItem value="mae">Masked Autoencoding (MAE)</SelectItem>
                      <SelectItem value="cross_modality">Cross-Modality Prediction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-4">Training Configuration</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Epochs</Label>
                        <span className="text-sm font-mono text-muted-foreground">
                          {newExperiment.training_config.num_epochs}
                        </span>
                      </div>
                      <Slider
                        value={[newExperiment.training_config.num_epochs]}
                        min={10}
                        max={200}
                        step={10}
                        onValueChange={([v]) => setNewExperiment({
                          ...newExperiment,
                          training_config: { ...newExperiment.training_config, num_epochs: v }
                        })}
                        data-testid="experiment-epochs-slider"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lr">Learning Rate</Label>
                        <Input
                          id="lr"
                          type="number"
                          step="0.0001"
                          value={newExperiment.training_config.learning_rate}
                          onChange={(e) => setNewExperiment({
                            ...newExperiment,
                            training_config: { ...newExperiment.training_config, learning_rate: parseFloat(e.target.value) }
                          })}
                          data-testid="experiment-lr-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch">Batch Size</Label>
                        <Input
                          id="batch"
                          type="number"
                          value={newExperiment.training_config.batch_size}
                          onChange={(e) => setNewExperiment({
                            ...newExperiment,
                            training_config: { ...newExperiment.training_config, batch_size: parseInt(e.target.value) }
                          })}
                          data-testid="experiment-batch-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} data-testid="experiment-submit-btn">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.length === 0 ? (
            <Card className="col-span-full border-border/50">
              <CardContent className="py-12 text-center">
                <FlaskConical className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">No experiments yet</p>
                <p className="text-sm text-muted-foreground/70">Create an experiment to start training</p>
              </CardContent>
            </Card>
          ) : (
            experiments.map((exp) => {
              const dataset = datasets.find(d => d.id === exp.dataset_id);
              const model = models.find(m => m.id === exp.model_config_id);
              const progress = exp.training_config?.num_epochs 
                ? (exp.current_epoch / exp.training_config.num_epochs) * 100 
                : 0;

              return (
                <Card 
                  key={exp.id} 
                  className="border-border/50 hover:border-primary/30 transition-colors"
                  data-testid={`experiment-card-${exp.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getStatusIcon(exp.status)}
                          {exp.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatPretrainingMethod(exp.pretraining_method)}
                          </Badge>
                          <span className={`text-xs capitalize ${getStatusColor(exp.status)}`}>
                            {exp.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {exp.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleStart(exp.id)}
                            className="text-emerald-400 hover:text-emerald-300"
                            data-testid={`experiment-start-${exp.id}`}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(exp.id)}
                          className="hover:text-destructive"
                          data-testid={`experiment-delete-${exp.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dataset & Model Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Dataset</p>
                        <p className="font-medium truncate">{dataset?.name || 'Unknown'}</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Model</p>
                        <p className="font-medium truncate">{model?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    {(exp.status === 'running' || exp.status === 'completed') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Epoch {exp.current_epoch} / {exp.training_config?.num_epochs || 100}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Metrics */}
                    {exp.best_loss && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs text-muted-foreground">Best Loss</span>
                        <span className="font-mono text-sm text-emerald-400">{exp.best_loss.toFixed(4)}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Created {formatRelativeDate(exp.created_at)}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Experiments;
