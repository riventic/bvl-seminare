import type { DataPoint, ForecastConfig } from '../types';
import { forecastTimeSeries, calculateErrorMetrics } from '../utils/forecasting';
import { nelderMead } from '../utils/nelderMead';

// Configuration: Number of different starting points for multi-start optimization
// Higher = more robust results, slower but still fast enough
const NUM_OPTIMIZATION_STARTS = 10;

interface OptimizationMessage {
  historicalData: DataPoint[];
  config: ForecastConfig;
}

interface OptimizationResult {
  optimizedConfig: ForecastConfig;
  metrics: {
    rmse: number;
    mae: number;
    mape: number;
  };
}

self.onmessage = (event: MessageEvent<OptimizationMessage>) => {
  const { historicalData, config } = event.data;

  // Check if algorithm supports optimization
  if (config.algorithm === 'moving-average' || config.algorithm === 'linear-regression') {
    self.postMessage({
      type: 'complete',
      result: {
        optimizedConfig: config,
        metrics: { rmse: 0, mae: 0, mape: 0 },
      },
    });
    return;
  }

  // Split data into train/test
  const splitPoint = Math.floor(historicalData.length * 0.8);
  const trainData = historicalData.slice(0, splitPoint);
  const testData = historicalData.slice(splitPoint);

  let totalIterationCount = 0;
  const estimatedTotalIterations = NUM_OPTIMIZATION_STARTS * 30;

  // Determine which parameters to optimize based on algorithm
  const optimizeGamma = config.algorithm === 'holt-winters';
  const optimizeBeta = config.algorithm === 'holt-winters' || config.algorithm === 'double-exponential';

  // Objective function: minimize RMSE (algorithm-aware)
  const objectiveFunction = (params: number[]) => {
    let alpha = config.alpha;
    let beta = config.beta;
    let gamma = config.gamma;

    // Assign optimized parameters based on algorithm
    if (config.algorithm === 'simple-exponential') {
      alpha = params[0];
    } else if (config.algorithm === 'double-exponential') {
      alpha = params[0];
      beta = params[1];
    } else if (config.algorithm === 'holt-winters') {
      alpha = params[0];
      beta = params[1];
      gamma = params[2];
    }

    // Ensure parameters stay within bounds
    if (alpha < 0.1 || alpha > 0.9 || beta < 0.1 || beta > 0.9 || gamma < 0.1 || gamma > 0.9) {
      return Infinity;
    }

    const testConfig = { ...config, alpha, beta, gamma, forecastPeriod: testData.length };
    const forecast = forecastTimeSeries(trainData, testConfig);

    const actual = testData.map(d => d.value);
    const predicted = forecast.map(f => f.value);
    const { rmse } = calculateErrorMetrics(actual, predicted);

    totalIterationCount++;

    // Send progress update
    if (totalIterationCount % 3 === 0) {
      self.postMessage({
        type: 'progress',
        current: totalIterationCount,
        total: estimatedTotalIterations,
      });
    }

    return rmse;
  };

  // Generate multiple starting points based on algorithm
  const startingPoints: number[][] = [];

  // Build initial parameters array based on what we're optimizing
  const buildParams = (a: number, b?: number, g?: number) => {
    if (config.algorithm === 'simple-exponential') return [a];
    if (config.algorithm === 'double-exponential') return [a, b!];
    return [a, b!, g!]; // holt-winters
  };

  // Start 1: User's current parameters
  startingPoints.push(buildParams(config.alpha, config.beta, config.gamma));

  // Start 2-N: Evenly distributed across parameter space
  for (let i = 1; i < NUM_OPTIMIZATION_STARTS; i++) {
    const alpha = 0.1 + (i / (NUM_OPTIMIZATION_STARTS - 1)) * 0.8;
    const beta = 0.1 + ((i * 2) % NUM_OPTIMIZATION_STARTS) / (NUM_OPTIMIZATION_STARTS - 1) * 0.8;
    const gamma = 0.1 + ((i * 3) % NUM_OPTIMIZATION_STARTS) / (NUM_OPTIMIZATION_STARTS - 1) * 0.8;
    startingPoints.push(buildParams(alpha, beta, gamma));
  }

  // Build bounds based on dimensionality
  const bounds = [];
  bounds.push({ min: 0.1, max: 0.9 }); // alpha always optimized
  if (optimizeBeta) bounds.push({ min: 0.1, max: 0.9 }); // beta
  if (optimizeGamma) bounds.push({ min: 0.1, max: 0.9 }); // gamma

  // Run optimization from each starting point
  let bestSolution: { params: number[]; value: number; iterations: number } | null = null;

  for (let i = 0; i < NUM_OPTIMIZATION_STARTS; i++) {
    const solution = nelderMead(objectiveFunction, startingPoints[i], {
      maxIterations: 50,
      tolerance: 1e-6,
      bounds,
    });

    // Keep track of best solution across all starts
    if (!bestSolution || solution.value < bestSolution.value) {
      bestSolution = solution;
    }
  }

  // Extract optimized parameters from best solution
  let optAlpha = config.alpha;
  let optBeta = config.beta;
  let optGamma = config.gamma;

  if (config.algorithm === 'simple-exponential') {
    [optAlpha] = bestSolution!.params;
  } else if (config.algorithm === 'double-exponential') {
    [optAlpha, optBeta] = bestSolution!.params;
  } else if (config.algorithm === 'holt-winters') {
    [optAlpha, optBeta, optGamma] = bestSolution!.params;
  }

  // Calculate final metrics with optimized parameters
  const finalConfig = { ...config, alpha: optAlpha, beta: optBeta, gamma: optGamma, forecastPeriod: testData.length };
  const finalForecast = forecastTimeSeries(trainData, finalConfig);
  const actual = testData.map(d => d.value);
  const predicted = finalForecast.map(f => f.value);
  const finalMetrics = calculateErrorMetrics(actual, predicted);

  // Send final result
  const result: OptimizationResult = {
    optimizedConfig: {
      ...config,
      alpha: Math.round(optAlpha * 100) / 100,
      beta: Math.round(optBeta * 100) / 100,
      gamma: Math.round(optGamma * 100) / 100,
    },
    metrics: finalMetrics,
  };

  self.postMessage({
    type: 'complete',
    result,
  });
};
