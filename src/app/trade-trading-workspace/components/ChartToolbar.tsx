'use client';
import React from 'react';
import { MousePointer2, TrendingUp, Brush, GitBranch, Square, Type, Ruler, ZoomIn, Lock, Trash2 } from 'lucide-react';

interface Props {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
}

const TOOLS = [
  { id: 'cursor', icon: MousePointer2, label: 'Cursor' },
  { id: 'trendline', icon: TrendingUp, label: 'Trend Line' },
  { id: 'brush', icon: Brush, label: 'Brush' },
  { id: 'fibonacci', icon: GitBranch, label: 'Fibonacci Retracement' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'text', icon: Type, label: 'Text Annotation' },
  { id: 'measure', icon: Ruler, label: 'Measurement Tool' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
];

export default function ChartToolbar({ selectedTool, onSelectTool }: Props) {
  return (
    <div
      className="flex flex-col items-center py-2 gap-0.5 border-l border-r"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        width: '36px',
      }}
    >
      {TOOLS.map(tool => (
        <div key={`tool-${tool.id}`} className="relative group">
          <button
            onClick={() => onSelectTool(tool.id)}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-150 ${
              selectedTool === tool.id
                ? 'bg-primary-subtle' :'hover:bg-muted'
            }`}
            style={{ color: selectedTool === tool.id ? 'var(--primary)' : 'var(--muted-foreground)' }}
          >
            <tool.icon size={13} />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            {tool.label}
          </div>
        </div>
      ))}

      <div className="w-5 h-px my-1" style={{ backgroundColor: 'var(--border)' }} />

      {/* Lock */}
      <div className="relative group">
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-all"
          style={{ color: 'var(--muted-foreground)' }}>
          <Lock size={13} />
        </button>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          Lock drawings
        </div>
      </div>

      {/* Delete */}
      <div className="relative group">
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-all"
          style={{ color: 'var(--muted-foreground)' }}>
          <Trash2 size={13} />
        </button>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          Delete selected drawing
        </div>
      </div>
    </div>
  );
}