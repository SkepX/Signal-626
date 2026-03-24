'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeatmapMode } from '@/lib/types';

interface FilterBarProps {
  shapes: string[];
  selectedShape: string;
  onShapeChange: (shape: string) => void;
  heatmapEnabled: boolean;
  onHeatmapToggle: () => void;
  heatmapMode: HeatmapMode;
  onHeatmapModeChange: (mode: HeatmapMode) => void;
  onExportYear: () => void;
  onFullscreen: () => void;
}

const HEATMAP_MODES: { key: HeatmapMode; label: string }[] = [
  { key: 'density', label: 'Density' },
  { key: 'clusters', label: 'Clusters' },
  { key: 'precision', label: 'Precision' },
];

const btnBase = "w-9 h-9 rounded-md flex items-center justify-center transition-colors";

export default function FilterBar({
  shapes, selectedShape, onShapeChange,
  heatmapEnabled, onHeatmapToggle, heatmapMode, onHeatmapModeChange,
  onExportYear, onFullscreen,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [heatmapMenuOpen, setHeatmapMenuOpen] = useState(false);

  const btnStyle = { background: 'rgba(15, 23, 41, 0.9)', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div className="absolute left-3 top-3 z-[100] flex flex-col gap-2">
      {/* Filter toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={btnBase}
        style={{ ...btnStyle, borderColor: isOpen ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)' }}
        title="Filters"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" className="text-slate-400">
          <path d="M1 3h14M4 8h8M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Heatmap */}
      <div className="relative">
        <button
          onClick={onHeatmapToggle}
          onContextMenu={(e) => { e.preventDefault(); if (heatmapEnabled) setHeatmapMenuOpen(!heatmapMenuOpen); }}
          className={btnBase}
          style={{
            ...btnStyle,
            borderColor: heatmapEnabled ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)',
            background: heatmapEnabled ? 'rgba(0,229,255,0.08)' : btnStyle.background,
          }}
          title="Heatmap"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" className={heatmapEnabled ? 'text-cyan-400' : 'text-slate-400'}>
            <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
          </svg>
        </button>
        {heatmapEnabled && (
          <button
            onClick={() => setHeatmapMenuOpen(!heatmapMenuOpen)}
            className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0F1729]"
          />
        )}
        <AnimatePresence>
          {heatmapMenuOpen && heatmapEnabled && (
            <motion.div
              initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -8, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute left-11 top-0 w-32 rounded-lg p-1.5"
              style={{ background: '#131D2F', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-[8px] tracking-[0.15em] text-slate-500 px-2 py-1 uppercase">Mode</div>
              {HEATMAP_MODES.map((m) => (
                <button key={m.key}
                  onClick={() => { onHeatmapModeChange(m.key); setHeatmapMenuOpen(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    heatmapMode === m.key ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >{m.label}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export */}
      <button onClick={onExportYear} className={btnBase} style={btnStyle} title="Export">
        <svg width="15" height="15" viewBox="0 0 16 16" className="text-slate-400">
          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Fullscreen */}
      <button onClick={onFullscreen} className={btnBase} style={btnStyle} title="Fullscreen">
        <svg width="15" height="15" viewBox="0 0 16 16" className="text-slate-400">
          <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Shape filter dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -8, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute left-11 top-0 w-36 rounded-lg p-1.5 max-h-60 overflow-y-auto"
            style={{ background: '#131D2F', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-[8px] tracking-[0.15em] text-slate-500 px-2 py-1 uppercase">Shape</div>
            <button
              onClick={() => { onShapeChange('All'); setIsOpen(false); }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                selectedShape === 'All' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >All Shapes</button>
            {shapes.map((shape) => (
              <button key={shape}
                onClick={() => { onShapeChange(shape); setIsOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                  selectedShape === shape ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >{shape}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
