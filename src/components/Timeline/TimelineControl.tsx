'use client';

import { useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { MONTH_NAMES } from '@/lib/constants';
import type { PlaybackSpeed, YearCount, TimelineMode } from '@/lib/types';
import SignalModeToggle from './SignalModeToggle';

interface TimelineControlProps {
  year: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  yearCount: number;
  yearCounts: YearCount[];
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  timelineMode: TimelineMode;
  onModeChange: (mode: TimelineMode) => void;
  signalMonth?: number;
  signalDay?: number;
  signalTime?: string;
  signalEventsShown?: number;
  signalTotalEvents?: number;
  signalIsComplete?: boolean;
}

const QUICK_YEARS = [1400, 1800, 1900, 1950, 1970, 1990, 2000, 2010, 2020, 2026];
const QUICK_YEARS_MOBILE = [1400, 1900, 1970, 2000, 2020, 2026];
const NUM_SEGMENTS = QUICK_YEARS.length - 1;

function yearToProgress(year: number): number {
  if (year <= QUICK_YEARS[0]) return 0;
  if (year >= QUICK_YEARS[QUICK_YEARS.length - 1]) return 100;
  for (let i = 1; i < QUICK_YEARS.length; i++) {
    if (year <= QUICK_YEARS[i]) {
      const segStart = ((i - 1) / NUM_SEGMENTS) * 100;
      const segEnd = (i / NUM_SEGMENTS) * 100;
      const t = (year - QUICK_YEARS[i - 1]) / (QUICK_YEARS[i] - QUICK_YEARS[i - 1]);
      return segStart + t * (segEnd - segStart);
    }
  }
  return 100;
}

function progressToYear(progress: number): number {
  if (progress <= 0) return QUICK_YEARS[0];
  if (progress >= 100) return QUICK_YEARS[QUICK_YEARS.length - 1];
  const segIndex = (progress / 100) * NUM_SEGMENTS;
  const i = Math.floor(segIndex);
  const t = segIndex - i;
  if (i >= NUM_SEGMENTS) return QUICK_YEARS[QUICK_YEARS.length - 1];
  return Math.round(QUICK_YEARS[i] + t * (QUICK_YEARS[i + 1] - QUICK_YEARS[i]));
}

const SLIDER_MAX = 10000;
const NUM_SPARKLINE_BARS = 50;

export default function TimelineControl({
  year, isPlaying, speed, yearCount, yearCounts,
  onYearChange, onTogglePlay, onSpeedChange, onStepForward, onStepBackward,
  timelineMode, onModeChange,
  signalMonth = 0, signalDay = 1, signalEventsShown = 0, signalTotalEvents = 0, signalIsComplete = false,
}: TimelineControlProps) {
  const progress = yearToProgress(year);
  const sliderValue = Math.round((progress / 100) * SLIDER_MAX);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onYearChange(progressToYear(pct * 100));
  }, [onYearChange]);

  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onYearChange(progressToYear((val / SLIDER_MAX) * 100));
  }, [onYearChange]);

  const sparklineData = useMemo(() => {
    if (!yearCounts.length) return [];
    const barValues: number[] = [];
    const barYearRanges: [number, number][] = [];
    for (let i = 0; i < NUM_SPARKLINE_BARS; i++) {
      const yearStart = progressToYear((i / NUM_SPARKLINE_BARS) * 100);
      const yearEnd = progressToYear(((i + 1) / NUM_SPARKLINE_BARS) * 100);
      barYearRanges.push([yearStart, yearEnd]);
      const rangeCount = yearCounts
        .filter(yc => Number(yc.year) >= yearStart && Number(yc.year) < yearEnd)
        .reduce((sum, yc) => sum + Number(yc.count), 0);
      barValues.push(rangeCount);
    }
    const sqrtValues = barValues.map(v => Math.sqrt(v));
    const maxSqrt = Math.max(...sqrtValues, 1);
    return sqrtValues.map((sv, i) => ({
      height: Math.max((sv / maxSqrt) * 100, barValues[i] > 0 ? 4 : 0),
      isActive: year >= barYearRanges[i][0] && year <= barYearRanges[i][1],
    }));
  }, [yearCounts, year]);

  const isSignal = timelineMode === 'signal';
  const signalProgressPct = signalTotalEvents > 0 ? (signalEventsShown / signalTotalEvents) * 100 : 0;

  return (
    <div
      className="flex-shrink-0 px-4 sm:px-6 py-2.5"
      style={{ background: '#0A1020', borderTop: '1px solid rgba(0, 229, 255, 0.06)' }}
    >
      {/* Signal replay progress */}
      {isSignal && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-display tracking-[0.12em] font-bold text-emerald-400/80">
              {MONTH_NAMES[signalMonth]} {String(signalDay).padStart(2, '0')}, {year}
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {formatNumber(signalEventsShown)} / {formatNumber(signalTotalEvents)}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full rounded-full bg-emerald-400/50"
              animate={{ width: `${signalProgressPct}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Play controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onStepBackward}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg width="10" height="10" viewBox="0 0 14 14" className="text-slate-400">
              <polygon points="8,1 1,7 8,13" fill="currentColor" />
              <rect x="10" y="2" width="2" height="10" fill="currentColor" rx="0.5" />
            </svg>
          </button>

          <button onClick={onTogglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{
              border: isPlaying ? '2px solid rgba(0,229,255,0.3)' : '2px solid rgba(255,255,255,0.08)',
              background: isPlaying ? 'rgba(0,229,255,0.06)' : 'transparent',
            }}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.svg key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} width="12" height="12" viewBox="0 0 14 14" className="text-cyan-400">
                  <rect x="2" y="1" width="3.5" height="12" fill="currentColor" rx="1" />
                  <rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" rx="1" />
                </motion.svg>
              ) : (
                <motion.svg key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} width="12" height="12" viewBox="0 0 14 14" className="text-cyan-400">
                  <polygon points="3,1 13,7 3,13" fill="currentColor" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          <button onClick={onStepForward}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg width="10" height="10" viewBox="0 0 14 14" className="text-slate-400">
              <rect x="2" y="2" width="2" height="10" fill="currentColor" rx="0.5" />
              <polygon points="6,1 13,7 6,13" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Mode + Year */}
        <div className="flex items-center gap-3 ml-2">
          <SignalModeToggle mode={timelineMode} onModeChange={onModeChange} />
          <motion.div key={year} initial={{ y: 3, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.1 }}
            className="font-display text-2xl sm:text-3xl text-cyan-400 tracking-wide font-bold"
          >
            {year}
          </motion.div>
        </div>

        <div className="flex-1" />

        {/* Speed + Count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {([1, 2, 5] as PlaybackSpeed[]).map((s) => (
              <button key={s} onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-colors ${
                  speed === s ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={speed === s ? { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' } : { border: '1px solid transparent' }}
              >{s}x</button>
            ))}
          </div>
          <div className="text-right min-w-[40px]">
            <div className="text-[8px] text-slate-500 uppercase tracking-wider">Reports</div>
            <div className="font-display text-sm sm:text-base font-bold text-cyan-400">{formatNumber(yearCount)}</div>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="relative h-6 sm:h-8 mt-1.5 mb-0.5 flex items-end gap-px opacity-70">
          {sparklineData.map((bar, i) => (
            <div key={i}
              className={`sparkline-bar ${bar.isActive ? 'sparkline-bar-active' : 'sparkline-bar-inactive'}`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
      )}

      {/* Slider */}
      <div className="relative mb-1">
        <div ref={sliderRef}
          className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          onClick={handleSliderClick}
        >
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: 'rgba(0,229,255,0.4)' }}
          />
        </div>
        <input type="range" min={0} max={SLIDER_MAX} value={sliderValue}
          onChange={handleRangeChange} className="timeline-slider relative z-10" />
      </div>

      {/* Quick years */}
      <div className="flex justify-between">
        <div className="flex sm:hidden justify-between w-full">
          {QUICK_YEARS_MOBILE.map((y) => (
            <button key={y} onClick={() => onYearChange(y)}
              className={`text-[9px] font-display font-bold px-1.5 py-1 rounded transition-colors ${
                y === year ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >{y}</button>
          ))}
        </div>
        <div className="hidden sm:flex justify-between w-full">
          {QUICK_YEARS.map((y) => (
            <button key={y} onClick={() => onYearChange(y)}
              className={`text-[10px] font-display font-bold px-1 py-0.5 rounded transition-colors ${
                y === year ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >{y}</button>
          ))}
        </div>
      </div>

      {/* Mobile speed */}
      <div className="flex sm:hidden items-center gap-1.5 mt-1">
        <span className="text-[8px] text-slate-500 tracking-wider mr-1">Speed</span>
        {([1, 2, 5] as PlaybackSpeed[]).map((s) => (
          <button key={s} onClick={() => onSpeedChange(s)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors ${
              speed === s ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >{s}x</button>
        ))}
      </div>

      <div className="pb-safe" />
    </div>
  );
}
