'use client';

import dynamic from 'next/dynamic';
import { IZoneCustomGoogleMapsBoundComponentProps } from '@/lib/utils/interfaces';

const MapWithNoSSR = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
      <p>Loading Map...</p>
    </div>
  ),
});

export default function CustomGoogleMapsLocationZoneBounds(
  props: IZoneCustomGoogleMapsBoundComponentProps
) {
  return <MapWithNoSSR {...props} />;
}
