// Multi-Product Forecasting Type Definitions

export interface Product {
  id: string;
  name: string;
  color: string; // For chart differentiation
  category?: string;
}

export interface DataPoint {
  date: Date;
  value: number;
}

export interface MultiProductDataPoint {
  date: Date;
  values: { [productId: string]: number };
}

export interface MultiProductForecastPoint extends MultiProductDataPoint {
  upperBounds?: { [productId: string]: number };
  lowerBounds?: { [productId: string]: number };
  isForecast?: boolean;
}

export interface CorrelationMatrix {
  productIds: string[];
  matrix: number[][]; // Correlation coefficients [-1, 1]
}

export type RelationshipType = 'complementary' | 'substitute' | 'neutral';
export type RelationshipStrength = 'weak' | 'moderate' | 'strong';

export interface ProductRelationship {
  productA: string;
  productB: string;
  correlation: number;
  type: RelationshipType;
  strength: RelationshipStrength;
}

export interface ProductMetrics {
  avgDemand: number;
  forecastedDemand: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  volatility: 'low' | 'medium' | 'high';
  mape?: number;
  mae?: number;
  rmse?: number;
}

export interface MultiProductMetrics {
  products: {
    [productId: string]: ProductMetrics;
  };
  correlationMatrix: CorrelationMatrix;
  relationships: ProductRelationship[];
  totalDemand: number;
  totalForecast: number;
  averageMape?: number;
  averageMae?: number;
  averageRmse?: number;
}

export interface MultiProductConfig {
  numberOfProducts: number;
  enableCorrelationAnalysis: boolean;
  forecastHorizon: number;
  enableCrossSelling: boolean;
  enableCannibalization: boolean;
  minCorrelation: number;
  historicalDays: number;
  confidenceInterval: number;
  // Smoothing parameters
  alpha: number;
  beta: number;
  gamma: number;
  seasonalPeriod: number;
}

// Chart data format for Recharts
export interface ChartDataPoint {
  date: string;
  dateObj: Date;
  [key: string]: any; // Dynamic keys for each product (historical_productId, forecast_productId)
}

// Export data structure
export interface ExportData {
  products: Product[];
  historicalData: MultiProductDataPoint[];
  forecastData: MultiProductForecastPoint[];
  correlationMatrix: CorrelationMatrix;
  relationships: ProductRelationship[];
  metrics: MultiProductMetrics;
}
