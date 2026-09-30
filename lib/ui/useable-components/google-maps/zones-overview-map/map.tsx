'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IZoneResponse } from '@/lib/utils/interfaces';
import { extractLatLngPoints, calculateCenterPoints } from '@/lib/utils/methods';
import { DEFAULT_CENTER } from '@/lib/utils/constants';

interface IZonesOverviewMapProps {
  zones: IZoneResponse[];
  focusedZoneId?: string | null;
  onZoneClick?: (zone: IZoneResponse) => void;
  onEditZone?: (zone: IZoneResponse) => void;
}

const ZONE_COLORS = [
  { stroke: '#2563eb', fill: '#3b82f6' }, // Blue
  { stroke: '#16a34a', fill: '#22c55e' }, // Green
  { stroke: '#d97706', fill: '#f59e0b' }, // Amber
  { stroke: '#9333ea', fill: '#a855f7' }, // Purple
  { stroke: '#dc2626', fill: '#ef4444' }, // Red
  { stroke: '#0891b2', fill: '#06b6d4' }, // Cyan
];

export default function ZonesOverviewMapImpl({
  zones,
  focusedZoneId,
  onZoneClick,
  onEditZone,
}: IZonesOverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);
  const polygonMapRef = useRef<Map<string, L.Polygon>>(new Map());

  const [activeZoneCount, setActiveZoneCount] = useState(0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const group = L.featureGroup().addTo(map);
    layersGroupRef.current = group;
    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Render Polygons when zones change
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();
    polygonMapRef.current.clear();

    let count = 0;
    const bounds = L.latLngBounds([]);

    zones.forEach((z, index) => {
      const points = extractLatLngPoints(z.location?.coordinates || z.location);
      if (points.length >= 3) {
        count++;
        const colorSet = ZONE_COLORS[index % ZONE_COLORS.length];
        const latlngs = points.map((p) => [p.lat, p.lng] as L.LatLngTuple);
        latlngs.forEach((ll) => bounds.extend(ll));

        const poly = L.polygon(latlngs, {
          color: colorSet.stroke,
          fillColor: colorSet.fill,
          fillOpacity: 0.25,
          weight: 2.5,
        });

        poly.bindTooltip(`<b>${z.title}</b>`, {
          permanent: true,
          direction: 'center',
          className: 'zone-label font-medium text-xs bg-white/95 px-2 py-0.5 rounded shadow border border-gray-300 text-gray-800',
        });

        const zoneId = z._id || z.id;
        poly.on('click', () => {
          if (onZoneClick) onZoneClick(z);
        });

        group.addLayer(poly);
        polygonMapRef.current.set(zoneId, poly);
      }
    });

    setActiveZoneCount(count);

    if (count > 0 && bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [zones, onZoneClick]);

  // Focus specific zone if requested
  useEffect(() => {
    if (!mapRef.current || !focusedZoneId) return;
    const poly = polygonMapRef.current.get(focusedZoneId);
    if (poly) {
      poly.setStyle({ weight: 4, fillOpacity: 0.45 });
      mapRef.current.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 15 });
    }
  }, [focusedZoneId]);

  const zoomToRajshahi = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13, { duration: 0.8 });
    }
  };

  const zoomToDhaka = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([23.78, 90.41], 12, { duration: 0.8 });
    }
  };

  const zoomFitAll = () => {
    if (mapRef.current && layersGroupRef.current && layersGroupRef.current.getLayers().length > 0) {
      mapRef.current.fitBounds(layersGroupRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden relative">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 dark:bg-dark-900/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-gray-200 dark:border-dark-700 pointer-events-auto flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
            🗺️ Live Zones Map
          </span>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
            {activeZoneCount} active {activeZoneCount === 1 ? 'zone' : 'zones'}
          </span>
        </div>

        {/* Quick Zoom Buttons */}
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-dark-900/95 backdrop-blur p-1 rounded-lg shadow-md border border-gray-200 dark:border-dark-700 pointer-events-auto text-xs">
          <button
            type="button"
            onClick={zoomToRajshahi}
            className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-200 font-medium transition"
          >
            📍 Rajshahi
          </button>
          <button
            type="button"
            onClick={zoomToDhaka}
            className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-200 font-medium transition"
          >
            📍 Dhaka
          </button>
          <button
            type="button"
            onClick={zoomFitAll}
            className="px-2.5 py-1 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
          >
            Fit All
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />
    </div>
  );
}