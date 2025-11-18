/**
 * Type definitions for Tour Planning applet
 */

export type LatLng = [lat: number, lng: number];

export interface Stop {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  demand?: number; // Optional: for future vehicle capacity constraints
  timeWindow?: [start: number, end: number]; // Optional: delivery time windows
}

export interface Route {
  stops: Stop[];
  totalDistance: number; // in kilometers
  totalTime: number; // in minutes
  distances: number[]; // distance between consecutive stops
  times: number[]; // time between consecutive stops
}

export type DistanceMode = 'straight-line' | 'driving';

export interface RouteSegment {
  from: Stop;
  to: Stop;
  distance: number;
  time: number;
}

export interface OptimizationConfig {
  mode: DistanceMode;
  algorithm: 'nearest-neighbor' | '2-opt' | 'combined';
  maxIterations?: number;
}

export interface OptimizationResult {
  route: Route;
  improvement: number; // percentage improvement
  iterations: number;
  executionTime: number; // milliseconds
}

export interface TspWorkerMessage {
  type: 'optimize' | 'cancel';
  stops: Stop[];
  config: OptimizationConfig;
  distanceMatrix?: number[][];
}

export interface TspWorkerResponse {
  type: 'progress' | 'complete' | 'error';
  progress?: number; // 0-100
  result?: OptimizationResult;
  error?: string;
}

export interface DistanceMatrix {
  [key: string]: {
    [key: string]: {
      distance: number;
      time: number;
    };
  };
}
