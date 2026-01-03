import * as Location from 'expo-location';
import { PhotoLocation } from '../types';

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city?: string; country?: string }> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length > 0) {
      const result = results[0];
      return {
        city: result.city || result.subregion || undefined,
        country: result.country || undefined,
      };
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }

  return {};
}

export async function enrichPhotoLocation(
  location: PhotoLocation
): Promise<PhotoLocation> {
  if (location.city && location.country) {
    return location;
  }

  const geocoded = await reverseGeocode(location.latitude, location.longitude);
  
  return {
    ...location,
    city: location.city || geocoded.city,
    country: location.country || geocoded.country,
  };
}
