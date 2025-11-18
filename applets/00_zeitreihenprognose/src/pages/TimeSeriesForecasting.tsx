import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import ForecastChart from '../components/ForecastChart';
import DataSettings from '../components/DataSettings';
import AlgorithmSettings from '../components/AlgorithmSettings';
import MetricsDisplay from '../components/MetricsDisplay';
import { generateHistoricalData, type DatasetType } from '../utils/dataGenerator';
import { forecastTimeSeries, calculateMetrics } from '../utils/forecasting';
import { importData } from '../utils/dataImport';
import { exportToCSV, exportToExcel } from '../utils/dataExport';
import type { ForecastConfig, ForecastPoint, DataPoint } from '../types';
import { useDebounce } from '../utils/useDebounce';

const defaultConfig: ForecastConfig = {
  algorithm: 'holt-winters' as const,
  forecastPeriod: 30,
  historicalDays: 365,
  confidenceInterval: 95,
  alpha: 0.3,
  beta: 0.1,
  gamma: 0.1,
  seasonalPeriod: 7,
};

export default function TimeSeriesForecasting() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ForecastConfig>(defaultConfig);
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [chartData, setChartData] = useState<ForecastPoint[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [showForecast, setShowForecast] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('random');

  // Debounce config changes to prevent expensive calculations on every slider movement
  const debouncedConfig = useDebounce(config, 300);

  // Regenerate historical data
  const handleRegenerate = () => {
    const data = generateHistoricalData(config.historicalDays, selectedDataset);
    setHistoricalData(data);
  };

  // Handle dataset change
  const handleDatasetChange = (dataset: DatasetType) => {
    setSelectedDataset(dataset);
    const data = generateHistoricalData(config.historicalDays, dataset);
    setHistoricalData(data);
  };

  // Reset to default config
  const handleReset = () => {
    setConfig(defaultConfig);
  };

  // Import data from file
  const handleImport = async (file: File) => {
    const result = await importData(file);

    if (result.success && result.data) {
      setHistoricalData(result.data);
      // Update historicalDays to match imported data length
      setConfig({ ...config, historicalDays: result.data.length });
      setSnackbar({
        open: true,
        message: `${result.data.length} Datenpunkte erfolgreich importiert`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Import fehlgeschlagen',
        severity: 'error',
      });
    }
  };

  // Export data
  const handleExport = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      exportToCSV(historicalData, forecastData);
    } else {
      exportToExcel(historicalData, forecastData);
    }
    setSnackbar({
      open: true,
      message: 'Daten erfolgreich exportiert',
      severity: 'success',
    });
  };

  // Optimize parameters using Web Worker
  const handleOptimize = () => {
    if (historicalData.length === 0) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Create Web Worker
    const worker = new Worker(new URL('../workers/optimizationWorker.ts', import.meta.url), {
      type: 'module',
    });

    // Send data to worker
    worker.postMessage({
      historicalData,
      config,
    });

    // Listen for messages from worker
    worker.onmessage = (event) => {
      if (event.data.type === 'progress') {
        const progress = (event.data.current / event.data.total) * 100;
        setOptimizationProgress(progress);
      } else if (event.data.type === 'complete') {
        setConfig(event.data.result.optimizedConfig);
        setIsOptimizing(false);
        setOptimizationProgress(0);
        worker.terminate();
      }
    };

    // Handle worker errors
    worker.onerror = (error) => {
      console.error('Optimization worker error:', error);
      setIsOptimizing(false);
      setOptimizationProgress(0);
      worker.terminate();
    };
  };

  // Effect 1: Generate historical data when historicalDays or dataset changes (debounced)
  useEffect(() => {
    const data = generateHistoricalData(debouncedConfig.historicalDays, selectedDataset);
    setHistoricalData(data);
  }, [debouncedConfig.historicalDays, selectedDataset]);

  // Effect 2: Run forecast when debounced config or historical data changes
  useEffect(() => {
    if (historicalData.length === 0) return;

    const forecast = forecastTimeSeries(historicalData, debouncedConfig);
    setForecastData(forecast);

    // Combine historical and forecast for chart
    const combined: ForecastPoint[] = [
      ...historicalData.map(d => ({ ...d, isForecast: false })),
      ...forecast,
    ];
    setChartData(combined);
  }, [debouncedConfig, historicalData]);

  const metrics = useMemo(() => {
    if (historicalData.length === 0) {
      return {
        rmse: 0,
        mae: 0,
        mape: 0,
        accuracy: 0,
        r2Score: 0,
        quality: 'poor' as const,
      };
    }
    return calculateMetrics(historicalData, debouncedConfig);
  }, [historicalData, debouncedConfig]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h3" gutterBottom>
          {t('app.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('app.subtitle')}
        </Typography>
      </Box>

      {/* Data Settings */}
      <Box sx={{ mb: 2 }}>
        <DataSettings
          config={config}
          onChange={setConfig}
          onRegenerate={handleRegenerate}
          onImport={handleImport}
          onExport={handleExport}
          selectedDataset={selectedDataset}
          onDatasetChange={handleDatasetChange}
        />
      </Box>

      {/* Algorithm Settings */}
      <Box sx={{ mb: 2 }}>
        <AlgorithmSettings
          config={config}
          onChange={setConfig}
          onReset={handleReset}
          onOptimize={handleOptimize}
          isOptimizing={isOptimizing}
          optimizationProgress={optimizationProgress}
        />
      </Box>

      {/* Metrics and Chart - Full Width */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MetricsDisplay metrics={metrics} />
        <ForecastChart
          data={chartData}
          showForecast={showForecast}
          showConfidence={showConfidence}
          onToggleForecast={setShowForecast}
          onToggleConfidence={setShowConfidence}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
