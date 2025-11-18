import { Box, Card, CardContent, Typography, Chip, Tooltip } from '@mui/material';
import { Package, TrendingUp, Activity, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MultiProductMetrics } from '../types';
import { colors } from '../theme/colors';

interface MetricsDisplayProps {
  metrics: MultiProductMetrics;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const { t } = useTranslation();

  // Determine accuracy quality
  const getAccuracyColor = (mape?: number) => {
    if (!mape) return colors.gray[100];
    if (mape < 10) return colors.success[100];
    if (mape < 20) return colors.warning[100];
    return colors.error[100];
  };

  const getAccuracyTextColor = (mape?: number) => {
    if (!mape) return colors.gray[700];
    if (mape < 10) return colors.success[700];
    if (mape < 20) return colors.warning[700];
    return colors.error[700];
  };

  const getAccuracyLabel = (mape?: number) => {
    if (!mape) return '';
    if (mape < 10) return t('metrics.accuracyGood');
    if (mape < 20) return t('metrics.accuracyModerate');
    return t('metrics.accuracyPoor');
  };

  const MetricCard = ({ icon: Icon, label, value, unit, chip }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: colors.purple[100],
              color: colors.purple[600],
              display: 'flex'
            }}
          >
            <Icon size={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {value}
              {unit && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {unit}
                </Typography>
              )}
            </Typography>
            {chip && <Box sx={{ mt: 1 }}>{chip}</Box>}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        <MetricCard
          icon={Package}
          label={t('metrics.totalDemand')}
          value={Number(metrics.totalDemand.toFixed(2))}
          unit={t('metrics.totalDemandUnit')}
        />

        <MetricCard
          icon={TrendingUp}
          label={t('metrics.totalForecast')}
          value={Number(metrics.totalForecast.toFixed(2))}
          unit={t('metrics.totalForecastUnit')}
        />

        <MetricCard
          icon={Activity}
          label={t('metrics.topProducts')}
          value={Object.keys(metrics.products).length}
          chip={
            <Typography variant="caption" color="text.secondary">
              {metrics.relationships.length} {t('metrics.relationships')}
            </Typography>
          }
        />

        {/* Forecast Accuracy Card */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: colors.purple[100],
                  color: colors.purple[600],
                  display: 'flex'
                }}
              >
                <Target size={20} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Tooltip title={t('tooltips.mape')} arrow placement="top" enterDelay={300}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, cursor: 'help', borderBottom: '1px dotted', borderColor: 'text.secondary', width: 'fit-content' }}>
                    {t('metrics.accuracy')}
                  </Typography>
                </Tooltip>
                {metrics.averageMape !== undefined ? (
                  <>
                    <Typography variant="h6" fontWeight="600">
                      ±{metrics.averageMape.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={getAccuracyLabel(metrics.averageMape)}
                        size="small"
                        sx={{
                          bgcolor: getAccuracyColor(metrics.averageMape),
                          color: getAccuracyTextColor(metrics.averageMape),
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Tooltip title={t('tooltips.mae')} arrow placement="top" enterDelay={300}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, cursor: 'help' }}>
                          {t('metrics.mae')}: ±{metrics.averageMae?.toFixed(1)}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Wird berechnet...
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
