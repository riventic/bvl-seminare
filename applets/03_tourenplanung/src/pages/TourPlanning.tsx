/**
 * TourPlanning - Main page component
 */
import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import MapView from '../components/MapView';
import StopListOverlay from '../components/StopListOverlay';
import StatsPanel from '../components/StatsPanel';
import { berlinStops, getBerlinCenter } from '../data/berlinStops';
import { calculateRouteMetrics } from '../utils/distanceCalculator';
import type { Stop, DistanceMode, TspWorkerMessage, TspWorkerResponse } from '../types';

export default function TourPlanning() {

  // State
  const [stops, setStops] = useState<Stop[]>(() => berlinStops.slice(0, 10));
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('straight-line');
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [distances, setDistances] = useState<number[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [improvement, setImprovement] = useState<number | undefined>(undefined);
  const [optimalDistance, setOptimalDistance] = useState<number | undefined>(undefined);

  // Calculate route metrics whenever stops or distance mode changes
  useEffect(() => {
    const calculateMetrics = async () => {
      if (stops.length < 2) {
        setTotalDistance(0);
        setTotalTime(0);
        setDistances([]);
        return;
      }

      const metrics = await calculateRouteMetrics(stops, distanceMode);
      setTotalDistance(metrics.totalDistance);
      setTotalTime(metrics.totalTime);
      setDistances(metrics.distances);

      // Calculate improvement percentage if we have optimal distance
      if (optimalDistance !== undefined && optimalDistance > 0) {
        const diff = ((metrics.totalDistance - optimalDistance) / optimalDistance) * 100;
        setImprovement(diff);
      } else {
        setImprovement(undefined);
      }
    };

    calculateMetrics();
  }, [stops, distanceMode, optimalDistance]);

  // Handle stop reorder
  const handleReorder = useCallback((newStops: Stop[]) => {
    setStops(newStops);
  }, []);

  // Handle distance mode change
  const handleDistanceModeChange = useCallback((mode: DistanceMode) => {
    setDistanceMode(mode);
    setOptimalDistance(undefined);
  }, []);

  // Handle optimization
  const handleOptimize = useCallback(() => {
    if (stops.length < 2 || isOptimizing) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Create Web Worker
    const worker = new Worker(
      new URL('../workers/tspWorker.ts', import.meta.url),
      { type: 'module' }
    );

    const message: TspWorkerMessage = {
      type: 'optimize',
      stops,
      config: {
        mode: distanceMode,
        algorithm: 'combined',
        maxIterations: 1000,
      },
    };

    worker.postMessage(message);

    worker.onmessage = (event: MessageEvent<TspWorkerResponse>) => {
      const response = event.data;

      if (response.type === 'progress') {
        setOptimizationProgress(response.progress || 0);
      } else if (response.type === 'complete') {
        if (response.result) {
          setStops(response.result.route.stops);
          setOptimalDistance(response.result.route.totalDistance);
        }
        setIsOptimizing(false);
        worker.terminate();
      } else if (response.type === 'error') {
        console.error('Optimization error:', response.error);
        setIsOptimizing(false);
        worker.terminate();
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setIsOptimizing(false);
      worker.terminate();
    };
  }, [stops, distanceMode, isOptimizing]);

  // Handle reset
  const handleReset = useCallback(() => {
    setStops(berlinStops.slice(0, 10));
    setOptimalDistance(undefined);
  }, []);

  // Handle randomize
  const handleRandomize = useCallback(() => {
    const shuffled = [...stops].sort(() => Math.random() - 0.5);
    setStops(shuffled);
  }, [stops]);

  // Handle add stop
  const handleAddStop = useCallback((stop: Stop) => {
    setStops([...stops, stop]);
  }, [stops]);

  // Handle delete stop
  const handleDeleteStop = useCallback((stopId: string) => {
    if (stops.length <= 2) return; // Prevent deletion if <= 2 stops
    setStops(stops.filter((s) => s.id !== stopId));
  }, [stops]);

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Fullscreen Map (Base Layer) */}
      <MapView stops={stops} center={getBerlinCenter()} zoom={11} />

      {/* Stats Panel (Top-Right Overlay) */}
      <StatsPanel
        totalDistance={totalDistance}
        totalTime={totalTime}
        improvement={improvement}
      />

      {/* Stops List Panel (Left Overlay) */}
      <StopListOverlay
        stops={stops}
        distances={distances}
        onReorder={handleReorder}
        distanceMode={distanceMode}
        onDistanceModeChange={handleDistanceModeChange}
        onOptimize={handleOptimize}
        onReset={handleReset}
        onRandomize={handleRandomize}
        onAddStop={handleAddStop}
        onDeleteStop={handleDeleteStop}
        availableStops={berlinStops}
        isOptimizing={isOptimizing}
        optimizationProgress={optimizationProgress}
      />
    </Box>
  );
}
