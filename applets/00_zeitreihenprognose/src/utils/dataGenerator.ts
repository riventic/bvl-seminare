import { subDays } from 'date-fns';
import type { DataPoint } from '../types';

export type DatasetType = 'random' | 'ecommerce' | 'industrial' | 'startup' | 'restaurant' | 'retail-promo' | 'logistics' | 'seasonal' | 'declining' | 'chaotic';

// Original random dataset with mixed patterns
export function generateRandomData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 1000;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);

    // Add trend (slight upward)
    const trendValue = baseValue + (days - i) * 2;

    // Add seasonality (weekly pattern)
    const dayOfWeek = date.getDay();
    const seasonalFactor = 1 + Math.sin((dayOfWeek / 7) * Math.PI * 2) * 0.2;

    // Add random noise
    const noise = (Math.random() - 0.5) * 200;

    const value = Math.max(0, Math.round(trendValue * seasonalFactor + noise));

    data.push({ date, value });
  }

  return data;
}

// E-Commerce: Strong weekly seasonality + growth trend + holiday spikes
export function generateEcommerceData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 800;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();

    // Growth trend (20% increase over the period)
    const growthFactor = 1 + (days - i) / days * 0.2;
    const trendValue = baseValue * growthFactor;

    // Strong weekly seasonality (weekends are high, Monday low)
    let seasonalFactor = 1.0;
    if (dayOfWeek === 0) seasonalFactor = 1.4; // Sunday peak
    else if (dayOfWeek === 6) seasonalFactor = 1.3; // Saturday peak
    else if (dayOfWeek === 1) seasonalFactor = 0.7; // Monday dip
    else seasonalFactor = 0.9 + Math.random() * 0.2;

    // Simulate holiday spikes every ~30 days
    const daysSinceStart = days - i;
    if (daysSinceStart % 30 < 3) {
      seasonalFactor *= 1.5; // Holiday spike
    }

    // Medium noise
    const noise = (Math.random() - 0.5) * 150;

    const value = Math.max(0, Math.round(trendValue * seasonalFactor + noise));
    data.push({ date, value });
  }

  return data;
}

// Industrial Supply: Very stable, minimal variation, no seasonality
export function generateIndustrialData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 50;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);

    // Almost no trend (very slight upward drift)
    const trendValue = baseValue + (days - i) * 0.01;

    // Minimal noise (very stable)
    const noise = (Math.random() - 0.5) * 3;

    const value = Math.max(0, Math.round(trendValue + noise));
    data.push({ date, value });
  }

  return data;
}

// Startup Growth: Strong exponential growth, no seasonality
export function generateStartupData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const initialValue = 200;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);

    // Exponential growth (doubles every ~120 days)
    const daysSinceStart = days - i;
    const growthRate = 0.0058; // ~0.58% daily growth
    const trendValue = initialValue * Math.exp(growthRate * daysSinceStart);

    // Medium-high noise
    const noise = (Math.random() - 0.5) * trendValue * 0.15;

    const value = Math.max(0, Math.round(trendValue + noise));
    data.push({ date, value });
  }

  return data;
}

// Restaurant: Strong weekday pattern, lunch/dinner represented as daily aggregates
export function generateRestaurantData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 300;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();

    // Weekday pattern (high Fri-Sat, medium weekdays, low Sun-Mon)
    let seasonalFactor = 1.0;
    if (dayOfWeek === 5) seasonalFactor = 1.5; // Friday
    else if (dayOfWeek === 6) seasonalFactor = 1.6; // Saturday peak
    else if (dayOfWeek === 0) seasonalFactor = 0.6; // Sunday low
    else if (dayOfWeek === 1) seasonalFactor = 0.7; // Monday low
    else seasonalFactor = 1.0; // Tue-Thu steady

    // Small upward trend
    const trendValue = baseValue + (days - i) * 0.3;

    // Medium noise
    const noise = (Math.random() - 0.5) * 60;

    const value = Math.max(0, Math.round(trendValue * seasonalFactor + noise));
    data.push({ date, value });
  }

  return data;
}

// Retail with Promotions: Regular demand with periodic promotional spikes
export function generateRetailPromoData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 500;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const daysSinceStart = days - i;

    // Stable baseline
    let value = baseValue;

    // Promotional spikes every 14-21 days (2-3 weeks)
    const cyclePosition = daysSinceStart % 18;
    if (cyclePosition >= 0 && cyclePosition <= 3) {
      // 4-day promotion
      value *= 2.5; // 150% increase during promo
    }

    // Small random variation
    const noise = (Math.random() - 0.5) * 80;

    value = Math.max(0, Math.round(value + noise));
    data.push({ date, value });
  }

  return data;
}

// Logistics/Shipping: Strong weekday pattern, almost zero on weekends
export function generateLogisticsData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 850;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();

    // Business days only pattern
    let seasonalFactor = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      seasonalFactor = 0.05; // Almost zero on weekends
    } else if (dayOfWeek === 1) {
      seasonalFactor = 1.3; // Monday high (weekend backlog)
    } else if (dayOfWeek === 5) {
      seasonalFactor = 1.1; // Friday slightly high
    } else {
      seasonalFactor = 1.0; // Normal Tue-Thu
    }

    // Slight upward trend
    const trendValue = baseValue + (days - i) * 0.5;

    // Low noise (predictable)
    const noise = (Math.random() - 0.5) * 50;

    const value = Math.max(0, Math.round(trendValue * seasonalFactor + noise));
    data.push({ date, value });
  }

  return data;
}

// Seasonal Product: Strong annual pattern (requires 365+ days to see pattern)
export function generateSeasonalData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 600;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    // Summer product: peak in June-August (days 150-240)
    const seasonalFactor = 0.5 + 0.5 * Math.sin(((dayOfYear - 80) / 365) * Math.PI * 2);

    // Small trend
    const trendValue = baseValue + (days - i) * 0.2;

    // Medium noise
    const noise = (Math.random() - 0.5) * 100;

    const value = Math.max(0, Math.round(trendValue * seasonalFactor + noise));
    data.push({ date, value });
  }

  return data;
}

// Declining Market: Negative trend, product in decline
export function generateDecliningData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const initialValue = 1500;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const daysSinceStart = days - i;

    // Steady decline (20% reduction over period)
    const declineFactor = 1 - (daysSinceStart / days) * 0.2;
    const trendValue = initialValue * declineFactor;

    // Medium noise
    const noise = (Math.random() - 0.5) * 120;

    const value = Math.max(0, Math.round(trendValue + noise));
    data.push({ date, value });
  }

  return data;
}

// Chaotic/Erratic: High noise, unpredictable
export function generateChaoticData(days: number): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();
  const baseValue = 700;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);

    // Almost no pattern, mostly noise
    const trendValue = baseValue + (Math.random() - 0.5) * 400;

    // Random spikes
    const spike = Math.random() > 0.9 ? Math.random() * 500 : 0;

    // Very high noise
    const noise = (Math.random() - 0.5) * 300;

    const value = Math.max(0, Math.round(trendValue + spike + noise));
    data.push({ date, value });
  }

  return data;
}

// Main function with dataset selection
export function generateHistoricalData(days: number, type: DatasetType = 'random'): DataPoint[] {
  switch (type) {
    case 'ecommerce':
      return generateEcommerceData(days);
    case 'industrial':
      return generateIndustrialData(days);
    case 'startup':
      return generateStartupData(days);
    case 'restaurant':
      return generateRestaurantData(days);
    case 'retail-promo':
      return generateRetailPromoData(days);
    case 'logistics':
      return generateLogisticsData(days);
    case 'seasonal':
      return generateSeasonalData(days);
    case 'declining':
      return generateDecliningData(days);
    case 'chaotic':
      return generateChaoticData(days);
    default:
      return generateRandomData(days);
  }
}

export function calculateMovingAverage(data: DataPoint[], window: number): number[] {
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
