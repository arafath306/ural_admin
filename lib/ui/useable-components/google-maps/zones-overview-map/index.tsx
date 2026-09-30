'use client';

import dynamic from 'next/dynamic';
import { IZoneResponse } from '@/lib/utils/interfaces';

interface IZonesOverviewMapProps {
  zones: IZoneResponse[];
  focusedZoneId?: string | null;
  onZoneClick?: (zone: IZoneResponse) => void;
  onEditZone?: (zone: IZoneResponse) => void;
}

const OverviewMapWithNoSSR = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-dark-900 rounded-xl">
      <div className="text-center text-gray-500">
        <div className="text-3xl mb-2">🗺️</div>
        <p className="font-medium text-sm">Loading Zones Map...</p>
      </div>
    </div>
  ),
});

export default function ZonesOverviewMap(props: IZonesOverviewMapProps) {
  return <OverviewMapWithNoSSR {...props} />;
}