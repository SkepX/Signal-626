'use client';

import dynamic from 'next/dynamic';
import type { MapPoint, HeatmapMode } from '@/lib/types';
import type { CountryHoverData } from './CountryHoverPopup';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-signal-darker flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-signal-cyan/30 border-t-signal-cyan rounded-full animate-spin" />
        <div className="font-display text-signal-cyan/80 text-sm tracking-[0.2em]">
          LOADING MAP
        </div>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  points: MapPoint[];
  onSightingClick: (id: number) => void;
  isLoading: boolean;
  noData: boolean;
  heatmapEnabled: boolean;
  heatmapMode: HeatmapMode;
  countryBounds?: [[number, number], [number, number]] | null;
  onCountryHover?: (data: CountryHoverData | null) => void;
  onCountryClick?: (code: string) => void;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <MapView {...props} />;
}
