import * as MediaLibrary from 'expo-media-library';
import { Photo } from '../types';
import { RECENT_PHOTOS_DAYS, SESSION_SIZE } from '../constants';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface AssetWithExtras extends MediaLibrary.Asset {
  isFavorite?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export async function requestPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<boolean> {
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status === 'granted';
}

function isRecentPhoto(creationTime: number, excludeDays: number): boolean {
  const cutoffTime = Date.now() - excludeDays * MILLISECONDS_PER_DAY;
  return creationTime > cutoffTime;
}

export async function fetchEligiblePhotos(
  excludeRecent: boolean = true,
  recentDays: number = RECENT_PHOTOS_DAYS
): Promise<Photo[]> {
  const hasPermission = await getPermissionStatus();
  if (!hasPermission) {
    throw new Error('Photo library permission not granted');
  }

  const allPhotos: Photo[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: 500,
      after: endCursor,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    for (const baseAsset of result.assets) {
      const asset = baseAsset as AssetWithExtras;
      const isFavorite = asset.isFavorite ?? false;
      
      if (isFavorite) {
        continue;
      }

      const creationTime = asset.creationTime;
      if (excludeRecent && isRecentPhoto(creationTime, recentDays)) {
        continue;
      }

      const photo: Photo = {
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        width: asset.width,
        height: asset.height,
        isFavorite,
        location: asset.location
          ? {
              latitude: asset.location.latitude,
              longitude: asset.location.longitude,
            }
          : undefined,
      };

      allPhotos.push(photo);
    }

    hasNextPage = result.hasNextPage;
    endCursor = result.endCursor;
  }

  return allPhotos;
}

export function selectRandomPhotos(photos: Photo[], count: number = SESSION_SIZE): Photo[] {
  if (photos.length <= count) {
    return shuffleArray([...photos]);
  }

  const shuffled = shuffleArray([...photos]);
  return shuffled.slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function deletePhotos(photoIds: string[]): Promise<boolean> {
  if (photoIds.length === 0) {
    return true;
  }

  try {
    const result = await MediaLibrary.deleteAssetsAsync(photoIds);
    return result;
  } catch (error) {
    console.error('Error deleting photos:', error);
    return false;
  }
}

export async function getPhotoInfo(photoId: string): Promise<MediaLibrary.Asset | null> {
  try {
    const asset = await MediaLibrary.getAssetInfoAsync(photoId);
    return asset;
  } catch (error) {
    console.error('Error getting photo info:', error);
    return null;
  }
}
