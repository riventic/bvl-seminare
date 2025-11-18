import { addDays } from 'date-fns';
import type {
  Product,
  MultiProductDataPoint,
  MultiProductForecastPoint,
  MultiProductConfig,
  CorrelationMatrix
} from '../types';
import { calculateCorrelationMatrix } from './correlationAnalysis';
import { nelderMead } from './nelderMead';

// Calculate error metrics
export function calculateErrorMetrics(
  actual: number[],
  predicted: number[]
): { mape: number; mae: number; rmse: number } {
  const n = Math.min(actual.length, predicted.length);
  let sumAbsoluteError = 0;
  let sumPercentageError = 0;
  let sumSquaredError = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    const absError = Math.abs(error);

    sumAbsoluteError += absError;
    sumSquaredError += error * error;

    // For MAPE, avoid division by zero
    if (actual[i] !== 0) {
      sumPercentageError += (absError / Math.abs(actual[i])) * 100;
    }
  }

  const mae = sumAbsoluteError / n;
  const mape = sumPercentageError / n;
  const rmse = Math.sqrt(sumSquaredError / n);

  return { mape, mae, rmse };
}

// Holt-Winters for a single product time series
function holtWintersForProduct(
  values: number[],
  alpha: number,
  beta: number,
  gamma: number,
  seasonalPeriod: number
): { level: number[]; trend: number[]; seasonal: number[] } {
  const n = values.length;
  const level: number[] = [];
  const trend: number[] = [];
  const seasonal: number[] = new Array(n).fill(0);

  // Initialize seasonal components
  const avgFirstPeriod = values.slice(0, seasonalPeriod).reduce((sum, v) => sum + v, 0) / seasonalPeriod;
  for (let i = 0; i < seasonalPeriod; i++) {
    seasonal[i] = values[i] / (avgFirstPeriod || 1);
  }

  // Initialize level and trend
  level[0] = values[0];
  trend[0] = (values[seasonalPeriod] - values[0]) / seasonalPeriod;

  // Holt-Winters equations
  for (let i = 1; i < n; i++) {
    const prevLevel = level[i - 1];
    const prevTrend = trend[i - 1];
    const seasonalIndex = i - seasonalPeriod >= 0 ? i - seasonalPeriod : i;

    const newLevel = alpha * (values[i] / seasonal[seasonalIndex]) + (1 - alpha) * (prevLevel + prevTrend);
    const newTrend = beta * (newLevel - prevLevel) + (1 - beta) * prevTrend;
    const newSeasonal = gamma * (values[i] / newLevel) + (1 - gamma) * seasonal[seasonalIndex];

    level.push(newLevel);
    trend.push(newTrend);
    seasonal[i] = newSeasonal;
  }

  return { level, trend, seasonal };
}

// Generate forecast for single product
function forecastSingleProduct(
  values: number[],
  periods: number,
  alpha: number,
  beta: number,
  gamma: number,
  seasonalPeriod: number
): number[] {
  const { level, trend, seasonal } = holtWintersForProduct(values, alpha, beta, gamma, seasonalPeriod);

  const lastLevel = level[level.length - 1];
  const lastTrend = trend[trend.length - 1];
  const forecast: number[] = [];

  for (let i = 1; i <= periods; i++) {
    const seasonalIndex = (values.length - seasonalPeriod + (i - 1)) % seasonalPeriod;
    const seasonalComponent = seasonal[seasonalIndex] || 1;
    const forecastValue = (lastLevel + i * lastTrend) * seasonalComponent;
    forecast.push(Math.max(0, forecastValue));
  }

  return forecast;
}

// Calculate confidence intervals based on historical volatility
function calculateConfidenceIntervals(
  historicalValues: number[],
  forecastValues: number[],
  confidenceLevel: number // e.g., 0.95 for 95%
): { upper: number[]; lower: number[] } {
  // Calculate standard deviation of historical data
  const mean = historicalValues.reduce((sum, v) => sum + v, 0) / historicalValues.length;
  const variance = historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);

  // Z-score for confidence level
  const zScore = confidenceLevel === 0.80 ? 1.28 :
                confidenceLevel === 0.90 ? 1.645 :
                confidenceLevel === 0.95 ? 1.96 :
                confidenceLevel === 0.99 ? 2.576 : 1.96;

  const upper: number[] = [];
  const lower: number[] = [];

  forecastValues.forEach((value, i) => {
    // Confidence interval widens over time
    const widening = 1 + (i * 0.05);
    const margin = zScore * stdDev * widening;
    upper.push(value + margin);
    lower.push(Math.max(0, value - margin));
  });

  return { upper, lower };
}

// Adjust forecasts based on correlation matrix
function adjustForecastsWithCorrelation(
  univariateForecasts: { [productId: string]: number[] },
  correlationMatrix: CorrelationMatrix,
  products: Product[]
): { [productId: string]: number[] } {
  const adjustedForecasts: { [productId: string]: number[] } = {};
  const forecastPeriods = Object.values(univariateForecasts)[0].length;

  products.forEach((product, productIndex) => {
    const unadjustedForecast = univariateForecasts[product.id];
    const adjusted: number[] = [];

    for (let t = 0; t < forecastPeriods; t++) {
      let adjustmentFactor = 0;
      let totalWeight = 0;

      // Consider correlation with other products
      products.forEach((otherProduct, otherIndex) => {
        if (product.id !== otherProduct.id) {
          const correlation = correlationMatrix.matrix[productIndex][otherIndex];

          // Only adjust if correlation is significant (> 0.3 or < -0.3)
          if (Math.abs(correlation) > 0.3) {
            const otherForecast = univariateForecasts[otherProduct.id][t];
            const otherBase = univariateForecasts[otherProduct.id][0];
            const otherChange = (otherForecast - otherBase) / (otherBase || 1);

            // Adjustment proportional to correlation and other product's change
            adjustmentFactor += correlation * otherChange * Math.abs(correlation);
            totalWeight += Math.abs(correlation);
          }
        }
      });

      // Apply adjustment (weighted average of unadjusted and correlation-based adjustment)
      let adjustedValue = unadjustedForecast[t];
      if (totalWeight > 0) {
        const correlationAdjustment = (adjustmentFactor / totalWeight) * unadjustedForecast[t];
        adjustedValue = unadjustedForecast[t] + correlationAdjustment * 0.3; // 30% weight to correlation
      }

      adjusted.push(Math.max(0, adjustedValue));
    }

    adjustedForecasts[product.id] = adjusted;
  });

  return adjustedForecasts;
}

/**
 * Main multi-product forecasting function
 */
export function forecastMultiProduct(
  historicalData: MultiProductDataPoint[],
  products: Product[],
  config: MultiProductConfig
): MultiProductForecastPoint[] {
  // Extract time series for each product
  const productTimeSeries: { [productId: string]: number[] } = {};
  products.forEach(product => {
    productTimeSeries[product.id] = historicalData.map(point => point.values[product.id] || 0);
  });

  // Generate univariate forecasts for each product
  const univariateForecasts: { [productId: string]: number[] } = {};
  products.forEach(product => {
    const forecast = forecastSingleProduct(
      productTimeSeries[product.id],
      config.forecastHorizon,
      config.alpha,
      config.beta,
      config.gamma,
      config.seasonalPeriod
    );
    univariateForecasts[product.id] = forecast;
  });

  // Calculate correlation matrix
  const correlationMatrix = calculateCorrelationMatrix(historicalData, products);

  // Adjust forecasts based on correlation (if enabled)
  const finalForecasts = config.enableCorrelationAnalysis
    ? adjustForecastsWithCorrelation(univariateForecasts, correlationMatrix, products)
    : univariateForecasts;

  // Calculate confidence intervals for each product
  const confidenceIntervals: {
    [productId: string]: { upper: number[]; lower: number[] }
  } = {};

  products.forEach(product => {
    confidenceIntervals[product.id] = calculateConfidenceIntervals(
      productTimeSeries[product.id],
      finalForecasts[product.id],
      config.confidenceInterval
    );
  });

  // Create forecast data points
  const forecastData: MultiProductForecastPoint[] = [];
  const lastDate = historicalData[historicalData.length - 1].date;

  for (let i = 0; i < config.forecastHorizon; i++) {
    const forecastDate = addDays(lastDate, i + 1);
    const values: { [productId: string]: number } = {};
    const upperBounds: { [productId: string]: number } = {};
    const lowerBounds: { [productId: string]: number } = {};

    products.forEach(product => {
      values[product.id] = Math.round(finalForecasts[product.id][i]);
      upperBounds[product.id] = Math.round(confidenceIntervals[product.id].upper[i]);
      lowerBounds[product.id] = Math.round(confidenceIntervals[product.id].lower[i]);
    });

    forecastData.push({
      date: forecastDate,
      values,
      upperBounds,
      lowerBounds,
      isForecast: true
    });
  }

  return forecastData;
}

/**
 * Optimize forecast parameters using Nelder-Mead algorithm
 * Minimizes MAPE on test data
 */
export function optimizeForecastParameters(
  historicalData: MultiProductDataPoint[],
  products: Product[],
  currentConfig: MultiProductConfig
): MultiProductConfig {
  // Split data: 80% train, 20% test
  const testSize = Math.floor(historicalData.length * 0.2);
  const trainSize = historicalData.length - testSize;
  const trainData = historicalData.slice(0, trainSize);
  const testData = historicalData.slice(trainSize);

  // Extract test values for each product
  const testValues: { [productId: string]: number[] } = {};
  products.forEach(product => {
    testValues[product.id] = testData.map(point => point.values[product.id] || 0);
  });

  // Objective function: calculate MAPE for given parameters
  const objectiveFunction = (params: number[]): number => {
    const [alpha, beta, gamma, seasonalPeriod] = params;

    // Create temporary config with these parameters
    const testConfig: MultiProductConfig = {
      ...currentConfig,
      alpha,
      beta,
      gamma,
      seasonalPeriod: Math.round(seasonalPeriod),
      forecastHorizon: testSize
    };

    // Generate forecast on training data
    const forecast = forecastMultiProduct(trainData, products, testConfig);

    // Calculate MAPE for each product and average
    let totalMape = 0;
    let count = 0;

    products.forEach(product => {
      const predicted = forecast.map(f => f.values[product.id] || 0);
      const actual = testValues[product.id];
      const metrics = calculateErrorMetrics(actual, predicted);

      if (isFinite(metrics.mape)) {
        totalMape += metrics.mape;
        count++;
      }
    });

    return count > 0 ? totalMape / count : 100; // Return average MAPE
  };

  // Initial parameters and bounds
  const initialParams = [
    currentConfig.alpha,
    currentConfig.beta,
    currentConfig.gamma,
    currentConfig.seasonalPeriod
  ];

  const bounds = {
    min: [0.1, 0.1, 0.1, 7],
    max: [0.9, 0.9, 0.9, 30]
  };

  // Run optimization with random restarts
  const result = nelderMead(objectiveFunction, initialParams, bounds, {
    maxIterations: 100,
    tolerance: 0.01,
    randomRestarts: 15
  });

  // Return optimized config
  return {
    ...currentConfig,
    alpha: result.params[0],
    beta: result.params[1],
    gamma: result.params[2],
    seasonalPeriod: Math.round(result.params[3])
  };
}
