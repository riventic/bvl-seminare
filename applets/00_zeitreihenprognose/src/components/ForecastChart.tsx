import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, Typography, Box, Switch } from '@mui/material';
import type { ForecastPoint } from '../types';
import { colors } from '../theme/colors';

interface ForecastChartProps {
  data: ForecastPoint[];
  showForecast: boolean;
  showConfidence: boolean;
  onToggleForecast: (show: boolean) => void;
  onToggleConfidence: (show: boolean) => void;
}

export default function ForecastChart({
  data,
  showForecast,
  showConfidence,
  onToggleForecast,
  onToggleConfidence,
}: ForecastChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return data.map(point => ({
      date: format(point.date, 'dd.MM.', { locale: de }),
      fullDate: format(point.date, 'dd.MM.yyyy', { locale: de }),
      value: point.isForecast ? null : point.value,
      forecast: point.isForecast ? point.value : null,
      // Only show confidence bounds for forecast points
      confidenceUpper: point.isForecast ? point.upperBound : null,
      confidenceLower: point.isForecast ? point.lowerBound : null,
      // Calculate the range for proper area fill
      confidenceRange: point.isForecast && point.upperBound && point.lowerBound
        ? point.upperBound - point.lowerBound
        : null,
    }));
  }, [data]);


  return (
    <Card>
      <CardContent sx={{ py: 2, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('chart.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: 12, color: colors.gray[600] }}>
                {t('chart.showForecast')}
              </Typography>
              <Switch
                checked={showForecast}
                onChange={(e) => onToggleForecast(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: colors.orange[500],
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: colors.orange[500],
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: 12, color: colors.gray[600] }}>
                {t('chart.showConfidence')}
              </Typography>
              <Switch
                checked={showConfidence}
                onChange={(e) => onToggleConfidence(e.target.checked)}
                size="small"
                disabled={!showForecast}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: colors.purple[500],
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: colors.purple[500],
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke={colors.gray[400]}
              />
              <YAxis
                label={{
                  value: t('chart.yAxisLabel'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
                tick={{ fontSize: 12 }}
                stroke={colors.gray[400]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: 6,
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
                formatter={(value: any, name: string) => {
                  // Don't show null values
                  if (value === null || value === undefined) return [null, null];
                  // Return formatted value and name
                  return [Math.round(value as number), name];
                }}
              />
              <Legend />

              {/* Confidence interval - filled area between upper and lower bounds */}
              {showForecast && showConfidence && (
                <>
                  {/* Stack transparent area to lowerBound to lift the baseline */}
                  <Area
                    type="monotone"
                    dataKey="confidenceLower"
                    stackId="conf"
                    stroke="none"
                    fill="transparent"
                    isAnimationActive={false}
                    legendType="none"
                  />
                  {/* Stack the range on top to create fill-between effect */}
                  <Area
                    type="monotone"
                    dataKey="confidenceRange"
                    stackId="conf"
                    stroke="none"
                    fill={colors.orange[300]}
                    fillOpacity={0.25}
                    isAnimationActive={false}
                    legendType="none"
                  />
                </>
              )}

              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.purple[500]}
                strokeWidth={2}
                dot={{ fill: colors.purple[500], r: 3 }}
                name={t('chart.historical')}
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* Forecast line */}
              {showForecast && (
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={colors.orange[500]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: colors.orange[500], r: 3 }}
                  name={t('chart.forecast')}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
