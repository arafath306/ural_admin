import { LatLng } from '../../types';

export function transformPolygon(
  coordinate: number[][]
): { lat: number; lng: number }[] {
  return coordinate.slice(0, coordinate.length - 1).map((item: number[]) => {
    return { lat: item[1], lng: item[0] };
  });
}

export function transformPath(
  path: { lng: number; lat: number }[]
): number[][][] {
  const geometry: number[][] = path.map((coordinates) => {
    return [coordinates.lng, coordinates.lat];
  });
  geometry.push(geometry[0]);
  return [geometry];
}

export function extractLatLngPoints(raw: any): { lat: number; lng: number }[] {
  if (!raw) return [];
  if (typeof raw === 'object' && raw.coordinates) raw = raw.coordinates;
  if (Array.isArray(raw) && raw.length > 0) {
    if (typeof raw[0] === 'object' && raw[0] !== null && 'lat' in raw[0]) {
      return raw
        .filter((p: any) => !isNaN(Number(p.lat)) && !isNaN(Number(p.lng)))
        .map((p: any) => ({ lat: Number(p.lat), lng: Number(p.lng) }));
    }
    const ring = Array.isArray(raw[0]) && Array.isArray(raw[0][0]) ? raw[0] : (Array.isArray(raw[0]) ? raw : []);
    const points: { lat: number; lng: number }[] = [];
    for (const item of ring) {
      if (Array.isArray(item) && item.length >= 2) {
        const lng = Number(item[0]);
        const lat = Number(item[1]);
        if (!isNaN(lat) && !isNaN(lng)) points.push({ lat, lng });
      } else if (item && typeof item === 'object' && 'lat' in item) {
        points.push({ lat: Number(item.lat), lng: Number(item.lng) });
      }
    }
    if (points.length > 3) {
      const first = points[0];
      const last = points[points.length - 1];
      if (Math.abs(first.lat - last.lat) < 0.00001 && Math.abs(first.lng - last.lng) < 0.00001) {
        points.pop();
      }
    }
    return points;
  }
  return [];
}

export function pointsToGeoJSON(points: { lat: number; lng: number }[]): number[][][] {
  if (!points || points.length < 3) return [];
  const ring: number[][] = points.map((p) => [Number(p.lng), Number(p.lat)]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }
  return [ring];
}

export function calculateCenterPoints(points: { lat: number; lng: number }[]): LatLng {
  if (!points || points.length === 0) return { lat: 24.3745, lng: 88.6042 };
  let sumLat = 0;
  let sumLng = 0;
  for (const p of points) {
    sumLat += p.lat;
    sumLng += p.lng;
  }
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

export function calculatePolygonCentroid(coordinates: number[][]): LatLng {
  try {
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;

    const n = coordinates.length;

    for (let i = 0; i < n - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];

      const step = x1 * y2 - x2 * y1;
      area += step;
      centroidX += (x1 + x2) * step;
      centroidY += (y1 + y2) * step;
    }

    // Close the polygon by adding the last point with the first one
    const [x1, y1] = coordinates[n - 1];
    const [x2, y2] = coordinates[0];
    const step = x1 * y2 - x2 * y1;
    area += step;
    centroidX += (x1 + x2) * step;
    centroidY += (y1 + y2) * step;

    // Finalize calculations
    area *= 0.5;
    centroidX /= 6 * area;
    centroidY /= 6 * area;

    return { lat: centroidY, lng: centroidX };
  } catch (err) {
    return { lat: 24.3745, lng: 88.6042 };
  }
}