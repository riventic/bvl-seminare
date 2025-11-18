import type { Product, MultiProductDataPoint } from '../types';
import { generateProducts } from './multiProductDataGenerator';

/**
 * Cholesky decomposition (from multiProductDataGenerator.ts)
 */
function choleskyDecomposition(correlationMatrix: number[][]): number[][] {
  const n = correlationMatrix.length;
  const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(correlationMatrix[i][i] - sum, 0.0001));
      } else {
        L[i][j] = (correlationMatrix[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

/**
 * Generate normal random numbers
 */
function normalRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Generate target correlation matrix based on pattern
 */
function generateTargetCorrelationMatrix(
  numProducts: number,
  pattern: 'mixed' | 'positive' | 'negative' | 'seasonal'
): number[][] {
  const matrix: number[][] = Array(numProducts).fill(0).map(() => Array(numProducts).fill(0));

  for (let i = 0; i < numProducts; i++) {
    for (let j = 0; j < numProducts; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const distance = Math.abs(i - j);

        switch (pattern) {
          case 'positive':
            if (distance === 1) matrix[i][j] = 0.6 + Math.random() * 0.3;
            else if (distance === 2) matrix[i][j] = 0.3 + Math.random() * 0.3;
            else matrix[i][j] = 0.05 + Math.random() * 0.15;
            break;

          case 'negative':
            if (distance === 1) matrix[i][j] = -0.7 - Math.random() * 0.2;
            else if (distance === 2) matrix[i][j] = -0.4 - Math.random() * 0.2;
            else matrix[i][j] = -0.05 - Math.random() * 0.15;
            break;

          case 'seasonal':
            const sameGroup = Math.floor(i / 3) === Math.floor(j / 3);
            matrix[i][j] = sameGroup ? 0.5 + Math.random() * 0.3 : -0.05 + Math.random() * 0.1;
            break;

          case 'mixed':
          default:
            if (distance === 1) matrix[i][j] = 0.2 + Math.random() * 0.5;
            else if (distance === 2) matrix[i][j] = -0.1 + Math.random() * 0.3;
            else if (distance >= 5) matrix[i][j] = -0.5 - Math.random() * 0.3;
            else matrix[i][j] = -0.05 + Math.random() * 0.1;
            break;
        }

        matrix[j][i] = matrix[i][j]; // Symmetric
      }
    }
  }

  return matrix;
}

/**
 * Generate correlated time series using Cholesky decomposition
 */
function generateCorrelatedTimeSeries(
  numPoints: number,
  numProducts: number,
  correlationMatrix: number[][]
): number[][] {
  const L = choleskyDecomposition(correlationMatrix);
  const timeSeries: number[][] = Array(numPoints).fill(0).map(() => Array(numProducts).fill(0));

  for (let t = 0; t < numPoints; t++) {
    const independent = Array(numProducts).fill(0).map(() => normalRandom());

    for (let i = 0; i < numProducts; i++) {
      let correlated = 0;
      for (let j = 0; j <= i; j++) {
        correlated += L[i][j] * independent[j];
      }
      timeSeries[t][i] = correlated;
    }
  }

  return timeSeries;
}

/**
 * Generate custom time series with specific correlation pattern
 */
function generateCustomTimeSeries(
  numPoints: number,
  numProducts: number,
  config: {
    baseDemand: (i: number) => number;
    trendFactor: (i: number) => number;
    seasonalityStrength: number;
    monthlyStrength: number;
    randomStrength: number;
    correlationPattern: 'mixed' | 'positive' | 'negative' | 'seasonal';
  }
): number[][] {
  // Generate correlation matrix
  const correlationMatrix = generateTargetCorrelationMatrix(numProducts, config.correlationPattern);

  // Generate correlated random series
  const correlatedSeries = generateCorrelatedTimeSeries(numPoints, numProducts, correlationMatrix);

  const processedSeries: number[][] = [];

  for (let t = 0; t < numPoints; t++) {
    const dayValues: number[] = [];

    for (let i = 0; i < numProducts; i++) {
      const baseDemand = config.baseDemand(i);
      const trend = config.trendFactor(i) * t;

      // Weekly seasonality
      const dayOfWeek = t % 7;
      const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6) ? config.seasonalityStrength : -config.seasonalityStrength / 2;

      // Monthly pattern
      const dayOfMonth = t % 30;
      const monthlyPattern = Math.sin((dayOfMonth / 30) * 2 * Math.PI) * config.monthlyStrength;

      // Correlated random component
      const randomComponent = correlatedSeries[t][i] * config.randomStrength;

      let demand = baseDemand + trend + weekendBoost + monthlyPattern + randomComponent;
      demand = Math.max(5, demand);

      dayValues.push(Math.round(demand));
    }

    processedSeries.push(dayValues);
  }

  return processedSeries;
}

/**
 * Scenario 1: Stable Demand (Default)
 */
export function generateStableScenario(
  numProducts: number,
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  const products = generateProducts(numProducts);

  const timeSeries = generateCustomTimeSeries(historicalDays, numProducts, {
    baseDemand: (i) => 30 + i * 15,
    trendFactor: (i) => i % 3 === 0 ? 0.05 : i % 3 === 1 ? -0.02 : 0,
    seasonalityStrength: 15,
    monthlyStrength: 10,
    randomStrength: 5,
    correlationPattern: 'mixed'
  });

  return convertToMultiProductData(products, timeSeries, historicalDays);
}

/**
 * Scenario 2: Growth Market
 */
export function generateGrowthScenario(
  numProducts: number,
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  const products = generateProducts(numProducts);

  const timeSeries = generateCustomTimeSeries(historicalDays, numProducts, {
    baseDemand: (i) => 50 + i * 20,
    trendFactor: () => 0.08 + Math.random() * 0.04, // Strong growth 8-12%
    seasonalityStrength: 10, // Lower seasonality
    monthlyStrength: 5,
    randomStrength: 8, // Higher volatility
    correlationPattern: 'positive'
  });

  return convertToMultiProductData(products, timeSeries, historicalDays);
}

/**
 * Scenario 3: Seasonal Business
 */
export function generateSeasonalScenario(
  numProducts: number,
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  const products = generateProducts(numProducts);

  const timeSeries = generateCustomTimeSeries(historicalDays, numProducts, {
    baseDemand: (i) => 20 + i * 10,
    trendFactor: () => 0.02, // Slight growth
    seasonalityStrength: 30, // Very strong weekend effect
    monthlyStrength: 25, // Strong monthly cycles
    randomStrength: 4,
    correlationPattern: 'seasonal'
  });

  return convertToMultiProductData(products, timeSeries, historicalDays);
}

/**
 * Scenario 4: Substitute Products (Cannibalization)
 */
export function generateSubstituteScenario(
  numProducts: number,
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  const products = generateProducts(numProducts);

  const timeSeries = generateCustomTimeSeries(historicalDays, numProducts, {
    baseDemand: (i) => 60 + (i % 2) * 20, // Alternating base levels
    trendFactor: (i) => i % 2 === 0 ? 0.03 : -0.03, // Opposing trends
    seasonalityStrength: 8,
    monthlyStrength: 5,
    randomStrength: 3, // Low volatility
    correlationPattern: 'negative'
  });

  return convertToMultiProductData(products, timeSeries, historicalDays);
}

/**
 * Convert time series matrix to MultiProductDataPoint format
 */
function convertToMultiProductData(
  products: Product[],
  timeSeries: number[][],
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  const data: MultiProductDataPoint[] = [];
  const today = new Date();

  for (let t = 0; t < historicalDays; t++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (historicalDays - t));

    const values: { [productId: string]: number } = {};
    products.forEach((product, i) => {
      values[product.id] = timeSeries[t][i];
    });

    data.push({ date, values });
  }

  return { products, historicalData: data };
}

/**
 * Generate scenario based on type
 */
export function generateScenario(
  scenarioType: string,
  numProducts: number,
  historicalDays: number
): { products: Product[]; historicalData: MultiProductDataPoint[] } {
  switch (scenarioType) {
    case 'growth':
      return generateGrowthScenario(numProducts, historicalDays);
    case 'seasonal':
      return generateSeasonalScenario(numProducts, historicalDays);
    case 'substitute':
      return generateSubstituteScenario(numProducts, historicalDays);
    case 'stable':
    default:
      return generateStableScenario(numProducts, historicalDays);
  }
}
