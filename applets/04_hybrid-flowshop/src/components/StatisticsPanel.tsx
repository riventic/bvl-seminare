import { Box, Typography, Card, Grid, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Statistics } from '@/types';
import { colors } from '@/theme';

interface StatisticsPanelProps {
  statistics: Statistics;
}

export default function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('statistics.makespan'),
      value: `${Math.round(statistics.makespan)} ${t('units.minutes')}`,
      color: colors.purple[500],
    },
    {
      label: t('statistics.totalTardiness'),
      value: `${Math.round(statistics.totalTardiness)} ${t('units.minutes')}`,
      color: colors.error[500],
    },
    {
      label: t('statistics.averageTardiness'),
      value: `${statistics.averageTardiness.toFixed(1)} ${t('units.minutes')}`,
      color: colors.warning[500],
    },
    {
      label: t('statistics.setupCount'),
      value: statistics.setupCount.toString(),
      color: colors.info[500],
    },
    {
      label: t('statistics.stage1Utilization'),
      value: `${(statistics.utilization.stage1 * 100).toFixed(1)}${t('units.percent')}`,
      color: colors.success[500],
    },
    {
      label: t('statistics.stage2Utilization'),
      value: `${(statistics.utilization.stage2 * 100).toFixed(1)}${t('units.percent')}`,
      color: colors.success[500],
    },
  ];

  return (
    <Card sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('statistics.title')}
      </Typography>

      <Grid container spacing={1}>
        {stats.map((stat) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={stat.label}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                {stat.label}
              </Typography>
              <Typography variant="body1" sx={{ color: stat.color, fontWeight: 600, fontSize: 18 }}>
                {stat.value}
              </Typography>
            </Box>
          </Grid>
        ))}

        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {t('statistics.completedJobs')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18 }}>
            {statistics.completedJobs} / {statistics.totalJobs}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 8, md: 5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {t('statistics.progress')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label={`${t('statistics.onTimeJobs')}: ${statistics.onTimeJobs}`}
              size="small"
              sx={{ bgcolor: colors.success[100], color: colors.success[700], height: 24 }}
            />
            <Chip
              label={`${t('statistics.lateJobs')}: ${statistics.lateJobs}`}
              size="small"
              sx={{ bgcolor: colors.error[100], color: colors.error[700], height: 24 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
