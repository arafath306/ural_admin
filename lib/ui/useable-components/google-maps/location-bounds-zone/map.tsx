'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';

import { ILocationPoint, IZoneCustomGoogleMapsBoundComponentProps } from '@/lib/utils/interfaces';
import { calculatePolygonCentroid, transformPolygon } from '@/lib/utils/methods';
import { DEFAULT_CENTER, DEFAULT_POLYGON } from '@/lib/utils/constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { AutoComplete, AutoCompleteSelectEvent } from 'primereact/autocomplete';
import { useTranslations } from 'next-intl';
import CustomShape from '../shapes';

// Guard: check if _path has valid non-empty, non-NaN coordinates
function hasValidPath(p: any): boolean {
  try {
    if (!p || !Array.isArray(p) || p.length === 0) return false;
    const ring = p[0];
    if (!Array.isArray(ring) || ring.length < 3) return false;
    const first = ring[0];
    if (!Array.isArray(first) || first.length < 2) return false;
    const [lng, lat] = first;
    return (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      !isNaN(lng) &&
      !isNaN(lat) &&
      (Math.abs(lng) > 0.0001 || Math.abs(lat) > 0.0001)
    );
  } catch {
    return false;
  }
}

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

  const [options, setOptions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Handle Nominatim search
  const onSearch = async (event: any) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.query)}`);
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

  const createPolygonAroundPoint = (center: { lat: number; lng: number }, sizeMeters = 500): ILocationPoint[] => {
    const latOffset = sizeMeters * 0.0000089;
    const lngOffset = (sizeMeters * 0.0000089) / Math.cos((center.lat * Math.PI) / 180);
    return [
      { lat: center.lat + latOffset, lng: center.lng - lngOffset },
      { lat: center.lat + latOffset, lng: center.lng + lngOffset },
      { lat: center.lat - latOffset, lng: center.lng + lngOffset },
      { lat: center.lat - latOffset, lng: center.lng - lngOffset },
    ];
  };

  const onSelect = (event: AutoCompleteSelectEvent) => {
    const selected = event.value;
    if (selected) {
      const centerPoint = { lat: selected.lat, lng: selected.lng };
      setCenter(centerPoint);
      setInputValue(selected.description);

      let newPath: ILocationPoint[] = [];
      if (deliveryZoneType === 'polygon') {
        newPath = createPolygonAroundPoint(centerPoint, 500);
      }
      setPath(newPath);

      if (mapRef.current) {
        mapRef.current.setView([centerPoint.lat, centerPoint.lng], 14);
      }
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    let initialCenter = { ...DEFAULT_CENTER };
    let initialPath = [...DEFAULT_POLYGON];

    // Only use _path if it has valid real coordinates
    if (hasValidPath(_path)) {
      try {
        const transformed = transformPolygon(_path[0]);
        const clean = transformed.filter(p => !isNaN(p.lat) && !isNaN(p.lng));
        if (clean.length > 2) {
          const centroid = calculatePolygonCentroid(_path[0]);
          if (!isNaN(centroid.lat) && !isNaN(centroid.lng) && (Math.abs(centroid.lat) > 0.0001 || Math.abs(centroid.lng) > 0.0001)) {
            initialPath = clean;
            initialCenter = centroid;
          }
        }
      } catch (e) {
        console.warn('Invalid zone path, using default center', e);
      }
    }

    setPath(initialPath);
    setCenter(initialCenter);

    const map = L.map(mapContainerRef.current).setView([initialCenter.lat, initialCenter.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
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

    const updateCoordinates = () => {
      if (polygonRef.current) {
        const latlngs = polygonRef.current.getLatLngs();
        const firstRing = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        const newPath = (firstRing as L.LatLng[]).map((ll) => ({ lat: ll.lat, lng: ll.lng }));
        setPath(newPath);
      }
    };

    map.on('pm:create', (e) => {
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
      }
      polygonRef.current = e.layer as L.Polygon;
      polygonRef.current.on('pm:edit', updateCoordinates);
      polygonRef.current.on('pm:dragend', updateCoordinates);
      polygonRef.current.on('pm:markerdragend', updateCoordinates);
      updateCoordinates();
    });

    map.on('pm:remove', () => {
      polygonRef.current = null;
      setPath([]);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Draw initial polygon when path changes (only once at mount)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }

    const validPath = path.filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    if (validPath.length > 2) {
      const latlngs = validPath.map(p => [p.lat, p.lng] as L.LatLngTuple);
      polygonRef.current = L.polygon(latlngs, { color: '#000000', pmIgnore: false }).addTo(map);
      
      const updateCoordinates = () => {
        const p = polygonRef.current?.getLatLngs();
        if (p) {
          const ring = Array.isArray(p[0]) ? p[0] : p;
          setPath((ring as L.LatLng[]).map(ll => ({ lat: ll.lat, lng: ll.lng })));
        }
      };

      polygonRef.current.on('pm:edit', updateCoordinates);
      polygonRef.current.on('pm:dragend', updateCoordinates);
      polygonRef.current.on('pm:markerdragend', updateCoordinates);

      map.fitBounds(polygonRef.current.getBounds(), { padding: [20, 20] });
    }
  }, [path]);

  const handleSave = () => {
    if (path.length > 2) {
      const transformedPath = path.map(p => ({ lat: p.lat, lng: p.lng }));
      onSetZoneCoordinates(transformedPath);
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
            placeholder="Search location..."
            className="w-full"
            inputClassName="w-full px-2 py-3 rounded-lg border-none focus:outline-none text-sm"
            pt={{
              root: { className: 'w-full' },
              input: { className: 'w-full px-2 py-3 border-none focus:outline-none' }
            }}
          />
        </span>
      </div>
      {/* Map */}
      <div ref={mapContainerRef} className="flex-1 w-full rounded-t z-0" />
      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 rounded-b z-10">
        <CustomShape
          onSetPath={(newPath) => {
            setDeliveryZoneType('polygon');
            setPath(newPath);
          }}
          type={deliveryZoneType}
          center={center}
          path={path}
        />
        <div className="flex items-center gap-3">
          {path.length > 2 && (
            <span className="text-xs text-green-600 font-medium">✅ {path.length} points selected</span>
          )}
          <button
            onClick={handleSave}
            disabled={path.length < 3}
            className="px-5 py-2 bg-black text-white text-sm rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save Zone
          </button>
        </div>
      </div>
    </div>
  );
}