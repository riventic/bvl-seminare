import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Tooltip as MuiTooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { RotateCcw, RefreshCw, Download, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MultiProductConfig } from '../types';

interface ControlPanelProps {
  config: MultiProductConfig;
  onChange: (config: MultiProductConfig) => void;
  onReset: () => void;
  onRegenerate: () => void;
  onExport: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  selectedScenario: string;
  onScenarioChange: (scenario: string) => void;
}

export default function ControlPanel({
  config,
  onChange,
  onReset,
  onRegenerate,
  onExport,
  onOptimize,
  isOptimizing,
  selectedScenario,
  onScenarioChange
}: ControlPanelProps) {
  const { t } = useTranslation();

  const InlineSlider = ({ label, value, onChange, min, max, step = 1, unit, tooltip, maxDecimals = 0 }: any) => {
    const formatValue = (val: number) => {
      if (maxDecimals === 0) return Math.round(val).toString();
      // Format with max decimals but remove trailing zeros
      return Number(val.toFixed(maxDecimals)).toString();
    };

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <MuiTooltip
            title={tooltip || ''}
            arrow
            placement="top"
            enterDelay={300}
            leaveDelay={200}
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: 400,
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  p: 1.5
                }
              }
            }}
          >
            <Typography variant="body2" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'text.secondary' }}>
              {label}
            </Typography>
          </MuiTooltip>
          <Typography variant="body2" fontWeight="600">
            {formatValue(value)} {unit}
          </Typography>
        </Box>
        <Slider
          value={value}
          onChange={(_, newValue) => onChange(newValue as number)}
          min={min}
          max={max}
          step={step}
          size="small"
        />
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Scenario Selector */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('controls.scenario')}</InputLabel>
            <Select
              value={selectedScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              label={t('controls.scenario')}
            >
              <MenuItem value="stable">
                <Box>
                  <Typography variant="body2" fontWeight="600">{t('scenarios.stable')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('scenarios.stableDesc')}</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="growth">
                <Box>
                  <Typography variant="body2" fontWeight="600">{t('scenarios.growth')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('scenarios.growthDesc')}</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="seasonal">
                <Box>
                  <Typography variant="body2" fontWeight="600">{t('scenarios.seasonal')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('scenarios.seasonalDesc')}</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="substitute">
                <Box>
                  <Typography variant="body2" fontWeight="600">{t('scenarios.substitute')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('scenarios.substituteDesc')}</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {/* Basic Settings */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              {t('controls.basicSettings')}
            </Typography>

            <InlineSlider
              label={t('controls.numberOfProducts')}
              value={config.numberOfProducts}
              onChange={(value: number) => onChange({ ...config, numberOfProducts: value })}
              min={2}
              max={20}
              unit={t('controls.numberOfProductsUnit')}
              tooltip={t('tooltips.numberOfProducts')}
            />

            <InlineSlider
              label={t('controls.forecastHorizon')}
              value={config.forecastHorizon}
              onChange={(value: number) => onChange({ ...config, forecastHorizon: value })}
              min={7}
              max={60}
              unit={t('controls.forecastHorizonUnit')}
              tooltip={t('tooltips.forecastHorizon')}
            />

            <InlineSlider
              label={t('controls.historicalDays')}
              value={config.historicalDays}
              onChange={(value: number) => onChange({ ...config, historicalDays: value })}
              min={30}
              max={365}
              unit={t('controls.historicalDaysUnit')}
              tooltip={t('tooltips.historicalDays')}
            />

            <InlineSlider
              label={t('controls.confidenceInterval')}
              value={config.confidenceInterval}
              onChange={(value: number) => onChange({ ...config, confidenceInterval: value })}
              min={0.8}
              max={0.99}
              step={0.01}
              unit="%"
              tooltip={t('tooltips.confidenceInterval')}
              maxDecimals={2}
            />
          </Box>

          {/* Analysis Settings */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              {t('controls.analysisSettings')}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={config.enableCorrelationAnalysis}
                  onChange={(e) =>
                    onChange({ ...config, enableCorrelationAnalysis: e.target.checked })
                  }
                />
              }
              label={
                <MuiTooltip
                  title={t('tooltips.correlationAnalysis')}
                  arrow
                  enterDelay={300}
                  leaveDelay={200}
                  slotProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 400,
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        p: 1.5
                      }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'text.secondary' }}>
                    {t('controls.correlationAnalysis')}
                  </Typography>
                </MuiTooltip>
              }
              sx={{ mb: 1, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.enableCrossSelling}
                  onChange={(e) => onChange({ ...config, enableCrossSelling: e.target.checked })}
                />
              }
              label={
                <MuiTooltip
                  title={t('tooltips.crossSelling')}
                  arrow
                  enterDelay={300}
                  leaveDelay={200}
                  slotProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 400,
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        p: 1.5
                      }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'text.secondary' }}>
                    {t('controls.crossSelling')}
                  </Typography>
                </MuiTooltip>
              }
              sx={{ mb: 1, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.enableCannibalization}
                  onChange={(e) => onChange({ ...config, enableCannibalization: e.target.checked })}
                />
              }
              label={
                <MuiTooltip
                  title={t('tooltips.cannibalization')}
                  arrow
                  enterDelay={300}
                  leaveDelay={200}
                  slotProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 400,
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        p: 1.5
                      }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'text.secondary' }}>
                    {t('controls.cannibalization')}
                  </Typography>
                </MuiTooltip>
              }
              sx={{ mb: 2, display: 'block' }}
            />

            <InlineSlider
              label={t('controls.minCorrelation')}
              value={config.minCorrelation}
              onChange={(value: number) => onChange({ ...config, minCorrelation: value })}
              min={0.1}
              max={0.9}
              step={0.1}
              unit=""
              tooltip={t('tooltips.minCorrelation')}
              maxDecimals={2}
            />
          </Box>

          {/* Smoothing Parameters */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              {t('controls.smoothingSettings')}
            </Typography>

            <InlineSlider
              label={t('controls.alpha')}
              value={config.alpha}
              onChange={(value: number) => onChange({ ...config, alpha: value })}
              min={0.1}
              max={0.9}
              step={0.1}
              unit=""
              tooltip={t('tooltips.alpha')}
              maxDecimals={2}
            />

            <InlineSlider
              label={t('controls.beta')}
              value={config.beta}
              onChange={(value: number) => onChange({ ...config, beta: value })}
              min={0.1}
              max={0.9}
              step={0.1}
              unit=""
              tooltip={t('tooltips.beta')}
              maxDecimals={2}
            />

            <InlineSlider
              label={t('controls.gamma')}
              value={config.gamma}
              onChange={(value: number) => onChange({ ...config, gamma: value })}
              min={0.1}
              max={0.9}
              step={0.1}
              unit=""
              tooltip={t('tooltips.gamma')}
              maxDecimals={2}
            />

            <InlineSlider
              label={t('controls.seasonalPeriod')}
              value={config.seasonalPeriod}
              onChange={(value: number) => onChange({ ...config, seasonalPeriod: value })}
              min={7}
              max={30}
              unit={t('controls.seasonalPeriodUnit')}
              tooltip={t('tooltips.seasonalPeriod')}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={16} />}
            onClick={onReset}
            size="small"
          >
            {t('controls.reset')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={onRegenerate}
            size="small"
            disabled={isOptimizing}
          >
            {t('controls.regenerate')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Zap size={16} />}
            onClick={onOptimize}
            size="small"
            disabled={isOptimizing}
          >
            {isOptimizing ? t('controls.optimizing') : t('controls.optimize')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            onClick={onExport}
            size="small"
            disabled={isOptimizing}
          >
            {t('controls.exportExcel')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
