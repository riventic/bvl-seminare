/**
 * Traveling Salesman Problem (TSP) optimization algorithms
 * Implements Nearest Neighbor and 2-opt algorithms
 */
import type { Stop } from '../types';

/**
 * Calculate total distance of a route using a distance matrix
 */
export function calculateTotalDistance(route: number[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distanceMatrix[route[i]][route[i + 1]];
  }
  return total;
}

/**
 * Nearest Neighbor algorithm - greedy heuristic
 * Starts from the first stop and always visits the nearest unvisited stop
 */
export function nearestNeighbor(distanceMatrix: number[][]): number[] {
  const n = distanceMatrix.length;
  if (n === 0) return [];
  if (n === 1) return [0];

  const route: number[] = [0]; // Start from first stop
  const unvisited = new Set<number>(Array.from({ length: n }, (_, i) => i));
  unvisited.delete(0);

  let current = 0;

  while (unvisited.size > 0) {
    let nearest = -1;
    let minDistance = Infinity;

    for (const next of unvisited) {
      const distance = distanceMatrix[current][next];
      if (distance < minDistance) {
        minDistance = distance;
        nearest = next;
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      unvisited.delete(nearest);
      current = nearest;
    }
  }

  return route;
}

/**
 * 2-opt algorithm - local search optimization
 * Iteratively improves a tour by swapping edges
 */
export function twoOpt(
  initialRoute: number[],
  distanceMatrix: number[][],
  maxIterations: number = 1000
): { route: number[]; improvement: number; iterations: number } {
  let route = [...initialRoute];
  let improved = true;
  let iterations = 0;
  const initialDistance = calculateTotalDistance(route, distanceMatrix);

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        const newRoute = twoOptSwap(route, i, j);
        const currentDistance = calculateTotalDistance(route, distanceMatrix);
        const newDistance = calculateTotalDistance(newRoute, distanceMatrix);

        if (newDistance < currentDistance) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }

  const finalDistance = calculateTotalDistance(route, distanceMatrix);
  const improvement = ((initialDistance - finalDistance) / initialDistance) * 100;

  return {
    route,
    improvement: Math.round(improvement * 100) / 100,
    iterations,
  };
}

/**
 * Perform a 2-opt swap
 * Reverses the order of stops between indices i and j
 */
function twoOptSwap(route: number[], i: number, j: number): number[] {
  const newRoute = [...route];
  // Reverse the segment between i and j
  const segment = route.slice(i, j + 1).reverse();
  newRoute.splice(i, segment.length, ...segment);
  return newRoute;
}

/**
 * Combined optimization strategy
 * Uses Nearest Neighbor for initial solution, then applies 2-opt
 */
export function optimizeRoute(
  distanceMatrix: number[][],
  maxIterations: number = 1000
): { route: number[]; improvement: number; iterations: number } {
  // Get initial solution using Nearest Neighbor
  const initialRoute = nearestNeighbor(distanceMatrix);

  // Improve using 2-opt
  const result = twoOpt(initialRoute, distanceMatrix, maxIterations);

  return result;
}

/**
 * Reorder stops array based on route indices
 */
export function reorderStops(stops: Stop[], route: number[]): Stop[] {
  return route.map((index) => stops[index]);
}

/**
 * Build distance matrix from stops (synchronous version for worker)
 */
export function buildDistanceMatrixSync(
  stops: Stop[],
  calculateDistance: (from: Stop, to: Stop) => number
): number[][] {
  const n = stops.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = calculateDistance(stops[i], stops[j]);
      }
    }
  }

  return matrix;
}
