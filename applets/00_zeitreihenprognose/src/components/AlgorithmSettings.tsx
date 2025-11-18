import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { RotateCcw, Zap, Info } from 'lucide-react';
import type { ForecastConfig, ForecastAlgorithm } from '../types';
import { colors } from '../theme/colors';

interface AlgorithmSettingsProps {
  config: ForecastConfig;
  onChange: (config: ForecastConfig) => void;
  onReset: () => void;
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
  tooltip?: string;
}

function InlineSlider({ label, value, unit, min, max, step, onChange, tooltip }: InlineSliderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.gray[700], fontSize: 13, whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ p: 0.25 }}>
              <Info size={14} color={colors.gray[400]} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
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

export default function AlgorithmSettings({
  config,
  onChange,
  onReset,
  onOptimize,
  isOptimizing,
  optimizationProgress = 0,
}: AlgorithmSettingsProps) {
  const { t } = useTranslation();

  const handleChange = (key: keyof ForecastConfig, value: number | boolean | ForecastAlgorithm) => {
    onChange({ ...config, [key]: value });
  };

  const showAlpha = config.algorithm === 'holt-winters' || config.algorithm === 'double-exponential' || config.algorithm === 'simple-exponential';
  const showBeta = config.algorithm === 'holt-winters' || config.algorithm === 'double-exponential';
  const showGamma = config.algorithm === 'holt-winters';
  const showSeasonalPeriod = config.algorithm === 'holt-winters';
  const canOptimize = config.algorithm !== 'moving-average' && config.algorithm !== 'linear-regression';

  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        {/* Header Row with Title and Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600, color: colors.gray[700] }}>
            {t('controls.algorithmSettings')}
          </Typography>
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
              startIcon={isOptimizing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Zap size={16} />}
              onClick={onOptimize}
              disabled={isOptimizing || !canOptimize}
              sx={{
                backgroundColor: colors.success[500],
                fontSize: 13,
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  backgroundColor: canOptimize ? colors.success[600] : undefined,
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

        {/* Algorithm Selector Row */}
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: colors.gray[700] }}>
              {t('controls.algorithm')}:
            </Typography>
            <Tooltip title={t('tooltips.algorithm')} arrow placement="top">
              <IconButton size="small" sx={{ p: 0.25 }}>
                <Info size={14} color={colors.gray[400]} />
              </IconButton>
            </Tooltip>
          </Box>
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

        {/* Parameters Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, mb: 1.5 }}>
          <InlineSlider
            label={t('controls.confidenceInterval')}
            value={config.confidenceInterval}
            unit="%"
            min={1}
            max={99}
            step={1}
            onChange={(val) => handleChange('confidenceInterval', val)}
            tooltip={t('tooltips.confidenceInterval')}
          />

          {showAlpha && (
            <InlineSlider
              label={t('controls.alpha')}
              value={parseFloat(config.alpha.toFixed(2))}
              unit=""
              min={0.1}
              max={0.9}
              step={0.02}
              onChange={(val) => handleChange('alpha', val)}
              tooltip={t('tooltips.alpha')}
            />
          )}

          {showBeta && (
            <InlineSlider
              label={t('controls.beta')}
              value={parseFloat(config.beta.toFixed(2))}
              unit=""
              min={0.1}
              max={0.9}
              step={0.02}
              onChange={(val) => handleChange('beta', val)}
              tooltip={t('tooltips.beta')}
            />
          )}

          {showGamma && (
            <InlineSlider
              label={t('controls.gamma')}
              value={parseFloat(config.gamma.toFixed(2))}
              unit=""
              min={0.1}
              max={0.9}
              step={0.02}
              onChange={(val) => handleChange('gamma', val)}
              tooltip={t('tooltips.gamma')}
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
              tooltip={t('tooltips.seasonalPeriod')}
            />
          )}
        </Box>

      </CardContent>
    </Card>
  );
}
