import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { VolumeViewer } from '../components/visualization/VolumeViewer';
import { LabelEfficiencyChart } from '../components/dashboard/LabelEfficiencyChart';
import { EmbeddingsVisualization } from '../components/visualization/EmbeddingsVisualization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  BarChart3, 
  Target,
  Ruler,
  Crosshair,
  TrendingUp
} from 'lucide-react';
import { evaluationsApi, visualizationApi, experimentsApi } from '../lib/api';
import { formatMetric, formatRelativeDate } from '../lib/utils';
import { toast } from 'sonner';

export function Results() {
  const [evaluations, setEvaluations] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [embeddings, setEmbeddings] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [sliceData, setSliceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [evalRes, compRes, embRes, expRes, sliceRes] = await Promise.all([
        evaluationsApi.getAll(),
        evaluationsApi.compare(),
        visualizationApi.getEmbeddings(100),
        experimentsApi.getAll(),
        visualizationApi.getSliceData(64)
      ]);
      setEvaluations(evalRes.data);
      setComparison(compRes.data);
      setEmbeddings(embRes.data);
      setExperiments(expRes.data);
      setSliceData(sliceRes.data);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSliceChange = async (sliceIdx) => {
    try {
      const res = await visualizationApi.getSliceData(sliceIdx);
      setSliceData(res.data);
    } catch (error) {
      console.error('Failed to fetch slice data');
    }
  };

  // Prepare comparison data for chart
  const chartData = comparison ? comparison.ssl_pretrained.map((ssl, idx) => ({
    label_percent: ssl.label_percent,
    ssl: ssl.dice_score,
    supervised: comparison.supervised[idx]?.dice_score || 0
  })) : null;

  // Get best evaluation
  const bestEval = evaluations.length > 0 
    ? evaluations.reduce((best, curr) => curr.dice_score > best.dice_score ? curr : best)
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Results & Evaluation" 
        subtitle="Segmentation metrics and model comparison"
        onRefresh={fetchData}
        isRefreshing={isLoading}
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Key Metrics */}
        {bestEval && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Best Dice Score</p>
                    <p className="text-2xl font-bold font-mono text-primary">
                      {formatMetric(bestEval.dice_score, 'dice')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Ruler className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hausdorff Dist.</p>
                    <p className="text-2xl font-bold font-mono">
                      {formatMetric(bestEval.hausdorff_distance, 'hausdorff')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crosshair className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Precision</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400">
                      {formatMetric(bestEval.precision, 'precision')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Recall</p>
                    <p className="text-2xl font-bold font-mono text-blue-400">
                      {formatMetric(bestEval.recall, 'recall')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">IoU</p>
                    <p className="text-2xl font-bold font-mono text-purple-400">
                      {formatMetric(bestEval.iou, 'iou')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="visualization" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="visualization" data-testid="results-tab-visualization">
              Volume Viewer
            </TabsTrigger>
            <TabsTrigger value="comparison" data-testid="results-tab-comparison">
              Model Comparison
            </TabsTrigger>
            <TabsTrigger value="evaluations" data-testid="results-tab-evaluations">
              All Evaluations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VolumeViewer 
                sliceData={sliceData} 
                onSliceChange={handleSliceChange}
              />
              <EmbeddingsVisualization data={embeddings} />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LabelEfficiencyChart data={chartData} />
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                  <CardDescription>SSL advantage at different label percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="table-header-cell">Labels %</TableHead>
                        <TableHead className="table-header-cell">SSL Dice</TableHead>
                        <TableHead className="table-header-cell">Supervised</TableHead>
                        <TableHead className="table-header-cell">Improvement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartData?.map((row) => {
                        const improvement = ((row.ssl - row.supervised) / row.supervised * 100);
                        return (
                          <TableRow key={row.label_percent}>
                            <TableCell className="font-mono">{row.label_percent}%</TableCell>
                            <TableCell className="font-mono text-primary">
                              {(row.ssl * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                              {(row.supervised * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={improvement > 0 
                                  ? 'text-emerald-400 border-emerald-500/30' 
                                  : 'text-red-400 border-red-500/30'
                                }
                              >
                                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evaluations">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Evaluation History</CardTitle>
                <CardDescription>All model evaluations with segmentation metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="table-header-cell">Experiment</TableHead>
                      <TableHead className="table-header-cell">Dice</TableHead>
                      <TableHead className="table-header-cell">Hausdorff</TableHead>
                      <TableHead className="table-header-cell">Precision</TableHead>
                      <TableHead className="table-header-cell">Recall</TableHead>
                      <TableHead className="table-header-cell">IoU</TableHead>
                      <TableHead className="table-header-cell">Label Eff.</TableHead>
                      <TableHead className="table-header-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <BarChart3 className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-muted-foreground">No evaluations yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      evaluations.map((eval_item) => {
                        const exp = experiments.find(e => e.id === eval_item.experiment_id);
                        return (
                          <TableRow key={eval_item.id}>
                            <TableCell className="font-medium">
                              {exp?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="font-mono text-primary">
                              {formatMetric(eval_item.dice_score, 'dice')}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatMetric(eval_item.hausdorff_distance, 'hausdorff')}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatMetric(eval_item.precision, 'precision')}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatMetric(eval_item.recall, 'recall')}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatMetric(eval_item.iou, 'iou')}
                            </TableCell>
                            <TableCell className="font-mono text-emerald-400">
                              {eval_item.label_efficiency?.toFixed(2) || '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatRelativeDate(eval_item.evaluated_at)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Results;
