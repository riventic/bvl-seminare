import { Typography, Box } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { Product, ChartDataPoint } from '../types';
import { colors } from '../theme/colors';

interface MultiProductForecastChartProps {
  data: ChartDataPoint[];
  products: Product[];
}

export default function MultiProductForecastChart({ data, products }: MultiProductForecastChartProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[100]} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => value}
        />
        <YAxis
          label={{ value: t('chart.yAxisLabel'), angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;

            const dateObj = payload[0]?.payload?.dateObj;
            // Filter to only show non-null values
            const validEntries = payload.filter((entry: any) => entry.value !== null);

            if (validEntries.length === 0) return null;

            return (
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 1.5,
                  border: '1px solid',
                  borderColor: colors.gray[200],
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  maxWidth: 250
                }}
              >
                <Typography variant="caption" fontWeight="600" display="block" sx={{ mb: 1 }}>
                  {dateObj ? format(dateObj, 'dd. MMM yyyy', { locale: de }) : ''}
                </Typography>
                {validEntries.slice(0, 5).map((entry: any, index: number) => {
                  const isForecast = entry.dataKey?.includes('forecast');
                  return (
                    <Typography
                      key={index}
                      variant="caption"
                      display="block"
                      sx={{ color: entry.color }}
                    >
                      {entry.name.replace(` (${t('chart.historical')})`, '').replace(` (${t('chart.forecast')})`, '')}: {Number(entry.value.toFixed(2))}
                      {isForecast && ' (Prognose)'}
                    </Typography>
                  );
                })}
                {validEntries.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    +{validEntries.length - 5} weitere
                  </Typography>
                )}
              </Box>
            );
          }}
        />

        {/* Historical lines (solid) for each product */}
        {products.map(product => (
          <Line
            key={`historical_${product.id}`}
            dataKey={`historical_${product.id}`}
            stroke={product.color}
            strokeWidth={2}
            strokeOpacity={0.8}
            dot={false}
            connectNulls
          />
        ))}

        {/* Forecast lines (dashed) for each product */}
        {products.map(product => (
          <Line
            key={`forecast_${product.id}`}
            dataKey={`forecast_${product.id}`}
            stroke={product.color}
            strokeWidth={2}
            strokeOpacity={0.8}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
