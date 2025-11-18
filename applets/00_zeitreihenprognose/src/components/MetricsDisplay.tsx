import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Box, Chip, Tooltip, IconButton } from '@mui/material';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { Metrics } from '../types';
import { colors } from '../theme/colors';

interface MetricsDisplayProps {
  metrics: Metrics;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const { t } = useTranslation();

  const getQualityColor = () => {
    switch (metrics.quality) {
      case 'excellent':
        return colors.success[500];
      case 'good':
        return colors.info[500];
      case 'fair':
        return colors.warning[500];
      default:
        return colors.error[500];
    }
  };

  const getQualityIcon = () => {
    switch (metrics.quality) {
      case 'excellent':
        return <CheckCircle2 size={16} />;
      case 'good':
        return <CheckCircle2 size={16} />;
      case 'fair':
        return <AlertTriangle size={16} />;
      default:
        return <XCircle size={16} />;
    }
  };

  const getAccuracyColor = () => {
    if (metrics.accuracy >= 95) return colors.success[500];
    if (metrics.accuracy >= 90) return colors.info[500];
    if (metrics.accuracy >= 80) return colors.warning[500];
    return colors.error[500];
  };

  const getR2Color = () => {
    if (metrics.r2Score >= 0.9) return colors.success[500];
    if (metrics.r2Score >= 0.7) return colors.info[500];
    if (metrics.r2Score >= 0.5) return colors.warning[500];
    return colors.error[500];
  };

  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600, color: colors.gray[700] }}>
            {t('metrics.title')}
          </Typography>
          <Chip
            icon={getQualityIcon()}
            label={t(`metrics.quality${metrics.quality.charAt(0).toUpperCase() + metrics.quality.slice(1)}`)}
            size="small"
            sx={{
              backgroundColor: getQualityColor(),
              color: '#fff',
              fontWeight: 600,
              height: 24,
              '& .MuiChip-icon': {
                color: '#fff',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
          {/* Accuracy */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {t('metrics.accuracy')}
              </Typography>
              <Tooltip title={t('metricTooltips.accuracy')} arrow placement="top">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Info size={12} color={colors.gray[400]} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ color: getAccuracyColor(), fontWeight: 600, lineHeight: 1.2 }}>
              {metrics.accuracy}%
            </Typography>
          </Box>

          {/* MAPE */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {t('metrics.mapeLabel')}
              </Typography>
              <Tooltip title={t('metricTooltips.mape')} arrow placement="top">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Info size={12} color={colors.gray[400]} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ color: colors.gray[700], fontWeight: 600, lineHeight: 1.2 }}>
              {metrics.mape}%
            </Typography>
          </Box>

          {/* MAE */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {t('metrics.maeLabel')}
              </Typography>
              <Tooltip title={t('metricTooltips.mae')} arrow placement="top">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Info size={12} color={colors.gray[400]} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ color: colors.gray[700], fontWeight: 600, lineHeight: 1.2 }}>
              {Math.round(metrics.mae)}
            </Typography>
          </Box>

          {/* RMSE */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {t('metrics.rmseLabel')}
              </Typography>
              <Tooltip title={t('metricTooltips.rmse')} arrow placement="top">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Info size={12} color={colors.gray[400]} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ color: colors.gray[700], fontWeight: 600, lineHeight: 1.2 }}>
              {Math.round(metrics.rmse)}
            </Typography>
          </Box>

          {/* R² Score */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {t('metrics.r2Label')}
              </Typography>
              <Tooltip title={t('metricTooltips.r2')} arrow placement="top">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Info size={12} color={colors.gray[400]} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ color: getR2Color(), fontWeight: 600, lineHeight: 1.2 }}>
              {metrics.r2Score.toFixed(3)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
