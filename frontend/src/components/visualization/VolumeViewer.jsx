import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Crosshair,
  Eye,
  EyeOff
} from 'lucide-react';

export function VolumeViewer({ sliceData, onSliceChange }) {
  const [currentSlice, setCurrentSlice] = useState(64);
  const [showSegmentation, setShowSegmentation] = useState(true);
  const [zoom, setZoom] = useState(1);
  const totalSlices = sliceData?.total_slices || 128;

  const handleSliceChange = (value) => {
    setCurrentSlice(value[0]);
    if (onSliceChange) {
      onSliceChange(value[0]);
    }
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">Volume Viewer</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Slice {currentSlice} of {totalSlices}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="volume-zoom-out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="volume-zoom-in">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="volume-reset">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button 
            variant={showSegmentation ? "secondary" : "ghost"} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setShowSegmentation(!showSegmentation)}
            data-testid="volume-toggle-segmentation"
          >
            {showSegmentation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Main Viewer */}
        <div className="relative aspect-square bg-slate-950 volume-canvas">
          {/* Grid overlay */}
          <div className="volume-viewer-grid" />
          
          {/* Mock medical image placeholder */}
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="relative w-full h-full rounded-md overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              {/* Simulated brain/organ cross-section */}
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-80">
                <defs>
                  <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(215, 20%, 35%)" />
                    <stop offset="70%" stopColor="hsl(215, 20%, 20%)" />
                    <stop offset="100%" stopColor="hsl(215, 20%, 10%)" />
                  </radialGradient>
                  <radialGradient id="tumorGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(0, 84%, 50%)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(0, 84%, 30%)" stopOpacity="0.4" />
                  </radialGradient>
                </defs>
                {/* Brain outline */}
                <ellipse cx="100" cy="100" rx="75" ry="80" fill="url(#brainGrad)" />
                {/* Internal structures */}
                <ellipse cx="70" cy="90" rx="25" ry="30" fill="hsl(215, 20%, 25%)" opacity="0.7" />
                <ellipse cx="130" cy="90" rx="25" ry="30" fill="hsl(215, 20%, 25%)" opacity="0.7" />
                {/* Tumor region (if segmentation enabled) */}
                {showSegmentation && (
                  <>
                    <ellipse cx="85" cy="75" rx="15" ry="12" fill="url(#tumorGrad)" className="animate-pulse" />
                    <ellipse cx="85" cy="75" rx="15" ry="12" fill="none" stroke="hsl(0, 84%, 60%)" strokeWidth="1.5" strokeDasharray="3 2" />
                  </>
                )}
              </svg>
              
              {/* Crosshair */}
              <div className="volume-viewer-crosshair" />
            </div>
          </div>

          {/* Slice number indicator */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/50 text-xs font-mono text-slate-300">
            Z: {currentSlice}
          </div>

          {/* Segmentation info */}
          {showSegmentation && sliceData?.segmentation && (
            <div className="absolute top-3 right-3 space-y-1">
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                Tumor: {sliceData.segmentation.tumor_volume_percent}%
              </Badge>
            </div>
          )}
        </div>

        {/* Slice slider */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[currentSlice]}
              min={1}
              max={totalSlices}
              step={1}
              onValueChange={handleSliceChange}
              className="flex-1"
              data-testid="volume-slice-slider"
            />
            <span className="text-xs font-mono text-muted-foreground w-12 text-right">
              {currentSlice}/{totalSlices}
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-secondary/50">
            <p className="text-xs text-muted-foreground">Mean</p>
            <p className="text-sm font-mono text-foreground">
              {sliceData?.mean_intensity?.toFixed(1) || '125.3'}
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/50">
            <p className="text-xs text-muted-foreground">Std Dev</p>
            <p className="text-sm font-mono text-foreground">
              {sliceData?.std_intensity?.toFixed(1) || '45.2'}
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/50">
            <p className="text-xs text-muted-foreground">Regions</p>
            <p className="text-sm font-mono text-foreground">
              {sliceData?.segmentation?.num_regions || '2'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VolumeViewer;
