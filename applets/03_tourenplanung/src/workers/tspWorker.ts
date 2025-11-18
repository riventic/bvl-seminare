/**
 * Web Worker for TSP optimization
 * Runs optimization in background thread to avoid blocking UI
 */
import type { TspWorkerMessage, TspWorkerResponse } from '../types';
import { optimizeRoute, calculateTotalDistance } from '../utils/tspOptimization';
import { calculateHaversineDistance } from '../utils/distanceCalculator';

self.onmessage = (event: MessageEvent<TspWorkerMessage>) => {
  const { type, stops, config, distanceMatrix } = event.data;

  if (type === 'cancel') {
    self.close();
    return;
  }

  if (type === 'optimize') {
    try {
      const startTime = performance.now();

      // Build or use provided distance matrix
      let matrix: number[][];

      if (distanceMatrix) {
        matrix = distanceMatrix;
      } else {
        // Build matrix using Haversine distance (synchronous)
        const n = stops.length;
        matrix = Array(n)
          .fill(0)
          .map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (i === j) {
              matrix[i][j] = 0;
            } else {
              matrix[i][j] = calculateHaversineDistance(
                stops[i].location,
                stops[j].location
              );
            }
          }
        }
      }

      // Report progress
      const progressResponse: TspWorkerResponse = {
        type: 'progress',
        progress: 25,
      };
      self.postMessage(progressResponse);

      // Run optimization
      const maxIterations = config.maxIterations || 1000;
      const { route, improvement, iterations } = optimizeRoute(matrix, maxIterations);

      // Report progress
      const progressResponse2: TspWorkerResponse = {
        type: 'progress',
        progress: 75,
      };
      self.postMessage(progressResponse2);

      // Reorder stops based on optimized route
      const optimizedStops = route.map((index) => stops[index]);

      // Calculate metrics
      const totalDistance = calculateTotalDistance(route, matrix);

      // Calculate times (assuming 30 km/h average)
      const distances: number[] = [];
      const times: number[] = [];
      let totalTime = 0;

      for (let i = 0; i < route.length - 1; i++) {
        const dist = matrix[route[i]][route[i + 1]];
        const time = (dist / 30) * 60; // Convert to minutes
        distances.push(dist);
        times.push(time);
        totalTime += time;
      }

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      // Send result
      const completeResponse: TspWorkerResponse = {
        type: 'complete',
        result: {
          route: {
            stops: optimizedStops,
            totalDistance: Math.round(totalDistance * 100) / 100,
            totalTime: Math.round(totalTime * 10) / 10,
            distances,
            times,
          },
          improvement,
          iterations,
          executionTime,
        },
      };

      self.postMessage(completeResponse);
    } catch (error) {
      const errorResponse: TspWorkerResponse = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      self.postMessage(errorResponse);
    }
  }
};

// Prevent TypeScript errors in worker context
export {};
