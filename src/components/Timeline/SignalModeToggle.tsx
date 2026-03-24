'use client';

import type { TimelineMode } from '@/lib/types';

interface SignalModeToggleProps {
  mode: TimelineMode;
  onModeChange: (mode: TimelineMode) => void;
}

export default function SignalModeToggle({ mode, onModeChange }: SignalModeToggleProps) {
  return (
    <div
      className="flex items-center rounded-md overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => onModeChange('year')}
        className="px-3 py-1.5 text-[9px] sm:text-[10px] font-display tracking-[0.12em] font-bold uppercase transition-colors"
        style={{
          color: mode === 'year' ? '#00E5FF' : 'rgb(100,116,139)',
          background: mode === 'year' ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
        }}
      >
        YEAR
      </button>
      <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <button
        onClick={() => onModeChange('signal')}
        className="px-3 py-1.5 text-[9px] sm:text-[10px] font-display tracking-[0.12em] font-bold uppercase transition-colors"
        style={{
          color: mode === 'signal' ? '#00FF9C' : 'rgb(100,116,139)',
          background: mode === 'signal' ? 'rgba(0, 255, 156, 0.06)' : 'transparent',
        }}
      >
        SIGNAL
      </button>
    </div>
  );
}
