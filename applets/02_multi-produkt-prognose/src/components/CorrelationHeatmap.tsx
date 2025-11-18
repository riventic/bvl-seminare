import { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CorrelationMatrix, Product } from '../types';
import { colors } from '../theme/colors';

interface CorrelationHeatmapProps {
  correlationMatrix: CorrelationMatrix;
  products: Product[];
}

/**
 * Get color for correlation value
 * Red (negative) -> White (0) -> Green (positive)
 */
function getCorrelationColor(correlation: number): string {
  const absCorr = Math.abs(correlation);

  if (correlation < 0) {
    // Negative correlation: white to red
    const intensity = absCorr;
    return `rgb(${255}, ${255 * (1 - intensity * 0.7)}, ${255 * (1 - intensity * 0.7)})`;
  } else {
    // Positive correlation: white to green
    return `rgb(${255 * (1 - correlation * 0.7)}, ${255}, ${255 * (1 - correlation * 0.7)})`;
  }
}

export default function CorrelationHeatmap({ correlationMatrix, products }: CorrelationHeatmapProps) {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const cellSize = 40;
  const labelWidth = 120;
  const labelHeight = 80; // Increased for rotated labels
  const n = products.length;

  const svgWidth = labelWidth + n * cellSize + 20;
  const svgHeight = labelHeight + n * cellSize + 20;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('correlation.title')}
        </Typography>

        <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600 }}>
          <svg width={svgWidth} height={svgHeight}>
            {/* Column labels (top) */}
            {products.map((product, i) => (
              <text
                key={`col-label-${i}`}
                x={labelWidth + i * cellSize + cellSize / 2}
                y={labelHeight - 5}
                textAnchor="start"
                fontSize="10"
                fill={colors.gray[700]}
                transform={`rotate(-45, ${labelWidth + i * cellSize + cellSize / 2}, ${labelHeight - 5})`}
              >
                {product.name}
              </text>
            ))}

            {/* Row labels (left) */}
            {products.map((product, i) => (
              <text
                key={`row-label-${i}`}
                x={labelWidth - 5}
                y={labelHeight + i * cellSize + cellSize / 2 + 4}
                textAnchor="end"
                fontSize="9"
                fill={colors.gray[700]}
              >
                {product.name}
              </text>
            ))}

            {/* Heatmap cells */}
            {correlationMatrix.matrix.map((row, i) =>
              row.map((correlation, j) => {
                const isHovered = hoveredCell?.row === i && hoveredCell?.col === j;

                return (
                  <g key={`cell-${i}-${j}`}>
                    <rect
                      x={labelWidth + j * cellSize}
                      y={labelHeight + i * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={getCorrelationColor(correlation)}
                      stroke={isHovered ? colors.purple[500] : colors.gray[300]}
                      strokeWidth={isHovered ? 2 : 0.5}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />

                    {/* Show correlation value */}
                    <text
                      x={labelWidth + j * cellSize + cellSize / 2}
                      y={labelHeight + i * cellSize + cellSize / 2 + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={Math.abs(correlation) > 0.5 ? colors.gray[50] : colors.gray[700]}
                      pointerEvents="none"
                    >
                      {correlation.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </Box>

        {/* Tooltip for hovered cell - fixed height to prevent jumping */}
        <Box sx={{ mt: 2, p: 1, bgcolor: colors.gray[50], borderRadius: 1, minHeight: 80 }}>
          {hoveredCell ? (
            <>
              <Typography variant="body2" fontWeight="600">
                {products[hoveredCell.row].name} ↔ {products[hoveredCell.col].name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('correlation.coefficient')}: {correlationMatrix.matrix[hoveredCell.row][hoveredCell.col].toFixed(3)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.abs(correlationMatrix.matrix[hoveredCell.row][hoveredCell.col]) >= 0.7
                  ? t('correlation.strong')
                  : Math.abs(correlationMatrix.matrix[hoveredCell.row][hoveredCell.col]) >= 0.4
                  ? t('correlation.moderate')
                  : t('correlation.weak')}
                {' '}
                {correlationMatrix.matrix[hoveredCell.row][hoveredCell.col] > 0
                  ? t('correlation.positive')
                  : t('correlation.negative')}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Bewegen Sie die Maus über eine Zelle für Details
            </Typography>
          )}
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: 'rgb(255, 200, 200)', border: `1px solid ${colors.gray[300]}` }} />
            <Typography variant="caption">-1.0</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: 'rgb(255, 255, 255)', border: `1px solid ${colors.gray[300]}` }} />
            <Typography variant="caption">0.0</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: 'rgb(200, 255, 200)', border: `1px solid ${colors.gray[300]}` }} />
            <Typography variant="caption">+1.0</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
