import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-heavy p-3 rounded-md border border-white/10">
        <p className="text-xs text-muted-foreground mb-2">Epoch {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-mono">{entry.value.toFixed(4)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrainingChart({ 
  data = [], 
  title = 'Training Progress',
  showContrastive = true,
  showReconstruction = true 
}) {
  // Sample data for visualization if no data provided
  const chartData = data.length > 0 ? data : Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    loss: 2.5 * Math.exp(-0.03 * i) + 0.1 + Math.random() * 0.1,
    contrastive_loss: 1.8 * Math.exp(-0.025 * i) + 0.08 + Math.random() * 0.08,
    reconstruction_loss: 0.7 * Math.exp(-0.035 * i) + 0.02 + Math.random() * 0.02,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsla(215, 20%, 65%, 0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="epoch" 
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
                label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
              />
              <YAxis 
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
                width={50}
                label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="loss" 
                name="Total Loss"
                stroke="hsl(187, 92%, 42%)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(187, 92%, 42%)' }}
              />
              {showContrastive && (
                <Line 
                  type="monotone" 
                  dataKey="contrastive_loss" 
                  name="Contrastive"
                  stroke="hsl(160, 60%, 45%)" 
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showReconstruction && (
                <Line 
                  type="monotone" 
                  dataKey="reconstruction_loss" 
                  name="Reconstruction"
                  stroke="hsl(43, 74%, 66%)" 
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="3 3"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrainingChart;
