import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type {
  Product,
  MultiProductDataPoint,
  MultiProductForecastPoint,
  MultiProductConfig,
  MultiProductMetrics,
  CorrelationMatrix,
  ProductRelationship,
  ChartDataPoint,
  ExportData
} from '../types';
import { forecastMultiProduct, calculateErrorMetrics, optimizeForecastParameters } from '../utils/multiProductForecasting';
import { calculateCorrelationMatrix } from '../utils/correlationAnalysis';
import { detectRelationships } from '../utils/relationshipDetection';
import { exportToExcel } from '../utils/excelExport';
import { useDebounce } from '../utils/useDebounce';
import { generateScenario } from '../utils/scenarioGenerator';
import ControlPanel from '../components/ControlPanel';
import MetricsDisplay from '../components/MetricsDisplay';
import MultiProductForecastChart from '../components/MultiProductForecastChart';
import ProductSelector from '../components/ProductSelector';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import RelationshipList from '../components/RelationshipList';

const defaultConfig: MultiProductConfig = {
  numberOfProducts: 5,
  enableCorrelationAnalysis: true,
  forecastHorizon: 14,
  enableCrossSelling: true,
  enableCannibalization: true,
  minCorrelation: 0.5,
  historicalDays: 180,
  confidenceInterval: 0.95,
  alpha: 0.3,
  beta: 0.1,
  gamma: 0.3,
  seasonalPeriod: 7
};

export default function MultiProductForecasting() {
  const { t } = useTranslation();

  const [config, setConfig] = useState<MultiProductConfig>(defaultConfig);
  const [products, setProducts] = useState<Product[]>([]);
  const [historicalData, setHistoricalData] = useState<MultiProductDataPoint[]>([]);
  const [forecastData, setForecastData] = useState<MultiProductForecastPoint[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null);
  const [relationships, setRelationships] = useState<ProductRelationship[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [metrics, setMetrics] = useState<MultiProductMetrics | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('stable');

  const debouncedConfig = useDebounce(config, 300);

  // Generate data when numberOfProducts, historicalDays, or scenario changes
  useEffect(() => {
    const scenarioData = generateScenario(
      selectedScenario,
      debouncedConfig.numberOfProducts,
      debouncedConfig.historicalDays
    );

    const newCorrelationMatrix = calculateCorrelationMatrix(scenarioData.historicalData, scenarioData.products);

    setProducts(scenarioData.products);
    setHistoricalData(scenarioData.historicalData);
    setCorrelationMatrix(newCorrelationMatrix);
    setSelectedProducts(new Set(scenarioData.products.map(p => p.id)));
  }, [debouncedConfig.numberOfProducts, debouncedConfig.historicalDays, selectedScenario]);

  // Run forecast when config or data changes
  useEffect(() => {
    if (historicalData.length === 0 || products.length === 0) return;

    const newForecastData = forecastMultiProduct(historicalData, products, debouncedConfig);
    setForecastData(newForecastData);

    // Calculate metrics
    const totalDemand =
      historicalData.reduce((sum, point) => {
        return sum + Object.values(point.values).reduce((s, v) => s + v, 0);
      }, 0) / historicalData.length;

    const totalForecast = newForecastData.reduce((sum, point) => {
      return sum + Object.values(point.values).reduce((s, v) => s + v, 0);
    }, 0);

    const productMetrics: any = {};
    let totalMape = 0;
    let totalMae = 0;
    let totalRmse = 0;
    let validMetricCount = 0;

    products.forEach(product => {
      const productData = historicalData.map(p => p.values[product.id] || 0);
      const avgDemand = productData.reduce((s, v) => s + v, 0) / productData.length;
      const forecastedDemand = newForecastData.reduce((s, p) => s + (p.values[product.id] || 0), 0);

      // Calculate trend
      const recent = productData.slice(-30);
      const older = productData.slice(-60, -30);
      const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
      const olderAvg = older.reduce((s, v) => s + v, 0) / (older.length || 1);
      const trendDirection =
        recentAvg > olderAvg * 1.05 ? 'increasing' : recentAvg < olderAvg * 0.95 ? 'decreasing' : 'stable';

      // Calculate volatility
      const stdDev = Math.sqrt(
        productData.reduce((s, v) => s + Math.pow(v - avgDemand, 2), 0) / productData.length
      );
      const cv = stdDev / (avgDemand || 1);
      const volatility = cv > 0.3 ? 'high' : cv > 0.15 ? 'medium' : 'low';

      // Calculate error metrics using train/test split
      const testSize = Math.floor(productData.length * 0.2); // 20% for testing
      const trainSize = productData.length - testSize;
      const testData = productData.slice(trainSize);

      // Generate forecast for test period
      const testForecast = forecastMultiProduct(
        historicalData.slice(0, trainSize),
        [product],
        { ...debouncedConfig, forecastHorizon: testSize }
      );

      const testPredictions = testForecast.map(f => f.values[product.id] || 0);
      const errorMetrics = calculateErrorMetrics(testData, testPredictions);

      totalMape += errorMetrics.mape;
      totalMae += errorMetrics.mae;
      totalRmse += errorMetrics.rmse;
      validMetricCount++;

      productMetrics[product.id] = {
        avgDemand,
        forecastedDemand,
        trendDirection,
        volatility,
        mape: errorMetrics.mape,
        mae: errorMetrics.mae,
        rmse: errorMetrics.rmse
      };
    });

    const newRelationships = detectRelationships(
      correlationMatrix!,
      products,
      debouncedConfig.minCorrelation
    );
    setRelationships(newRelationships);

    setMetrics({
      products: productMetrics,
      correlationMatrix: correlationMatrix!,
      relationships: newRelationships,
      totalDemand,
      totalForecast,
      averageMape: validMetricCount > 0 ? totalMape / validMetricCount : undefined,
      averageMae: validMetricCount > 0 ? totalMae / validMetricCount : undefined,
      averageRmse: validMetricCount > 0 ? totalRmse / validMetricCount : undefined
    });
  }, [debouncedConfig, historicalData, products, correlationMatrix]);

  // Combine historical and forecast data for chart
  useEffect(() => {
    if (historicalData.length === 0 || forecastData.length === 0) return;

    const combined: ChartDataPoint[] = [];

    // Add historical data
    historicalData.forEach(point => {
      const chartPoint: ChartDataPoint = {
        date: format(point.date, 'dd.MM', { locale: de }),
        dateObj: point.date
      };

      products.forEach(product => {
        chartPoint[`historical_${product.id}`] = point.values[product.id] || null;
        chartPoint[`forecast_${product.id}`] = null;
      });

      combined.push(chartPoint);
    });

    // Add forecast data
    forecastData.forEach(point => {
      const chartPoint: ChartDataPoint = {
        date: format(point.date, 'dd.MM', { locale: de }),
        dateObj: point.date
      };

      products.forEach(product => {
        chartPoint[`historical_${product.id}`] = null;
        chartPoint[`forecast_${product.id}`] = point.values[product.id] || null;
      });

      combined.push(chartPoint);
    });

    setChartData(combined);
  }, [historicalData, forecastData, products]);

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  const handleRegenerate = () => {
    const scenarioData = generateScenario(
      selectedScenario,
      config.numberOfProducts,
      config.historicalDays
    );
    const newCorrelationMatrix = calculateCorrelationMatrix(scenarioData.historicalData, scenarioData.products);

    setProducts(scenarioData.products);
    setHistoricalData(scenarioData.historicalData);
    setCorrelationMatrix(newCorrelationMatrix);
    setSelectedProducts(new Set(scenarioData.products.map(p => p.id)));
  };

  const handleScenarioChange = (scenario: string) => {
    setSelectedScenario(scenario);
  };

  const handleExport = () => {
    if (!metrics) return;

    const exportData: ExportData = {
      products,
      historicalData,
      forecastData,
      correlationMatrix: correlationMatrix!,
      relationships,
      metrics
    };

    exportToExcel(exportData);
  };

  const handleOptimize = () => {
    if (historicalData.length === 0 || products.length === 0) return;

    setIsOptimizing(true);

    // Run optimization in next tick to allow UI to update
    setTimeout(() => {
      const optimizedConfig = optimizeForecastParameters(historicalData, products, config);
      setConfig(optimizedConfig);
      setIsOptimizing(false);
    }, 100);
  };

  const selectedProductsList = products.filter(p => selectedProducts.has(p.id));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="600">
          {t('app.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('app.subtitle')}
        </Typography>
      </Box>

      <ControlPanel
        config={config}
        onChange={setConfig}
        onReset={handleReset}
        onRegenerate={handleRegenerate}
        onExport={handleExport}
        onOptimize={handleOptimize}
        isOptimizing={isOptimizing}
        selectedScenario={selectedScenario}
        onScenarioChange={handleScenarioChange}
      />

      {metrics && <MetricsDisplay metrics={metrics} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Card>
            <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="h6" gutterBottom>
                {t('chart.title')}
              </Typography>
              <MultiProductForecastChart data={chartData} products={selectedProductsList} />
            </CardContent>
            <ProductSelector
              products={products}
              selectedProducts={selectedProducts}
              onChange={setSelectedProducts}
            />
          </Card>
        </Box>

        <Box>
          <Box sx={{ mb: 3 }}>
            {correlationMatrix && (
              <CorrelationHeatmap correlationMatrix={correlationMatrix} products={products} />
            )}
          </Box>
          <RelationshipList relationships={relationships} products={products} />
        </Box>
      </Box>
    </Container>
  );
}
