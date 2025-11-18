/**
 * Distance and time calculation utilities
 * Supports both straight-line (Haversine) and driving route calculations
 */
import type { Stop, LatLng, DistanceMode } from '../types';

/**
 * Calculate the Haversine distance between two points on Earth
 * @param point1 - First point [lat, lng]
 * @param point2 - Second point [lat, lng]
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time based on distance
 * Assumes average city driving speed of 30 km/h
 */
export function estimateTime(distance: number, avgSpeed: number = 30): number {
  const timeInHours = distance / avgSpeed;
  const timeInMinutes = timeInHours * 60;
  return Math.round(timeInMinutes * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate distance between two stops using the selected mode
 */
export async function calculateDistance(
  from: Stop,
  to: Stop,
  mode: DistanceMode
): Promise<{ distance: number; time: number }> {
  if (mode === 'straight-line') {
    const distance = calculateHaversineDistance(from.location, to.location);
    const time = estimateTime(distance);
    return { distance, time };
  } else {
    // Driving mode - use OSRM routing
    return await calculateDrivingRoute(from.location, to.location);
  }
}

/**
 * Calculate driving route using OSRM (Open Source Routing Machine)
 * Free public API for routing with OpenStreetMap data
 */
export async function calculateDrivingRoute(
  from: LatLng,
  to: LatLng
): Promise<{ distance: number; time: number }> {
  try {
    const [fromLat, fromLng] = from;
    const [toLat, toLng] = to;

    // OSRM public API endpoint
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distance = (route.distance / 1000); // Convert meters to kilometers
      const time = (route.duration / 60); // Convert seconds to minutes

      return {
        distance: Math.round(distance * 100) / 100,
        time: Math.round(time * 10) / 10,
      };
    } else {
      // Fallback to Haversine if routing fails
      console.warn('OSRM routing failed, falling back to straight-line distance');
      const distance = calculateHaversineDistance(from, to);
      const time = estimateTime(distance);
      return { distance, time };
    }
  } catch (error) {
    // Fallback to Haversine on error
    console.error('Error calculating driving route:', error);
    const distance = calculateHaversineDistance(from, to);
    const time = estimateTime(distance);
    return { distance, time };
  }
}

/**
 * Calculate distance matrix for all stops
 * @param stops - Array of stops
 * @param mode - Distance calculation mode
 * @returns 2D array of distances
 */
export async function calculateDistanceMatrix(
  stops: Stop[],
  mode: DistanceMode
): Promise<number[][]> {
  const n = stops.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        const { distance } = await calculateDistance(stops[i], stops[j], mode);
        matrix[i][j] = distance;
      }
    }
  }

  return matrix;
}

/**
 * Calculate total route distance and time
 */
export async function calculateRouteMetrics(
  stops: Stop[],
  mode: DistanceMode
): Promise<{ totalDistance: number; totalTime: number; distances: number[]; times: number[] }> {
  let totalDistance = 0;
  let totalTime = 0;
  const distances: number[] = [];
  const times: number[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const { distance, time } = await calculateDistance(stops[i], stops[i + 1], mode);
    distances.push(distance);
    times.push(time);
    totalDistance += distance;
    totalTime += time;
  }

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: Math.round(totalTime * 10) / 10,
    distances,
    times,
  };
}
