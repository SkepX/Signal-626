'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import type { AnomalyLevel } from '@/lib/intelligence';

export interface CountryHoverData {
  code: string;
  name: string;
  x: number;
  y: number;
}

interface CountryHoverPopupProps {
  hover: CountryHoverData | null;
  totalReports: number;
  anomalyScore: number;
  anomalyLevel: AnomalyLevel;
  onOpenIntelligence: (code: string) => void;
}

const LEVEL_COLORS: Record<AnomalyLevel, string> = {
  LOW: '#00E5FF',
  MEDIUM: '#FFB300',
  HIGH: '#00ff9c',
  CRITICAL: '#FF3355',
};

export default function CountryHoverPopup({
  hover,
  totalReports,
  anomalyScore,
  anomalyLevel,
  onOpenIntelligence,
}: CountryHoverPopupProps) {
  const color = LEVEL_COLORS[anomalyLevel];

  const popupWidth = 240;
  const popupHeight = 160;
  const offsetX = 18;
  const offsetY = -20;

  let left = (hover?.x ?? 0) + offsetX;
  let top = (hover?.y ?? 0) + offsetY;

  if (typeof window !== 'undefined' && hover) {
    if (left + popupWidth > window.innerWidth - 12) {
      left = hover.x - popupWidth - offsetX;
    }
    if (top + popupHeight > window.innerHeight - 12) {
      top = window.innerHeight - popupHeight - 12;
    }
    if (top < 12) top = 12;
    if (left < 12) left = 12;
  }

  return (
    <AnimatePresence>
      {hover && (
        <motion.div
          key={hover.code}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="fixed z-[2500] pointer-events-auto"
          style={{ left, top, width: popupWidth }}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'rgba(8, 14, 28, 0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-3.5">
              {/* Country name */}
              <h3 className="font-display text-sm font-bold tracking-[0.08em] text-signal-bright mb-3">
                {hover.name.toUpperCase()}
              </h3>

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/30 uppercase mb-0.5">
                    Reports
                  </div>
                  <div className="font-display text-base font-bold text-signal-cyan">
                    {formatNumber(totalReports)}
                  </div>
                </div>

                <div className="w-px h-7 bg-white/6" />

                <div className="flex-1">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/30 uppercase mb-0.5">
                    Risk Index
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-base font-bold" style={{ color }}>
                      {anomalyScore}
                    </span>
                    <span
                      className="text-[8px] font-display tracking-[0.1em] font-bold px-1.5 py-0.5 rounded"
                      style={{ color, background: `${color}10`, border: `1px solid ${color}20` }}
                    >
                      {anomalyLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk gauge */}
              <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, anomalyScore)}%`, background: color }}
                />
              </div>

              {/* CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); onOpenIntelligence(hover.code); }}
                className="w-full py-1.5 rounded font-display text-[9px] tracking-[0.2em] font-bold uppercase transition-all hover:bg-signal-cyan/10"
                style={{ color: '#00E5FF', border: '1px solid rgba(0,229,255,0.15)' }}
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
