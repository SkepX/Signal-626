'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSightingDetail } from '@/hooks/useSightings';
import { formatDate, parseLocation } from '@/lib/utils';
import type { Sighting } from '@/lib/types';

interface SightingPanelProps {
  sightingId: number | null;
  onClose: () => void;
}

function FieldRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="text-[10px] tracking-[0.1em] text-slate-500 uppercase">{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-cyan-400 hover:text-white transition-colors text-sm break-all">{value}</a>
      ) : (
        <span className="text-white text-sm leading-relaxed">{value}</span>
      )}
    </div>
  );
}

function buildHeading(loc: { city: string | null; state: string | null; country: string | null }): string {
  const parts: string[] = [];
  if (loc.city) parts.push(loc.city);
  if (loc.state && loc.state !== loc.city) parts.push(loc.state);
  if (loc.country) {
    const countryLower = loc.country.toLowerCase();
    if (!parts.some(p => p.toLowerCase().includes(countryLower))) parts.push(loc.country);
  }
  return parts.join(', ');
}

function SightingContent({ sighting }: { sighting: Sighting }) {
  const loc = parseLocation(sighting.location);
  const fields: { label: string; value: string; isLink?: boolean }[] = [];
  if (sighting.occurred) fields.push({ label: 'Occurred', value: formatDate(sighting.occurred) });
  if (loc.city) fields.push({ label: 'City', value: loc.city });
  if (loc.state) fields.push({ label: 'State', value: loc.state });
  if (loc.country) fields.push({ label: 'Country', value: loc.country });
  if (sighting.shape) fields.push({ label: 'Shape', value: sighting.shape });
  if (sighting.color) fields.push({ label: 'Color', value: sighting.color });
  if (sighting.duration) fields.push({ label: 'Duration', value: sighting.duration });
  if (sighting.num_observers) fields.push({ label: 'Observers', value: sighting.num_observers });
  if (sighting.estimated_size) fields.push({ label: 'Estimated Size', value: sighting.estimated_size });
  if (sighting.viewed_from) fields.push({ label: 'Viewed From', value: sighting.viewed_from });
  if (sighting.direction_from_viewer) fields.push({ label: 'Direction', value: sighting.direction_from_viewer });
  if (sighting.angle_of_elevation) fields.push({ label: 'Elevation Angle', value: sighting.angle_of_elevation });
  if (sighting.closest_distance) fields.push({ label: 'Closest Distance', value: sighting.closest_distance });
  if (sighting.estimated_speed) fields.push({ label: 'Estimated Speed', value: sighting.estimated_speed });
  if (sighting.characteristics) fields.push({ label: 'Characteristics', value: sighting.characteristics });
  if (sighting.location_details) fields.push({ label: 'Location Details', value: sighting.location_details });
  if (sighting.reported) fields.push({ label: 'Reported', value: formatDate(sighting.reported) });
  if (sighting.url) fields.push({ label: 'NUFORC Report', value: sighting.url, isLink: true });

  return (
    <>
      <div className="mb-5">
        <div className="text-[9px] tracking-[0.15em] text-slate-500 uppercase mb-2">
          Sighting #{sighting.id}
        </div>
        {sighting.location && (
          <h2 className="font-display text-lg text-white tracking-wide font-bold">{buildHeading(loc)}</h2>
        )}
        {sighting.occurred && (
          <p className="text-xs text-slate-500 mt-1">{formatDate(sighting.occurred)}</p>
        )}
      </div>

      <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div className="space-y-0">
        {fields.map((field) => <FieldRow key={field.label} {...field} />)}
      </div>

      {sighting.summary && (
        <div className="mt-5">
          <span className="text-[10px] tracking-[0.1em] text-slate-500 uppercase block mb-2">Summary</span>
          <div className="rounded-lg p-4 max-h-48 overflow-y-auto"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{sighting.summary}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function SightingPanel({ sightingId, onClose }: SightingPanelProps) {
  const { data: sighting, isLoading, error } = useSightingDetail(sightingId);

  return (
    <AnimatePresence>
      {sightingId !== null && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[360px] md:w-[400px] z-[2000] overflow-y-auto overscroll-contain"
          style={{ background: '#0A1020', borderLeft: '1px solid rgba(0, 229, 255, 0.08)' }}
        >
          <button onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-md flex items-center justify-center transition-colors z-10 group"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-500 group-hover:text-red-400 transition-colors">
              <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="p-5 pt-14 sm:p-6 sm:pt-14 pb-safe">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-3" />
                <span className="text-xs text-slate-500">Loading...</span>
              </div>
            )}
            {error && (
              <div className="text-center py-20">
                <div className="text-sm text-red-400 mb-1">Error</div>
                <p className="text-xs text-slate-500">Failed to load sighting data</p>
              </div>
            )}
            {sighting && <SightingContent sighting={sighting} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
