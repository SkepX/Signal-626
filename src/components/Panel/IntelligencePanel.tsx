'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { getShapeColor } from '@/lib/constants';
import { getCountryByCode } from '@/lib/countries';
import { buildIntelligenceReport } from '@/lib/intelligence';
import type { IntelligenceReport, AnomalyLevel } from '@/lib/intelligence';
import type { MapPoint, YearCount } from '@/lib/types';

interface IntelligencePanelProps {
  points: MapPoint[];
  yearCount: number;
  year: number;
  selectedCountry: string;
  yearCounts: YearCount[];
  isLoading: boolean;
  onClose: () => void;
}

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span className={className}>{formatNumber(display)}</span>;
}

function TrendChart({ data }: { data: { year: number; count: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = w / 2;
    const ch = h / 2;
    ctx.clearRect(0, 0, cw, ch);

    const recent = data.filter(d => d.year >= 1960);
    if (recent.length < 2) return;

    const maxCount = Math.max(...recent.map(d => d.count), 1);
    const padding = { top: 8, bottom: 16, left: 4, right: 4 };
    const plotW = cw - padding.left - padding.right;
    const plotH = ch - padding.top - padding.bottom;

    const getX = (i: number) => padding.left + (i / (recent.length - 1)) * plotW;
    const getY = (count: number) => padding.top + plotH - (count / maxCount) * plotH;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, ch);
    gradient.addColorStop(0, 'rgba(0, 229, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), ch - padding.bottom);
    for (let i = 0; i < recent.length; i++) ctx.lineTo(getX(i), getY(recent[i].count));
    ctx.lineTo(getX(recent.length - 1), ch - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(recent[0].count));
    for (let i = 1; i < recent.length; i++) ctx.lineTo(getX(i), getY(recent[i].count));
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Year labels
    ctx.fillStyle = 'rgba(74, 106, 138, 0.7)';
    ctx.font = '8px Rajdhani';
    ctx.textAlign = 'center';
    const labelInterval = Math.ceil(recent.length / 5);
    for (let i = 0; i < recent.length; i += labelInterval) {
      ctx.fillText(String(recent[i].year), getX(i), ch - 2);
    }
  }, [data]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: '70px' }} />;
}

function MonthlyRadialChart({ data }: { data: { label: string; count: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight);
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 20;
    const minR = maxR * 0.3;
    ctx.clearRect(0, 0, size, size);

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const sliceAngle = (Math.PI * 2) / 12;

    for (let i = 0; i < 12; i++) {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle - 0.02;
      const ratio = data[i].count / maxCount;
      const r = minR + ratio * (maxR - minR);

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.arc(cx, cy, minR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 229, 255, ${0.06 + ratio * 0.25})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 + ratio * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Month label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelR = maxR + 12;
      ctx.fillStyle = ratio > 0.5 ? 'rgba(0, 229, 255, 0.7)' : 'rgba(74, 106, 138, 0.6)';
      ctx.font = '7px Rajdhani';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data[i].label, cx + Math.cos(labelAngle) * labelR, cy + Math.sin(labelAngle) * labelR);
    }

    ctx.beginPath();
    ctx.arc(cx, cy, minR - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5, 10, 20, 0.8)';
    ctx.fill();
  }, [data]);

  return <canvas ref={canvasRef} className="w-full aspect-square max-w-[150px] mx-auto" />;
}

function AnomalyGauge({ level, score }: { level: AnomalyLevel; score: number }) {
  const colors: Record<AnomalyLevel, string> = {
    LOW: '#00E5FF', MEDIUM: '#FFB300', HIGH: '#00ff9c', CRITICAL: '#FF3355',
  };
  const color = colors[level];
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="flex items-center justify-between w-full mt-1.5">
        <span className="text-xs font-display tracking-[0.12em] font-bold" style={{ color }}>{level}</span>
        <span className="text-[10px] text-signal-muted font-mono">{clampedScore}%</span>
      </div>
    </div>
  );
}

function HotspotBar({ name, count, maxCount, index }: {
  name: string; count: number; percentage: number; maxCount: number; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-signal-bright truncate flex-1 mr-2">{name}</span>
        <span className="text-[10px] text-signal-cyan font-mono">{count}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(count / maxCount) * 100}%` }}
          transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: 'rgba(0,229,255,0.6)' }}
        />
      </div>
    </motion.div>
  );
}

function SectionDivider() {
  return <div className="my-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-display tracking-[0.2em] text-white/30 uppercase mb-2">
      {children}
    </div>
  );
}

export default function IntelligencePanel({
  points, yearCount, year, selectedCountry, yearCounts, isLoading, onClose,
}: IntelligencePanelProps) {
  const country = getCountryByCode(selectedCountry);

  const report = useMemo<IntelligenceReport | null>(() => {
    if (!country || selectedCountry === 'World') return null;
    return buildIntelligenceReport(country.code, country.name, year, points, yearCounts, country.bounds);
  }, [country, selectedCountry, year, points, yearCounts]);

  const topShapes = report?.topShapes ?? [];
  const hasData = report && report.totalYear > 0;
  const maxShapeCount = topShapes.length > 0 ? topShapes[0].count : 1;

  return (
    <AnimatePresence>
      {selectedCountry !== 'World' && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[360px] md:w-[380px] z-[1800] overflow-y-auto overscroll-contain"
          style={{
            background: 'rgba(8,14,28,0.97)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-10 group"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,14,28,0.6)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-white/30 group-hover:text-signal-red transition-colors">
              <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="p-5 pt-14 sm:p-6 sm:pt-14 pb-safe">
            {/* Header */}
            <div className="mb-5">
              <span className="text-[9px] font-display tracking-[0.2em] text-signal-cyan/50 uppercase">
                Intelligence Report
              </span>

              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[0.08em] text-signal-bright mt-2 mb-1">
                {country?.name?.toUpperCase() || selectedCountry}
              </h2>

              <span className="text-xs font-display tracking-[0.15em] text-white/25">
                YEAR {year}
              </span>

              <div className="mt-3">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-signal-cyan/20 border-t-signal-cyan rounded-full animate-spin" />
                    <span className="text-xs text-signal-muted font-display tracking-widest">Loading...</span>
                  </div>
                ) : (
                  <div>
                    <AnimatedCounter
                      value={report?.totalYear ?? 0}
                      className="font-display text-3xl sm:text-4xl font-bold text-signal-green"
                    />
                    <div className="text-[10px] text-white/25 mt-1 font-display tracking-[0.12em]">
                      SIGHTINGS DETECTED
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* No data */}
            {!isLoading && !hasData && (
              <div className="text-center py-10">
                <div className="font-display text-lg text-signal-red/60 tracking-[0.15em] mb-2">
                  NO DATA
                </div>
                <p className="text-sm text-signal-muted">No sightings recorded in {year} for this region</p>
              </div>
            )}

            {!isLoading && hasData && report && (
              <>
                {report.yearlyTrend.length > 2 && (
                  <>
                    <SectionDivider />
                    <SectionHeader>Global Activity Trend</SectionHeader>
                    <TrendChart data={report.yearlyTrend} />
                    <div className="text-[8px] text-white/20 font-mono mt-1 tracking-wider">1960 – PRESENT</div>
                  </>
                )}

                {report.monthlyDistribution.some(m => m.count > 0) && (
                  <>
                    <SectionDivider />
                    <SectionHeader>Monthly Distribution</SectionHeader>
                    <div className="flex items-start gap-4">
                      <MonthlyRadialChart data={report.monthlyDistribution} />
                      {report.peakMonth && (
                        <div className="flex-1 pt-4">
                          <div className="text-[9px] text-white/25 font-display tracking-widest mb-1">PEAK</div>
                          <div className="text-base font-display text-signal-cyan font-bold tracking-wider">
                            {report.peakMonth.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {topShapes.length > 0 && (
                  <>
                    <SectionDivider />
                    <SectionHeader>Top Shapes</SectionHeader>
                    <div className="space-y-2">
                      {topShapes.map(({ shape, count, pct }) => {
                        const color = getShapeColor(shape);
                        return (
                          <div key={shape}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                              <span className="text-xs text-signal-bright flex-1 truncate">{shape}</span>
                              <span className="text-[10px] text-signal-cyan font-mono">{formatNumber(count)}</span>
                              <span className="text-[9px] text-white/25 w-7 text-right">{pct}%</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden ml-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / maxShapeCount) * 100}%` }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full"
                                style={{ background: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {report.hotspotRegions.length > 0 && (
                  <>
                    <SectionDivider />
                    <SectionHeader>Hotspot Ranking</SectionHeader>
                    <div className="space-y-2.5">
                      {report.hotspotRegions.slice(0, 6).map((h, i) => (
                        <HotspotBar
                          key={h.name}
                          name={h.name}
                          count={h.count}
                          percentage={h.percentage}
                          maxCount={report.hotspotRegions[0].count}
                          index={i}
                        />
                      ))}
                    </div>
                  </>
                )}

                <SectionDivider />
                <SectionHeader>Anomaly Level</SectionHeader>
                <AnomalyGauge level={report.anomalyLevel} score={report.anomalyScore} />

                <SectionDivider />
                <div className="flex items-center justify-between text-[9px] text-white/25">
                  <span className="font-display tracking-wider">DATA POINTS</span>
                  <span className="font-mono text-signal-cyan">{formatNumber(report.totalYear)}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-white/25 mt-1">
                  <span className="font-display tracking-wider">GLOBAL ALL-TIME</span>
                  <span className="font-mono text-signal-cyan/50">{formatNumber(report.totalAllTime)}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
