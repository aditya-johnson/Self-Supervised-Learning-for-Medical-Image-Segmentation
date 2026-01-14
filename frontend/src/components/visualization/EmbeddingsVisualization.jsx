import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = [
  'hsl(187, 92%, 42%)',  // cyan - primary
  'hsl(160, 60%, 45%)',  // emerald
  'hsl(217, 91%, 60%)',  // blue
  'hsl(43, 74%, 66%)',   // amber
  'hsl(280, 65%, 60%)',  // purple
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-heavy p-3 rounded-md border border-white/10">
        <p className="text-sm font-medium text-foreground capitalize">{data.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Confidence: <span className="font-mono text-primary">{(data.confidence * 100).toFixed(0)}%</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Position: ({data.x.toFixed(2)}, {data.y.toFixed(2)})
        </p>
      </div>
    );
  }
  return null;
};

export function EmbeddingsVisualization({ data, title = "Contrastive Embeddings (t-SNE)" }) {
  // Default demo data if not provided
  const embeddings = data?.embeddings || generateDemoEmbeddings();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Learned representation clusters from self-supervised pretraining
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsla(215, 20%, 65%, 0.1)"
              />
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[-12, 12]}
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[-12, 12]}
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={embeddings} fill="hsl(187, 92%, 42%)">
                {embeddings.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.cluster % COLORS.length]}
                    opacity={entry.confidence}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {['Liver', 'Kidney', 'Spleen', 'Lung', 'Heart'].map((label, idx) => (
            <div key={label} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function generateDemoEmbeddings() {
  const clusters = [
    { cx: -6, cy: -5, label: 'liver' },
    { cx: 5, cy: -4, label: 'kidney' },
    { cx: -3, cy: 6, label: 'spleen' },
    { cx: 6, cy: 5, label: 'lung' },
    { cx: 0, cy: 0, label: 'heart' },
  ];
  
  const embeddings = [];
  clusters.forEach((cluster, clusterIdx) => {
    for (let i = 0; i < 20; i++) {
      embeddings.push({
        id: clusterIdx * 20 + i,
        x: cluster.cx + (Math.random() - 0.5) * 3,
        y: cluster.cy + (Math.random() - 0.5) * 3,
        cluster: clusterIdx,
        label: cluster.label,
        confidence: 0.7 + Math.random() * 0.3,
      });
    }
  });
  
  return embeddings;
}

export default EmbeddingsVisualization;
