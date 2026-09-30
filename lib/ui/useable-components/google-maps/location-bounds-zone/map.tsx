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

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapImpl({ _path, onSetZoneCoordinates }: IZoneCustomGoogleMapsBoundComponentProps) {
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

  const createPolygonAroundPoint = (center: { lat: number; lng: number }, sizeMeters = 100): ILocationPoint[] => {
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
        newPath = createPolygonAroundPoint(centerPoint, 200);
      }
      setPath(newPath);

      if (mapRef.current) {
        mapRef.current.setView([centerPoint.lat, centerPoint.lng], 16);
      }
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    let initialCenter = center;
    let initialPath = path;

    if (_path && _path.length > 0 && _path[0] && _path[0].length > 0) {
      initialPath = transformPolygon(_path[0]);
      initialCenter = calculatePolygonCentroid(_path[0]);
      setPath(initialPath);
      setCenter(initialCenter);
    }

    const map = L.map(mapContainerRef.current).setView([initialCenter.lat, initialCenter.lng], 14);
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

  // Update Polygon on state change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }

    if (path.length > 0) {
      const latlngs = path.map(p => [p.lat, p.lng] as L.LatLngTuple);
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

      if (path.length > 2) {
        map.fitBounds(polygonRef.current.getBounds());
      }
    }
  }, [path]);

  const handleSave = () => {
    if (path.length > 2) {
      const transformedPath = path.map(p => ({ lat: p.lat, lng: p.lng }));
      onSetZoneCoordinates(transformedPath);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] rounded shadow-lg bg-white relative">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 md:w-1/2">
        <span className="p-input-icon-left w-full shadow rounded bg-white flex items-center">
          <FontAwesomeIcon icon={faMapMarker} className="ml-3 mr-2 text-gray-500" />
          <AutoComplete
            value={inputValue}
            suggestions={options}
            completeMethod={onSearch}
            field="description"
            onChange={(e) => setInputValue(e.value?.description || e.value)}
            onSelect={onSelect}
            placeholder={t('SearchLocation')}
            className="w-full"
            inputClassName="w-full px-2 py-3 rounded border-none focus:outline-none"
            pt={{
              root: { className: 'w-full' },
              input: { className: 'w-full px-2 py-3 border-none focus:outline-none' }
            }}
          />
        </span>
      </div>
      <div ref={mapContainerRef} className="flex-1 w-full rounded-t z-0" />
      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-b z-10">
        <CustomShape
          onSetPath={(newPath) => {
            setDeliveryZoneType('polygon');
            setPath(newPath);
          }}
          type={deliveryZoneType}
          center={center}
          path={path}
        />
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
        >
          {t('Save')}
        </button>
      </div>
    </div>
  );
}
