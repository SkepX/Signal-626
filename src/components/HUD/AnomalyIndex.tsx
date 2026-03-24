'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeAnomalyIndex, type AnomalyStatus } from '@/lib/anomalyIndex';
import type { YearCount, MapPoint } from '@/lib/types';

interface AnomalyIndexProps {
  year: number;
  yearCount: number;
  yearCounts: YearCount[];
  points: MapPoint[];
}

const STATUS_COLOR: Record<AnomalyStatus, string> = {
  LOW: '#00E5FF',
  ELEVATED: '#FFB300',
  HIGH: '#00FF9C',
  CRITICAL: '#FF3355',
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (Math.abs(diff) < 0.05) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const duration = 500;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round((start + diff * eased) * 10) / 10;
      setDisplay(current);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else { prev.current = value; setDisplay(value); }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display.toFixed(1)}</>;
}

export default function AnomalyIndex({ year, yearCount, yearCounts, points }: AnomalyIndexProps) {
  const anomaly = useMemo(
    () => computeAnomalyIndex(year, yearCount, yearCounts, points),
    [year, yearCount, yearCounts, points]
  );

  const color = STATUS_COLOR[anomaly.status];

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      style={{
        background: 'rgba(8, 16, 32, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '10px 14px 8px',
        width: 'clamp(110px, 32vw, 140px)',
      }}
    >
      <div className="text-center mb-1">
        <span className="text-[7px] font-display tracking-[0.15em] text-white/30 uppercase">Anomaly Index</span>
      </div>

      <div className="text-center my-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={Math.round(anomaly.index * 10)}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="font-display text-[26px] sm:text-[30px] font-black tracking-wider leading-none"
            style={{ color }}
          >
            <AnimatedNumber value={anomaly.index} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <div className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
        <span className="font-display text-[8px] tracking-[0.12em] font-bold uppercase" style={{ color }}>
          {anomaly.status}
        </span>
      </div>

      {anomaly.delta !== 0 && (
        <div className="text-center mt-1.5">
          <span
            className="font-mono text-[8px] tracking-wider"
            style={{ color: anomaly.delta > 0 ? '#00E5FF' : '#FF3355', opacity: 0.5 }}
          >
            {anomaly.delta > 0 ? '+' : ''}{anomaly.delta}% YoY
          </span>
        </div>
      )}
    </motion.div>
  );
}
