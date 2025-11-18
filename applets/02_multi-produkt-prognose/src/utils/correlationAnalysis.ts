import type { MultiProductDataPoint, CorrelationMatrix, Product } from '../types';

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function getPearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Calculate correlation matrix for all products
 */
export function calculateCorrelationMatrix(
  data: MultiProductDataPoint[],
  products: Product[]
): CorrelationMatrix {
  const productIds = products.map(p => p.id);
  const n = productIds.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  // Extract time series for each product
  const timeSeries: { [productId: string]: number[] } = {};
  productIds.forEach(productId => {
    timeSeries[productId] = data.map(point => point.values[productId] || 0);
  });

  // Calculate correlation for each pair
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0; // Perfect correlation with self
      } else {
        const correlation = getPearsonCorrelation(
          timeSeries[productIds[i]],
          timeSeries[productIds[j]]
        );
        matrix[i][j] = correlation;
      }
    }
  }

  return {
    productIds,
    matrix
  };
}

/**
 * Calculate covariance matrix (useful for VAR models)
 */
export function calculateCovarianceMatrix(
  data: MultiProductDataPoint[],
  products: Product[]
): number[][] {
  const productIds = products.map(p => p.id);
  const n = productIds.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  // Extract time series and calculate means
  const timeSeries: { [productId: string]: number[] } = {};
  const means: { [productId: string]: number } = {};

  productIds.forEach(productId => {
    const series = data.map(point => point.values[productId] || 0);
    timeSeries[productId] = series;
    means[productId] = series.reduce((sum, val) => sum + val, 0) / series.length;
  });

  // Calculate covariance for each pair
  const numPoints = data.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let covariance = 0;
      const seriesI = timeSeries[productIds[i]];
      const seriesJ = timeSeries[productIds[j]];
      const meanI = means[productIds[i]];
      const meanJ = means[productIds[j]];

      for (let t = 0; t < numPoints; t++) {
        covariance += (seriesI[t] - meanI) * (seriesJ[t] - meanJ);
      }

      matrix[i][j] = covariance / (numPoints - 1);
    }
  }

  return matrix;
}

/**
 * Get correlation between two specific products
 */
export function getProductCorrelation(
  correlationMatrix: CorrelationMatrix,
  productIdA: string,
  productIdB: string
): number {
  const indexA = correlationMatrix.productIds.indexOf(productIdA);
  const indexB = correlationMatrix.productIds.indexOf(productIdB);

  if (indexA === -1 || indexB === -1) {
    return 0;
  }

  return correlationMatrix.matrix[indexA][indexB];
}
