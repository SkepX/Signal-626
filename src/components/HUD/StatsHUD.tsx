'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import Image from 'next/image';
import { COUNTRIES } from '@/lib/countries';

interface StatsHUDProps {
  totalReports: number;
  currentYear: number;
  yearReports: number;
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay?: () => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

function CounterValue({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 500;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) requestAnimationFrame(step);
      else prev.current = value;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span className={className}>{formatNumber(display)}</span>;
}

function CountryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const selectedLabel = value === 'World' ? 'GLOBAL' : COUNTRIES.find(c => c.code === value)?.name?.toUpperCase() || value;
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: open ? 'rgba(255,255,255,0.05)' : 'transparent',
        }}
      >
        <span className="text-xs font-display tracking-wider font-bold"
          style={{ color: value === 'World' ? '#CFFFFF' : '#00E5FF' }}>
          {selectedLabel}
        </span>
        <svg width="8" height="8" viewBox="0 0 8 8" className="text-signal-muted">
          <path d="M1 3L4 6L7 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 right-0 sm:left-0 sm:right-auto w-56 z-50 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(10,22,40,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search regions..."
                className="w-full bg-transparent text-xs text-signal-bright placeholder-signal-muted/50 outline-none font-body px-2 py-1.5 rounded"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              <button
                onClick={() => { onChange('World'); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 rounded text-xs font-display tracking-wider transition-all ${
                  value === 'World' ? 'text-signal-cyan bg-signal-cyan/10' : 'text-signal-muted hover:text-signal-bright hover:bg-white/5'
                }`}
              >
                GLOBAL
              </button>
              {filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${
                    value === c.code ? 'text-signal-cyan bg-signal-cyan/10' : 'text-signal-bright/80 hover:text-signal-bright hover:bg-white/5'
                  }`}
                >
                  {c.name.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StatsHUD({
  totalReports, currentYear, yearReports, isPlaying, isLoading, onTogglePlay, selectedCountry, onCountryChange,
}: StatsHUDProps) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        style={{
          background: 'rgba(5,10,20,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div className="flex items-stretch min-h-[48px] sm:min-h-[56px] md:min-h-[64px]">

          {/* Logo */}
          <div className="hud-section flex-row !flex-row items-center gap-2 sm:gap-3 pl-3 sm:pl-4 md:pl-6">
            <div className="relative w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] md:w-[44px] md:h-[44px] flex-shrink-0">
              <Image src="/logo.png" alt="Signal 626" fill className="object-contain" priority unoptimized />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.1em] text-signal-bright">
                SIGNAL 626
              </span>
              <span className="hidden sm:block text-[7px] md:text-[8px] tracking-[0.12em] font-medium text-white/25">
                UFO INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          <div className="hud-divider" />

          {/* Total Reports */}
          <div className="hud-section">
            <span className="hud-label">REPORTS</span>
            <CounterValue value={totalReports} className="hud-value text-sm sm:text-base md:text-lg" />
          </div>

          <div className="hud-divider" />

          {/* Active Year */}
          <div className="hud-section">
            <span className="hud-label">YEAR</span>
            <motion.span key={currentYear} initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }} className="hud-value-white text-sm sm:text-base md:text-lg">
              {currentYear}
            </motion.span>
          </div>

          <div className="hud-divider" />

          {/* Year Reports */}
          <div className="hidden sm:flex">
            <div className="hud-section">
              <span className="hud-label">YEAR COUNT</span>
              <CounterValue value={yearReports} className="hud-value text-sm sm:text-base md:text-lg" />
            </div>
          </div>

          <div className="hud-divider hidden sm:block" />

          {/* Region Selector */}
          <div className="hud-section">
            <span className="hud-label hidden md:block mb-1">REGION</span>
            <CountryDropdown value={selectedCountry} onChange={onCountryChange} />
          </div>

          <div className="flex-1 min-w-0" />

          {/* Status indicator */}
          <div className="hud-section !flex-row items-center gap-2 sm:gap-3 pr-3 sm:pr-4 md:pr-6">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-signal-amber animate-pulse' : isPlaying ? 'bg-signal-cyan animate-pulse' : 'bg-white/20'}`} />
              <span className={`text-[9px] sm:text-[10px] font-display tracking-[0.1em] font-bold ${isLoading ? 'text-signal-amber' : isPlaying ? 'text-signal-cyan' : 'text-signal-muted'}`}>
                {isLoading ? 'LOADING' : isPlaying ? 'LIVE' : 'IDLE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
