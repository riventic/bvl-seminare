export interface DataPoint {
  date: Date;
  value: number;
}

export interface ForecastPoint extends DataPoint {
  upperBound?: number;
  lowerBound?: number;
  isForecast?: boolean;
}

export type ForecastAlgorithm = 'holt-winters' | 'double-exponential' | 'simple-exponential' | 'moving-average' | 'linear-regression';

export interface ForecastConfig {
  algorithm: ForecastAlgorithm;
  forecastPeriod: number;
  historicalDays: number;
  confidenceInterval: number;
  alpha: number; // Level smoothing (formerly smoothingFactor)
  beta: number; // Trend smoothing
  gamma: number; // Seasonal smoothing
  seasonalPeriod: number; // Days in seasonal cycle (7 for weekly, 30 for monthly)
}

export interface Metrics {
  rmse: number; // Root Mean Square Error
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  accuracy: number; // 100% - MAPE
  r2Score: number; // R-squared (coefficient of determination)
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}
