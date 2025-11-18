import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Button,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { RotateCcw, RefreshCw, Zap } from 'lucide-react';
import type { ForecastConfig, ForecastAlgorithm } from '../types';
import { colors } from '../theme/colors';

interface ControlPanelProps {
  config: ForecastConfig;
  onChange: (config: ForecastConfig) => void;
  onReset: () => void;
  onRegenerate: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  optimizationProgress?: number;
}

interface InlineSliderProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function InlineSlider({ label, value, unit, min, max, step, onChange }: InlineSliderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: colors.gray[700], fontSize: 13, minWidth: 100, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 80, maxWidth: 120 }}>
        <Slider
          value={value}
          onChange={(_, val) => onChange(val as number)}
          min={min}
          max={max}
          step={step}
          size="small"
          sx={{
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: colors.purple[500],
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 6px ${colors.purple[100]}`,
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: colors.purple[500],
              border: 'none',
              height: 3,
            },
            '& .MuiSlider-rail': {
              backgroundColor: colors.gray[200],
              height: 3,
            },
          }}
        />
      </Box>
      <Chip
        label={`${value}${unit || ''}`}
        size="small"
        sx={{
          backgroundColor: colors.purple[50],
          color: colors.purple[700],
          fontWeight: 600,
          fontSize: 12,
          height: 22,
          minWidth: 50,
          '& .MuiChip-label': {
            px: 1,
          },
        }}
      />
    </Box>
  );
}

export default function ControlPanel({
  config,
  onChange,
  onReset,
  onRegenerate,
  onOptimize,
  isOptimizing,
  optimizationProgress = 0,
}: ControlPanelProps) {
  const { t } = useTranslation();

  const handleChange = (key: keyof ForecastConfig, value: number | boolean | ForecastAlgorithm) => {
    onChange({ ...config, [key]: value });
  };

  const showBeta = config.algorithm === 'holt-winters' || config.algorithm === 'double-exponential';
  const showGamma = config.algorithm === 'holt-winters';
  const showSeasonalPeriod = config.algorithm === 'holt-winters';

  return (
    <Card>
      <CardContent sx={{ py: 1, px: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, rowGap: 1 }}>
          {/* Algorithm Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: colors.gray[700] }}>
              {t('controls.algorithm')}:
            </Typography>
            <FormControl size="small">
              <Select
                value={config.algorithm}
                onChange={(e) => handleChange('algorithm', e.target.value as ForecastAlgorithm)}
                sx={{
                  fontSize: 13,
                  minWidth: 200,
                  height: 32,
                  '& .MuiSelect-select': {
                    py: 0.5,
                  },
                }}
              >
                <MenuItem value="holt-winters">{t('algorithms.holt-winters')}</MenuItem>
                <MenuItem value="double-exponential">{t('algorithms.double-exponential')}</MenuItem>
                <MenuItem value="simple-exponential">{t('algorithms.simple-exponential')}</MenuItem>
                <MenuItem value="moving-average">{t('algorithms.moving-average')}</MenuItem>
                <MenuItem value="linear-regression">{t('algorithms.linear-regression')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Sliders Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, rowGap: 1 }}>
            <InlineSlider
              label={t('controls.forecastPeriod')}
              value={config.forecastPeriod}
              unit={` ${t('controls.forecastPeriodUnit')}`}
              min={7}
              max={90}
              step={1}
              onChange={(val) => handleChange('forecastPeriod', val)}
            />

            <InlineSlider
              label={t('controls.historicalDays')}
              value={config.historicalDays}
              unit={` ${t('controls.historicalDaysUnit')}`}
              min={90}
              max={730}
              step={30}
              onChange={(val) => handleChange('historicalDays', val)}
            />

            <InlineSlider
              label={t('controls.confidenceInterval')}
              value={config.confidenceInterval}
              unit="%"
              min={80}
              max={99}
              step={1}
              onChange={(val) => handleChange('confidenceInterval', val)}
            />

            <InlineSlider
              label={t('controls.alpha')}
              value={parseFloat(config.alpha.toFixed(1))}
              unit=""
              min={0.1}
              max={0.9}
              step={0.1}
              onChange={(val) => handleChange('alpha', val)}
            />

            {showBeta && (
              <InlineSlider
                label={t('controls.beta')}
                value={parseFloat(config.beta.toFixed(1))}
                unit=""
                min={0.1}
                max={0.9}
                step={0.1}
                onChange={(val) => handleChange('beta', val)}
              />
            )}

            {showGamma && (
              <InlineSlider
                label={t('controls.gamma')}
                value={parseFloat(config.gamma.toFixed(1))}
                unit=""
                min={0.1}
                max={0.9}
                step={0.1}
                onChange={(val) => handleChange('gamma', val)}
              />
            )}

            {showSeasonalPeriod && (
              <InlineSlider
                label={t('controls.seasonalPeriod')}
                value={config.seasonalPeriod}
                unit={` ${t('controls.seasonalPeriodUnit')}`}
                min={2}
                max={30}
                step={1}
                onChange={(val) => handleChange('seasonalPeriod', val)}
              />
            )}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RotateCcw size={16} />}
              onClick={onReset}
              sx={{
                borderColor: colors.gray[300],
                color: colors.gray[700],
                fontSize: 13,
                textTransform: 'none',
                '&:hover': {
                  borderColor: colors.gray[400],
                  backgroundColor: colors.gray[50],
                },
              }}
            >
              {t('controls.reset')}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              onClick={onRegenerate}
              sx={{
                backgroundColor: colors.orange[500],
                fontSize: 13,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colors.orange[600],
                },
              }}
            >
              {t('controls.regenerate')}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={isOptimizing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Zap size={16} />}
              onClick={onOptimize}
              disabled={isOptimizing}
              sx={{
                backgroundColor: colors.success[500],
                fontSize: 13,
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  backgroundColor: colors.success[600],
                },
                '&.Mui-disabled': {
                  backgroundColor: colors.gray[300],
                  color: '#fff',
                },
              }}
            >
              {isOptimizing
                ? `${Math.round(optimizationProgress)}%`
                : t('controls.optimize')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
