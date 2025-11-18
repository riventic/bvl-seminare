/**
 * StatsPanel - Compact statistics display (top-right overlay)
 */
import { Box, Paper, Typography } from '@mui/material';
import { colors, spacing } from '../theme';

interface StatsPanelProps {
  totalDistance: number;
  totalTime: number;
  improvement?: number;
}

export default function StatsPanel({ totalDistance, totalTime, improvement }: StatsPanelProps) {

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: spacing[2],
        right: spacing[2],
        zIndex: 1000,
        px: 2,
        py: 1.5,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.gray[700] }}>
          {totalDistance.toFixed(1)} km
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.gray[700] }}>
          {Math.round(totalTime)} min
        </Typography>
        {improvement !== undefined && improvement !== 0 && (
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: improvement > 0 ? colors.error[600] : colors.success[600] }}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
