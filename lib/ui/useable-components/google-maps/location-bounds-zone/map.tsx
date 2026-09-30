'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';

import { ILocationPoint, IZoneCustomGoogleMapsBoundComponentProps } from '@/lib/utils/interfaces';
import {
  extractLatLngPoints,
  pointsToGeoJSON,
  calculateCenterPoints,
} from '@/lib/utils/methods';
import { DEFAULT_CENTER, DEFAULT_POLYGON } from '@/lib/utils/constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { AutoComplete, AutoCompleteSelectEvent } from 'primereact/autocomplete';
import { useTranslations } from 'next-intl';
import CustomShape from '../shapes';

export default function MapImpl({ _path, onSetZoneCoordinates }: IZoneCustomGoogleMapsBoundComponentProps) {
  useEffect(() => {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  const t = useTranslations();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  const [deliveryZoneType, setDeliveryZoneType] = useState('polygon');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [path, setPath] = useState<ILocationPoint[]>(DEFAULT_POLYGON);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [options, setOptions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Handle Nominatim search
  const onSearch = async (event: any) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.query + ' Bangladesh')}`);
      const data = await res.json();
      const results = data.map((item: any) => ({
        description: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      setOptions(results);
    } catch (err) {
      console.error(err);
    }
  };

  const createPolygonAroundPoint = (c: { lat: number; lng: number }, sizeMeters = 500): ILocationPoint[] => {
    const latOffset = sizeMeters * 0.0000089;
    const lngOffset = (sizeMeters * 0.0000089) / Math.cos((c.lat * Math.PI) / 180);
    return [
      { lat: c.lat + latOffset, lng: c.lng - lngOffset },
      { lat: c.lat + latOffset, lng: c.lng + lngOffset },
      { lat: c.lat - latOffset, lng: c.lng + lngOffset },
      { lat: c.lat - latOffset, lng: c.lng - lngOffset },
    ];
  };

  const bindPolygonEvents = (layer: L.Polygon) => {
    const syncFromLayer = () => {
      const latlngs = layer.getLatLngs();
      const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      const points = (ring as L.LatLng[]).map((ll) => ({ lat: ll.lat, lng: ll.lng }));
      if (points.length >= 3) {
        setPath(points);
        onSetZoneCoordinates(pointsToGeoJSON(points));
      }
    };
    layer.on('pm:edit', syncFromLayer);
    layer.on('pm:dragend', syncFromLayer);
    layer.on('pm:markerdragend', syncFromLayer);
  };

  const onSelect = (event: AutoCompleteSelectEvent) => {
    const selected = event.value;
    if (selected && mapRef.current) {
      const centerPoint = { lat: selected.lat, lng: selected.lng };
      setCenter(centerPoint);
      setInputValue(selected.description);

      const newPath = createPolygonAroundPoint(centerPoint, 500);
      setPath(newPath);

      if (polygonRef.current) {
        mapRef.current.removeLayer(polygonRef.current);
      }

      const newPoly = L.polygon(newPath.map((p) => [p.lat, p.lng] as L.LatLngTuple), {
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapRef.current);

      polygonRef.current = newPoly;
      bindPolygonEvents(newPoly);

      mapRef.current.setView([centerPoint.lat, centerPoint.lng], 14);
      mapRef.current.fitBounds(newPoly.getBounds(), { padding: [30, 30] });

      onSetZoneCoordinates(pointsToGeoJSON(newPath));
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Determine initial points
    const extracted = extractLatLngPoints(_path);
    let initialPath = DEFAULT_POLYGON;
    let initialCenter = DEFAULT_CENTER;

    if (extracted.length >= 3) {
      initialPath = extracted;
      initialCenter = calculateCenterPoints(extracted);
    }

    setPath(initialPath);
    setCenter(initialCenter);
    // Auto-sync initial points immediately
    onSetZoneCoordinates(pointsToGeoJSON(initialPath));

    const map = L.map(mapContainerRef.current).setView([initialCenter.lat, initialCenter.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    // Draw initial polygon
    const initialPoly = L.polygon(initialPath.map((p) => [p.lat, p.lng] as L.LatLngTuple), {
      color: '#1d4ed8',
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(map);

    polygonRef.current = initialPoly;
    bindPolygonEvents(initialPoly);

    try {
      map.fitBounds(initialPoly.getBounds(), { padding: [30, 30] });
    } catch (e) {
      console.warn('fitBounds error:', e);
    }

    // Geoman event: when user finishes drawing a polygon
    map.on('pm:create', (e) => {
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
      }
      const newLayer = e.layer as L.Polygon;
      polygonRef.current = newLayer;
      bindPolygonEvents(newLayer);

      const latlngs = newLayer.getLatLngs();
      const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      const points = (ring as L.LatLng[]).map((ll) => ({ lat: ll.lat, lng: ll.lng }));
      if (points.length >= 3) {
        setPath(points);
        onSetZoneCoordinates(pointsToGeoJSON(points));
      }
    });

    // Geoman event: when polygon is removed
    map.on('pm:remove', (e) => {
      if (e.layer === polygonRef.current) {
        polygonRef.current = null;
        setPath([]);
        onSetZoneCoordinates([]);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  const handleSave = () => {
    if (path.length > 2) {
      onSetZoneCoordinates(pointsToGeoJSON(path));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full rounded shadow-lg bg-white relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 md:w-2/3">
        <span className="p-input-icon-left w-full shadow-lg rounded-lg bg-white flex items-center border border-gray-200">
          <FontAwesomeIcon icon={faMapMarker} className="ml-3 mr-2 text-gray-400" />
          <AutoComplete
            value={inputValue}
            suggestions={options}
            completeMethod={onSearch}
            field="description"
            onChange={(e) => setInputValue(e.value?.description || e.value)}
            onSelect={onSelect}
            placeholder="Search Rajshahi location (e.g. Bornali, Fire Service, Hatem Khan)..."
            className="w-full"
            inputClassName="w-full px-2 py-3 rounded-lg border-none focus:outline-none text-sm"
            pt={{
              root: { className: 'w-full' },
              input: { className: 'w-full px-2 py-3 border-none focus:outline-none' }
            }}
          />
        </span>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full rounded-t z-0" />

      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 rounded-b z-10">
        <CustomShape
          onSetPath={(newPath) => {
            setDeliveryZoneType('polygon');
            setPath(newPath);
            if (mapRef.current) {
              if (polygonRef.current) {
                mapRef.current.removeLayer(polygonRef.current);
              }
              const poly = L.polygon(newPath.map((p) => [p.lat, p.lng] as L.LatLngTuple), {
                color: '#1d4ed8',
                fillColor: '#3b82f6',
                fillOpacity: 0.3,
                weight: 2,
              }).addTo(mapRef.current);
              polygonRef.current = poly;
              bindPolygonEvents(poly);
              mapRef.current.fitBounds(poly.getBounds(), { padding: [30, 30] });
            }
            onSetZoneCoordinates(pointsToGeoJSON(newPath));
          }}
          type={deliveryZoneType}
          center={center}
          path={path}
        />
        <div className="flex items-center gap-3">
          {path.length > 2 && (
            <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
              ✅ {path.length} points active
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={path.length < 3}
            className="px-5 py-2 bg-black text-white text-sm rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            {saveSuccess ? '✓ Zone Saved' : 'Save Zone'}
          </button>
        </div>
      </div>
    </div>
  );
}