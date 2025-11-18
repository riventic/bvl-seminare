import type { Product, MultiProductDataPoint } from '../types';

const PRODUCT_NAMES = [
  'Laptop Pro',
  'Monitor Ultra',
  'Tastatur Plus',
  'Maus Premium',
  'Headset Deluxe',
  'Webcam HD',
  'Docking Station',
  'USB-C Hub',
  'Externes SSD',
  'Notebook Tasche',
  'Laptop Stand',
  'Kabellos Ladegerät',
  'Bluetooth Speaker',
  'Grafiktablett',
  'Presenter Remote',
  'HDMI Kabel',
  'Netzwerk Switch',
  'Router Pro',
  'Powerbank',
  'Smartwatch'
];

const COLOR_PALETTE = [
  '#6C5FC7', // Purple
  '#FF6B35', // Orange
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange-Red
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#A855F7', // Purple-Light
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#D97706', // Yellow
  '#DC2626', // Red-Dark
  '#7C3AED'  // Violet-Dark
];

/**
 * Generate product metadata
 */
export function generateProducts(count: number): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    products.push({
      id: `product_${i + 1}`,
      name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      category: 'Elektronik'
    });
  }
  return products;
}

/**
 * Cholesky decomposition to generate correlated random numbers
 * This creates a lower triangular matrix L such that LL^T = correlation matrix
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
 * Generate a target correlation matrix with some structure
 * - Products close in index have higher correlation (simulate categories)
 * - Some products are negatively correlated (substitutes)
 * - Some products are highly correlated (complements)
 */
function generateTargetCorrelationMatrix(numProducts: number): number[][] {
  const matrix: number[][] = Array(numProducts).fill(0).map(() => Array(numProducts).fill(0));

  for (let i = 0; i < numProducts; i++) {
    for (let j = 0; j < numProducts; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        // Distance-based correlation (products closer in list are more correlated)
        const distance = Math.abs(i - j);
        let correlation = 0;

        if (distance === 1) {
          // Adjacent products have moderate positive correlation (e.g., laptop + mouse)
          correlation = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
        } else if (distance === 2) {
          // Nearby products have weak positive correlation
          correlation = 0.1 + Math.random() * 0.3; // 0.1 to 0.4
        } else if (distance === numProducts - 1 || distance === numProducts - 2) {
          // Products far apart might be substitutes (negative correlation)
          correlation = -0.2 - Math.random() * 0.3; // -0.2 to -0.5
        } else {
          // Distant products have weak or no correlation
          correlation = -0.1 + Math.random() * 0.2; // -0.1 to 0.1
        }

        matrix[i][j] = correlation;
        matrix[j][i] = correlation; // Symmetric matrix
      }
    }
  }

  // Ensure matrix is positive semi-definite (for valid correlations)
  // In practice, we might need to adjust, but for demo purposes this works
  return matrix;
}

/**
 * Generate normal random numbers using Box-Muller transform
 */
function normalRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Generate correlated time series using Cholesky decomposition
 */
function generateCorrelatedTimeSeries(
  numPoints: number,
  numProducts: number,
  correlationMatrix: number[][]
): number[][] {
  // Cholesky decomposition
  const L = choleskyDecomposition(correlationMatrix);

  // Generate independent normal random variables
  const timeSeries: number[][] = Array(numPoints).fill(0).map(() => Array(numProducts).fill(0));

  for (let t = 0; t < numPoints; t++) {
    const independent = Array(numProducts).fill(0).map(() => normalRandom());

    // Transform to correlated variables: y = L * x
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
 * Add trend, seasonality, and scale to correlated random series
 */
function addPatterns(
  correlatedSeries: number[][],
  products: Product[],
  historicalDays: number
): number[][] {
  const numProducts = products.length;
  const processedSeries: number[][] = [];

  for (let t = 0; t < historicalDays; t++) {
    const dayValues: number[] = [];

    for (let i = 0; i < numProducts; i++) {
      // Base demand (different for each product, wider spread)
      const baseDemand = 30 + i * 15;

      // Trend (some products trending up, some down)
      const trendFactor = i % 3 === 0 ? 0.05 : i % 3 === 1 ? -0.02 : 0;
      const trend = trendFactor * t;

      // Seasonality (weekly pattern)
      const dayOfWeek = t % 7;
      const seasonality = dayOfWeek === 5 || dayOfWeek === 6 ? 15 : -5; // Weekend spike

      // Monthly pattern
      const dayOfMonth = t % 30;
      const monthlyPattern = Math.sin((dayOfMonth / 30) * 2 * Math.PI) * 10;

      // Random component (from correlated series) - REDUCED for smoother lines
      const randomComponent = correlatedSeries[t][i] * 5;

      // Combine all components
      let demand = baseDemand + trend + seasonality + monthlyPattern + randomComponent;

      // Ensure non-negative
      demand = Math.max(0, demand);

      dayValues.push(Math.round(demand));
    }

    processedSeries.push(dayValues);
  }

  return processedSeries;
}

/**
 * Generate multi-product historical data with correlation structure
 */
export function generateMultiProductData(
  products: Product[],
  historicalDays: number
): MultiProductDataPoint[] {
  const numProducts = products.length;

  // Generate target correlation matrix
  const correlationMatrix = generateTargetCorrelationMatrix(numProducts);

  // Generate correlated random time series
  const correlatedSeries = generateCorrelatedTimeSeries(historicalDays, numProducts, correlationMatrix);

  // Add realistic patterns (trend, seasonality, scaling)
  const processedSeries = addPatterns(correlatedSeries, products, historicalDays);

  // Convert to MultiProductDataPoint format
  const data: MultiProductDataPoint[] = [];
  const today = new Date();

  for (let t = 0; t < historicalDays; t++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (historicalDays - t));

    const values: { [productId: string]: number } = {};
    products.forEach((product, i) => {
      values[product.id] = processedSeries[t][i];
    });

    data.push({ date, values });
  }

  return data;
}
