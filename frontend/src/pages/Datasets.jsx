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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Plus, 
  Database, 
  Trash2,
  Upload,
  FileImage
} from 'lucide-react';
import { datasetsApi } from '../lib/api';
import { formatNumber, formatRelativeDate, getModalityColor } from '../lib/utils';
import { toast } from 'sonner';

export function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDataset, setNewDataset] = useState({
    name: '',
    modality: 'ct',
    description: '',
    num_samples: 100,
    num_labeled: 10,
    resolution: '256x256x128'
  });

  const fetchDatasets = useCallback(async () => {
    try {
      const res = await datasetsApi.getAll();
      setDatasets(res.data);
    } catch (error) {
      toast.error('Failed to load datasets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleCreate = async () => {
    try {
      await datasetsApi.create(newDataset);
      toast.success('Dataset created successfully');
      setIsDialogOpen(false);
      setNewDataset({
        name: '',
        modality: 'ct',
        description: '',
        num_samples: 100,
        num_labeled: 10,
        resolution: '256x256x128'
      });
      fetchDatasets();
    } catch (error) {
      toast.error('Failed to create dataset');
    }
  };

  const handleDelete = async (id) => {
    try {
      await datasetsApi.delete(id);
      toast.success('Dataset deleted');
      fetchDatasets();
    } catch (error) {
      toast.error('Failed to delete dataset');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Datasets" 
        subtitle="Manage medical imaging datasets"
        onRefresh={fetchDatasets}
        isRefreshing={isLoading}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {datasets.length} datasets
            </Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="dataset-add-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Dataset</DialogTitle>
                <DialogDescription>
                  Register a medical imaging dataset for SSL training
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Dataset Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., BraTS 2023"
                    value={newDataset.name}
                    onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })}
                    data-testid="dataset-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modality">Modality</Label>
                  <Select
                    value={newDataset.modality}
                    onValueChange={(v) => setNewDataset({ ...newDataset, modality: v })}
                  >
                    <SelectTrigger data-testid="dataset-modality-select">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ct">CT</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="pet">PET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="samples">Total Samples</Label>
                    <Input
                      id="samples"
                      type="number"
                      value={newDataset.num_samples}
                      onChange={(e) => setNewDataset({ ...newDataset, num_samples: parseInt(e.target.value) })}
                      data-testid="dataset-samples-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labeled">Labeled Samples</Label>
                    <Input
                      id="labeled"
                      type="number"
                      value={newDataset.num_labeled}
                      onChange={(e) => setNewDataset({ ...newDataset, num_labeled: parseInt(e.target.value) })}
                      data-testid="dataset-labeled-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Input
                    id="resolution"
                    placeholder="256x256x128"
                    value={newDataset.resolution}
                    onChange={(e) => setNewDataset({ ...newDataset, resolution: e.target.value })}
                    data-testid="dataset-resolution-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Dataset description..."
                    value={newDataset.description}
                    onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })}
                    data-testid="dataset-description-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} data-testid="dataset-submit-btn">Create Dataset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Datasets Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="table-header-cell">Name</TableHead>
                  <TableHead className="table-header-cell">Modality</TableHead>
                  <TableHead className="table-header-cell">Samples</TableHead>
                  <TableHead className="table-header-cell">Labeled</TableHead>
                  <TableHead className="table-header-cell">Resolution</TableHead>
                  <TableHead className="table-header-cell">Created</TableHead>
                  <TableHead className="table-header-cell w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Database className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No datasets yet</p>
                      <p className="text-sm text-muted-foreground/70">Add a dataset to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  datasets.map((dataset) => (
                    <TableRow key={dataset.id} data-testid={`dataset-row-${dataset.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                            <FileImage className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{dataset.name}</p>
                            {dataset.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {dataset.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getModalityColor(dataset.modality)} uppercase text-xs`}
                        >
                          {dataset.modality}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatNumber(dataset.num_samples)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{formatNumber(dataset.num_labeled)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((dataset.num_labeled / dataset.num_samples) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {dataset.resolution}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatRelativeDate(dataset.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(dataset.id)}
                          className="hover:text-destructive"
                          data-testid={`dataset-delete-${dataset.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">CT</span>
                </div>
                Computed Tomography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                X-ray based imaging for detailed bone and tissue visualization. 
                Ideal for lung and abdominal scans.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">MRI</span>
                </div>
                Magnetic Resonance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Non-ionizing imaging for soft tissue contrast. 
                Best for brain, spine, and joint imaging.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">PET</span>
                </div>
                Positron Emission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Metabolic imaging using radioactive tracers. 
                Excellent for cancer detection and staging.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Datasets;
