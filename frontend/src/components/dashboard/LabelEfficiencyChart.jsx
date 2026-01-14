import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-heavy p-3 rounded-md border border-white/10">
        <p className="text-xs text-muted-foreground mb-2">{label}% Labels</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-mono">{(entry.value * 100).toFixed(1)}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LabelEfficiencyChart({ data }) {
  // Default comparison data if not provided
  const chartData = data || [
    { label_percent: 1, ssl: 0.68, supervised: 0.42 },
    { label_percent: 5, ssl: 0.76, supervised: 0.55 },
    { label_percent: 10, ssl: 0.82, supervised: 0.65 },
    { label_percent: 25, ssl: 0.87, supervised: 0.75 },
    { label_percent: 50, ssl: 0.90, supervised: 0.82 },
    { label_percent: 100, ssl: 0.92, supervised: 0.88 },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Label Efficiency Analysis</CardTitle>
        <CardDescription>SSL Pretrained vs Supervised (Dice Score)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsla(215, 20%, 65%, 0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="label_percent" 
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                label={{ value: '% Labeled Data', position: 'insideBottom', offset: -5, fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
              />
              <YAxis 
                domain={[0.3, 1]}
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsla(215, 20%, 65%, 0.2)' }}
                tickLine={false}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                width={50}
                label={{ value: 'Dice Score', angle: -90, position: 'insideLeft', fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <ReferenceLine 
                y={0.8} 
                stroke="hsla(215, 20%, 65%, 0.3)" 
                strokeDasharray="3 3"
                label={{ value: '80%', fill: 'hsl(215, 20%, 65%)', fontSize: 10, position: 'right' }}
              />
              <Line 
                type="monotone" 
                dataKey="ssl" 
                name="SSL Pretrained"
                stroke="hsl(187, 92%, 42%)" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(187, 92%, 42%)', r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(187, 92%, 42%)' }}
              />
              <Line 
                type="monotone" 
                dataKey="supervised" 
                name="Supervised"
                stroke="hsl(215, 20%, 65%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(215, 20%, 65%)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-medium">Key Insight:</span> SSL pretraining achieves 
            <span className="font-mono text-primary"> 82%</span> Dice score with only 
            <span className="font-mono text-primary"> 10%</span> labeled data, 
            matching supervised performance at <span className="font-mono">50%</span> labels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default LabelEfficiencyChart;
