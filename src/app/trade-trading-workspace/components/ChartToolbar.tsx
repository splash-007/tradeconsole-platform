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
      className="flex flex-col items-center py-2 gap-1 border-r"
      style={{
        backgroundColor: '#080808',
        borderColor: '#1a1a1a',
        width: '40px',
        minWidth: '40px',
      }}
    >
      {TOOLS.map(tool => (
        <div key={`tool-${tool.id}`} className="relative group">
          <button
            onClick={() => onSelectTool(tool.id)}
            className="w-8 h-8 flex items-center justify-center rounded transition-all duration-150"
            style={{
              backgroundColor: selectedTool === tool.id ? 'rgba(245,196,0,0.15)' : 'transparent',
              color: selectedTool === tool.id ? 'var(--primary)' : '#ffffff',
            }}
          >
            <tool.icon size={16} />
          </button>
          {/* Tooltip — appears to the RIGHT since toolbar is on left */}
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
            style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a', color: '#ffffff' }}
          >
            {tool.label}
          </div>
        </div>
      ))}

      <div className="w-5 h-px my-1" style={{ backgroundColor: '#1a1a1a' }} />

      {/* Lock */}
      <div className="relative group">
        <button
          className="w-8 h-8 flex items-center justify-center rounded transition-all"
          style={{ color: '#ffffff' }}
        >
          <Lock size={16} />
        </button>
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a', color: '#ffffff' }}
        >
          Lock drawings
        </div>
      </div>

      {/* Delete */}
      <div className="relative group">
        <button
          className="w-8 h-8 flex items-center justify-center rounded transition-all"
          style={{ color: '#ffffff' }}
        >
          <Trash2 size={16} />
        </button>
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a', color: '#ffffff' }}
        >
          Delete selected drawing
        </div>
      </div>
    </div>
  );
}