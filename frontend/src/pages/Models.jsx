import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
  Cpu, 
  Trash2,
  Layers,
  Network
} from 'lucide-react';
import { modelsApi } from '../lib/api';
import { formatNumber, formatRelativeDate, formatArchitecture } from '../lib/utils';
import { toast } from 'sonner';

export function Models() {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    architecture: '3d_unet',
    encoder_depth: 5,
    num_channels: 1,
    feature_dim: 512,
    projection_dim: 128
  });

  const fetchModels = useCallback(async () => {
    try {
      const res = await modelsApi.getAll();
      setModels(res.data);
    } catch (error) {
      toast.error('Failed to load models');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleCreate = async () => {
    try {
      await modelsApi.create(newModel);
      toast.success('Model configuration created');
      setIsDialogOpen(false);
      setNewModel({
        name: '',
        architecture: '3d_unet',
        encoder_depth: 5,
        num_channels: 1,
        feature_dim: 512,
        projection_dim: 128
      });
      fetchModels();
    } catch (error) {
      toast.error('Failed to create model');
    }
  };

  const handleDelete = async (id) => {
    try {
      await modelsApi.delete(id);
      toast.success('Model deleted');
      fetchModels();
    } catch (error) {
      toast.error('Failed to delete model');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Model Configurations" 
        subtitle="Define encoder architectures for SSL pretraining"
        onRefresh={fetchModels}
        isRefreshing={isLoading}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-mono">
            {models.length} models
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="model-add-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Model Config
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Model Configuration</DialogTitle>
                <DialogDescription>
                  Define an encoder architecture for self-supervised learning
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., 3D UNet Base"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    data-testid="model-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Architecture</Label>
                  <Select
                    value={newModel.architecture}
                    onValueChange={(v) => setNewModel({ ...newModel, architecture: v })}
                  >
                    <SelectTrigger data-testid="model-architecture-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3d_unet">3D UNet Encoder</SelectItem>
                      <SelectItem value="vit">Vision Transformer (ViT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depth">Encoder Depth</Label>
                    <Input
                      id="depth"
                      type="number"
                      value={newModel.encoder_depth}
                      onChange={(e) => setNewModel({ ...newModel, encoder_depth: parseInt(e.target.value) })}
                      data-testid="model-depth-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channels">Input Channels</Label>
                    <Input
                      id="channels"
                      type="number"
                      value={newModel.num_channels}
                      onChange={(e) => setNewModel({ ...newModel, num_channels: parseInt(e.target.value) })}
                      data-testid="model-channels-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature">Feature Dim</Label>
                    <Input
                      id="feature"
                      type="number"
                      value={newModel.feature_dim}
                      onChange={(e) => setNewModel({ ...newModel, feature_dim: parseInt(e.target.value) })}
                      data-testid="model-feature-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projection">Projection Dim</Label>
                    <Input
                      id="projection"
                      type="number"
                      value={newModel.projection_dim}
                      onChange={(e) => setNewModel({ ...newModel, projection_dim: parseInt(e.target.value) })}
                      data-testid="model-projection-input"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} data-testid="model-submit-btn">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.length === 0 ? (
            <Card className="col-span-full border-border/50">
              <CardContent className="py-12 text-center">
                <Cpu className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">No model configurations</p>
                <p className="text-sm text-muted-foreground/70">Create a model config to start training</p>
              </CardContent>
            </Card>
          ) : (
            models.map((model) => (
              <Card 
                key={model.id} 
                className="border-border/50 hover:border-primary/30 transition-colors group"
                data-testid={`model-card-${model.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        model.architecture === 'vit' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {model.architecture === 'vit' ? (
                          <Network className="w-5 h-5" />
                        ) : (
                          <Layers className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{model.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {formatArchitecture(model.architecture)}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={() => handleDelete(model.id)}
                      data-testid={`model-delete-${model.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Depth</p>
                      <p className="font-mono">{model.encoder_depth}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Channels</p>
                      <p className="font-mono">{model.num_channels}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Feature Dim</p>
                      <p className="font-mono">{model.feature_dim}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Projection</p>
                      <p className="font-mono">{model.projection_dim}</p>
                    </div>
                  </div>
                  {model.parameters_count && (
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Parameters</span>
                      <span className="font-mono text-sm text-primary">
                        {formatNumber(model.parameters_count)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created {formatRelativeDate(model.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Architecture Comparison */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Architecture Comparison</CardTitle>
            <CardDescription>3D UNet vs Vision Transformer for medical imaging SSL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-secondary/30 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">3D UNet Encoder</h4>
                    <p className="text-xs text-muted-foreground">~31M parameters</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Excellent for volumetric data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Skip connections preserve spatial info
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Lower memory footprint
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Limited receptive field
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Network className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Vision Transformer</h4>
                    <p className="text-xs text-muted-foreground">~86M parameters</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Global attention mechanism
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Better long-range dependencies
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    State-of-the-art performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Higher computational cost
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Models;
