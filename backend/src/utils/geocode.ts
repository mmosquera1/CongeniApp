import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY environment variable');
  }

  try {
    const response = await mapsClient.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const first = response.data.results?.[0];
    if (!first) {
      return null;
    }

    return {
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
      formattedAddress: first.formatted_address
    };
  } catch (error) {
    console.error('Geocode error', error);
    return null;
  }
}

export function isWithinRadius(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);

  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance <= radiusMeters;
}
