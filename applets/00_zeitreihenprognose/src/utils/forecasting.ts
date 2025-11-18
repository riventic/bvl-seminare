import { addDays } from 'date-fns';
import type { DataPoint, ForecastPoint, ForecastConfig } from '../types';

// Simple Exponential Smoothing
export function simpleExponentialSmoothing(
  data: DataPoint[],
  alpha: number
): number[] {
  const smoothed: number[] = [data[0].value];

  for (let i = 1; i < data.length; i++) {
    const value = alpha * data[i].value + (1 - alpha) * smoothed[i - 1];
    smoothed.push(value);
  }

  return smoothed;
}

// Double Exponential Smoothing (Holt's Method)
export function doubleExponentialSmoothing(
  data: DataPoint[],
  alpha: number,
  beta: number
): { level: number[]; trend: number[] } {
  const level: number[] = [data[0].value];
  const trend: number[] = [data[1].value - data[0].value];

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level[i - 1];
    const prevTrend = trend[i - 1];

    const newLevel = alpha * data[i].value + (1 - alpha) * (prevLevel + prevTrend);
    const newTrend = beta * (newLevel - prevLevel) + (1 - beta) * prevTrend;

    level.push(newLevel);
    trend.push(newTrend);
  }

  return { level, trend };
}

// Holt-Winters (Triple Exponential Smoothing)
export function holtWinters(
  data: DataPoint[],
  alpha: number,
  beta: number,
  gamma: number,
  seasonalPeriod: number
): { level: number[]; trend: number[]; seasonal: number[] } {
  const n = data.length;
  const level: number[] = [];
  const trend: number[] = [];
  const seasonal: number[] = new Array(n).fill(0);

  // Initialize seasonal components
  for (let i = 0; i < seasonalPeriod; i++) {
    seasonal[i] = data[i].value / (data.slice(0, seasonalPeriod).reduce((sum, d) => sum + d.value, 0) / seasonalPeriod);
  }

  // Initialize level and trend
  level[0] = data[0].value;
  trend[0] = (data[seasonalPeriod].value - data[0].value) / seasonalPeriod;

  // Holt-Winters equations
  for (let i = 1; i < n; i++) {
    const prevLevel = level[i - 1];
    const prevTrend = trend[i - 1];
    const seasonalIndex = i - seasonalPeriod >= 0 ? i - seasonalPeriod : i;

    const newLevel = alpha * (data[i].value / seasonal[seasonalIndex]) + (1 - alpha) * (prevLevel + prevTrend);
    const newTrend = beta * (newLevel - prevLevel) + (1 - beta) * prevTrend;
    const newSeasonal = gamma * (data[i].value / newLevel) + (1 - gamma) * seasonal[seasonalIndex];

    level.push(newLevel);
    trend.push(newTrend);
    seasonal[i] = newSeasonal;
  }

  return { level, trend, seasonal };
}

// Moving Average
export function movingAverage(data: DataPoint[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i].value);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((acc, point) => acc + point.value, 0);
      result.push(sum / window);
    }
  }

  return result;
}

// Linear Regression
export function linearRegression(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i].value;
    sumXY += i * data[i].value;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Calculate error metrics
export function calculateErrorMetrics(actual: number[], predicted: number[]): { rmse: number; mae: number; mape: number } {
  const n = Math.min(actual.length, predicted.length);
  let sumSquaredError = 0;
  let sumAbsoluteError = 0;
  let sumPercentageError = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    sumSquaredError += error * error;
    sumAbsoluteError += Math.abs(error);
    sumPercentageError += Math.abs(error / actual[i]) * 100;
  }

  const rmse = Math.sqrt(sumSquaredError / n);
  const mae = sumAbsoluteError / n;
  const mape = sumPercentageError / n;

  return { rmse, mae, mape };
}

// Main forecasting function
export function forecastTimeSeries(
  historicalData: DataPoint[],
  config: ForecastConfig
): ForecastPoint[] {
  console.log('[FORECAST] forecastTimeSeries called', {
    algorithm: config.algorithm,
    dataPoints: historicalData.length,
    forecastPeriod: config.forecastPeriod,
    timestamp: new Date().toISOString(),
  });

  const {
    algorithm,
    forecastPeriod,
    confidenceInterval,
    alpha,
    beta,
    gamma,
    seasonalPeriod,
  } = config;

  const forecast: ForecastPoint[] = [];
  const lastDate = historicalData[historicalData.length - 1].date;
  let lastValue = historicalData[historicalData.length - 1].value;
  let trendValue = 0;
  let seasonal: number[] = [];

  // Run algorithm
  switch (algorithm) {
    case 'holt-winters': {
      const result = holtWinters(historicalData, alpha, beta, gamma, seasonalPeriod);
      lastValue = result.level[result.level.length - 1];
      trendValue = result.trend[result.trend.length - 1];
      seasonal = result.seasonal;
      break;
    }

    case 'double-exponential': {
      const result = doubleExponentialSmoothing(historicalData, alpha, beta);
      lastValue = result.level[result.level.length - 1];
      trendValue = result.trend[result.trend.length - 1];
      break;
    }

    case 'simple-exponential': {
      const smoothed = simpleExponentialSmoothing(historicalData, alpha);
      lastValue = smoothed[smoothed.length - 1];
      trendValue = 0;
      break;
    }

    case 'moving-average': {
      const window = Math.min(7, Math.floor(historicalData.length / 4));
      const ma = movingAverage(historicalData, window);
      lastValue = ma[ma.length - 1];
      // Calculate simple trend from last few points
      const recentData = historicalData.slice(-window);
      const { slope } = linearRegression(recentData);
      trendValue = slope;
      break;
    }

    case 'linear-regression': {
      const { slope, intercept } = linearRegression(historicalData);
      lastValue = slope * (historicalData.length - 1) + intercept;
      trendValue = slope;
      break;
    }
  }

  // Calculate standard deviation for confidence intervals
  const values = historicalData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Calculate z-score for any confidence level with linear interpolation
  const getZScore = (confidence: number): number => {
    // Lookup table of confidence levels and their z-scores
    const zTable: [number, number][] = [
      [1, 0.013],
      [5, 0.063],
      [10, 0.126],
      [20, 0.253],
      [30, 0.385],
      [40, 0.524],
      [50, 0.674],
      [60, 0.842],
      [70, 1.036],
      [80, 1.282],
      [85, 1.440],
      [90, 1.645],
      [95, 1.96],
      [99, 2.576],
      [99.9, 3.291],
    ];

    // Find the two points to interpolate between
    for (let i = 0; i < zTable.length - 1; i++) {
      const [c1, z1] = zTable[i];
      const [c2, z2] = zTable[i + 1];

      if (confidence >= c1 && confidence <= c2) {
        // Linear interpolation
        const t = (confidence - c1) / (c2 - c1);
        return z1 + t * (z2 - z1);
      }
    }

    // Edge cases
    if (confidence < zTable[0][0]) return zTable[0][1];
    return zTable[zTable.length - 1][1];
  };

  const zScore = getZScore(confidenceInterval);

  // Generate forecast
  for (let i = 1; i <= forecastPeriod; i++) {
    const date = addDays(lastDate, i);
    let value = lastValue + trendValue * i;

    // Apply seasonality for Holt-Winters
    if (algorithm === 'holt-winters' && seasonal.length > 0) {
      const seasonalIndex = (historicalData.length - seasonalPeriod + ((i - 1) % seasonalPeriod)) % seasonal.length;
      value *= seasonal[seasonalIndex];
    }

    // Ensure non-negative
    value = Math.max(0, value);

    // Calculate confidence bounds (expanding with forecast horizon)
    const errorMargin = zScore * stdDev * Math.sqrt(i);
    const upperBound = value + errorMargin;
    const lowerBound = Math.max(0, value - errorMargin);

    forecast.push({
      date,
      value: Math.round(value),
      upperBound: Math.round(upperBound),
      lowerBound: Math.round(lowerBound),
      isForecast: true,
    });
  }

  return forecast;
}

// Optimize parameters
export function optimizeForecastParameters(
  historicalData: DataPoint[],
  config: ForecastConfig
): { optimizedConfig: ForecastConfig; metrics: { rmse: number; mae: number; mape: number } } {
  const splitPoint = Math.floor(historicalData.length * 0.8);
  const trainData = historicalData.slice(0, splitPoint);
  const testData = historicalData.slice(splitPoint);

  let bestConfig = { ...config };
  let bestRMSE = Infinity;
  let bestMetrics = { rmse: Infinity, mae: Infinity, mape: Infinity };

  // Grid search for best parameters
  const alphaValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const betaValues = [0.1, 0.2, 0.3, 0.4, 0.5];
  const gammaValues = [0.1, 0.2, 0.3, 0.4, 0.5];

  for (const alpha of alphaValues) {
    for (const beta of betaValues) {
      for (const gamma of gammaValues) {
        const testConfig = { ...config, alpha, beta, gamma, forecastPeriod: testData.length };
        const forecast = forecastTimeSeries(trainData, testConfig);

        const actual = testData.map(d => d.value);
        const predicted = forecast.map(f => f.value);
        const metrics = calculateErrorMetrics(actual, predicted);

        if (metrics.rmse < bestRMSE) {
          bestRMSE = metrics.rmse;
          bestConfig = { ...config, alpha, beta, gamma };
          bestMetrics = metrics;
        }
      }
    }
  }

  return { optimizedConfig: bestConfig, metrics: bestMetrics };
}

// Calculate R² (coefficient of determination)
export function calculateR2(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  const mean = actual.reduce((a, b) => a + b, 0) / n;

  let ssTotal = 0;
  let ssResidual = 0;

  for (let i = 0; i < n; i++) {
    ssTotal += Math.pow(actual[i] - mean, 2);
    ssResidual += Math.pow(actual[i] - predicted[i], 2);
  }

  return 1 - (ssResidual / ssTotal);
}

export function calculateMetrics(
  historicalData: DataPoint[],
  config: ForecastConfig
) {
  console.log('[METRICS] calculateMetrics called', {
    totalDataPoints: historicalData.length,
    algorithm: config.algorithm,
    timestamp: new Date().toISOString(),
  });

  // Split data: use last 20% as test set
  const splitPoint = Math.floor(historicalData.length * 0.8);
  const trainData = historicalData.slice(0, splitPoint);
  const testData = historicalData.slice(splitPoint);

  // Generate forecast for test period
  const testConfig = { ...config, forecastPeriod: testData.length };
  const testForecast = forecastTimeSeries(trainData, testConfig);

  // Calculate error metrics
  const actual = testData.map(d => d.value);
  const predicted = testForecast.map(f => f.value);
  const { rmse, mae, mape } = calculateErrorMetrics(actual, predicted);

  // Calculate R²
  const r2Score = calculateR2(actual, predicted);

  // Calculate accuracy (100% - MAPE)
  const accuracy = Math.max(0, 100 - mape);

  // Determine quality rating
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  if (mape < 5) quality = 'excellent';
  else if (mape < 10) quality = 'good';
  else if (mape < 20) quality = 'fair';
  else quality = 'poor';

  return {
    rmse: Math.round(rmse * 10) / 10,
    mae: Math.round(mae * 10) / 10,
    mape: Math.round(mape * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    r2Score: Math.round(r2Score * 1000) / 1000,
    quality,
  };
}
