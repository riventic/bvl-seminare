import { useMemo } from 'react';
import { Box } from '@mui/material';
import type { ScheduledJob, Job } from '@/types';
import { colors } from '@/theme';

interface GanttChartSVGProps {
  scheduledJobs: ScheduledJob[];
  jobs: Job[];
  makespan: number;
}

const MARGIN_LEFT = 100;
const MARGIN_TOP = 60;
const MARGIN_RIGHT = 40;
const ROW_HEIGHT = 50;
const ROW_SPACING = 10;
const MIN_PIXELS_PER_MINUTE = 2;

export default function GanttChartSVG({ scheduledJobs, makespan }: GanttChartSVGProps) {
  const pixelsPerMinute = MIN_PIXELS_PER_MINUTE;
  const chartWidth = makespan * pixelsPerMinute;
  const stageWidth = MARGIN_LEFT + chartWidth + MARGIN_RIGHT;
  const chartHeight = MARGIN_TOP + 9 * (ROW_HEIGHT + ROW_SPACING) + 60; // More space for legend

  const timeToX = (time: number) => MARGIN_LEFT + time * pixelsPerMinute;
  const machineToY = (machineId: number, stage: number) => {
    if (stage === 1) {
      return MARGIN_TOP + (machineId - 1) * (ROW_HEIGHT + ROW_SPACING);
    } else {
      return MARGIN_TOP + (4 + machineId - 5) * (ROW_HEIGHT + ROW_SPACING);
    }
  };

  const getJobColor = (family: number) => {
    return colors.familyColors[family % colors.familyColors.length];
  };

  // Time ticks - limit to 15
  const timeTicks = useMemo(() => {
    const maxTicks = 15;
    const timeInterval = Math.ceil(makespan / maxTicks / 10) * 10;
    const ticks: number[] = [];
    for (let t = 0; t <= makespan; t += timeInterval) {
      ticks.push(t);
      if (ticks.length >= maxTicks) break;
    }
    return ticks;
  }, [makespan]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        bgcolor: colors.gray[50],
      }}
    >
      <svg width={stageWidth} height={chartHeight} style={{ display: 'block' }}>
        {/* Background */}
        <rect x={0} y={0} width={stageWidth} height={chartHeight} fill={colors.gray[50]} />

        {/* Machine rows - Stage 1 */}
        {[1, 2, 3, 4].map((machineId) => (
          <g key={`stage1-m${machineId}`}>
            <rect
              x={MARGIN_LEFT}
              y={machineToY(machineId, 1)}
              width={chartWidth}
              height={ROW_HEIGHT}
              fill="white"
              stroke={colors.gray[200]}
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 10}
              y={machineToY(machineId, 1) + ROW_HEIGHT / 2 + 5}
              textAnchor="end"
              fontSize={12}
              fill={colors.gray[600]}
            >
              SMD{machineId}
            </text>
          </g>
        ))}

        {/* Machine rows - Stage 2 */}
        {[5, 6, 7, 8, 9].map((machineId) => (
          <g key={`stage2-m${machineId}`}>
            <rect
              x={MARGIN_LEFT}
              y={machineToY(machineId, 2)}
              width={chartWidth}
              height={ROW_HEIGHT}
              fill="white"
              stroke={colors.gray[200]}
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 10}
              y={machineToY(machineId, 2) + ROW_HEIGHT / 2 + 5}
              textAnchor="end"
              fontSize={12}
              fill={colors.gray[600]}
            >
              AOI{machineId - 4}
            </text>
          </g>
        ))}

        {/* Time axis */}
        <line
          x1={MARGIN_LEFT}
          y1={MARGIN_TOP - 10}
          x2={MARGIN_LEFT + chartWidth}
          y2={MARGIN_TOP - 10}
          stroke={colors.gray[400]}
          strokeWidth={2}
        />

        {/* Time ticks */}
        {timeTicks.map((tick) => (
          <g key={`tick-${tick}`}>
            <line
              x1={timeToX(tick)}
              y1={MARGIN_TOP - 10}
              x2={timeToX(tick)}
              y2={MARGIN_TOP - 5}
              stroke={colors.gray[400]}
              strokeWidth={1}
            />
            <text
              x={timeToX(tick)}
              y={MARGIN_TOP - 15}
              textAnchor="middle"
              fontSize={11}
              fill={colors.gray[600]}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Job blocks */}
        {scheduledJobs.map((sj) => {
          const x = timeToX(sj.startTime);
          const y = machineToY(sj.machineId, sj.stage);
          const width = (sj.endTime - sj.startTime) * pixelsPerMinute;
          const jobColor = getJobColor(sj.family);

          const setupTypeLabel =
            sj.setupType === 'major'
              ? 'Großrüsten (65 min)'
              : sj.setupType === 'minor'
              ? 'Kleinrüsten (20 min)'
              : sj.setupType === 'aoi'
              ? 'AOI-Rüsten (25 min)'
              : 'Kein Setup';

          return (
            <g key={`job-${sj.jobId}-${sj.stage}-${sj.machineId}`}>
              {/* Setup time block */}
              {sj.setupTime > 0 && sj.setupStartTime !== null && (
                <rect
                  x={timeToX(sj.setupStartTime)}
                  y={y + 2}
                  width={sj.setupTime * pixelsPerMinute}
                  height={ROW_HEIGHT - 4}
                  fill={colors.gray[300]}
                  stroke={colors.gray[400]}
                  strokeWidth={1}
                  rx={4}
                >
                  <title>
                    {setupTypeLabel} - {sj.setupStartTime}-{sj.setupStartTime + sj.setupTime} min
                  </title>
                </rect>
              )}

              {/* Job block */}
              <rect
                x={x}
                y={y + 2}
                width={width}
                height={ROW_HEIGHT - 4}
                fill={jobColor}
                stroke={sj.isLate ? colors.error[500] : colors.gray[600]}
                strokeWidth={sj.isLate ? 2 : 1}
                rx={4}
                opacity={0.9}
              >
                <title>
                  Job {sj.jobId} (Familie {sj.family}) - {sj.stage === 1 ? `SMD${sj.machineId}` : `AOI${sj.machineId - 4}`}
                  {'\n'}Bearbeitung: {sj.startTime}-{sj.endTime} min (Dauer: {sj.processingTime} min)
                  {sj.setupTime > 0 && `\n${setupTypeLabel}`}
                  {sj.isLate && `\nVerspätung: ${Math.round(sj.tardiness)} min`}
                </title>
              </rect>

              {/* Job label */}
              {width > 30 && (
                <text
                  x={x + 5}
                  y={y + ROW_HEIGHT / 2 + 5}
                  fontSize={12}
                  fontWeight="bold"
                  fill="white"
                  pointerEvents="none"
                >
                  J{sj.jobId}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${MARGIN_LEFT}, ${chartHeight - 30})`}>
          <text x={0} y={0} fontSize={11} fontWeight="bold" fill={colors.gray[700]}>
            Legende:
          </text>

          <rect x={50} y={-10} width={16} height={16} fill={colors.gray[300]} stroke={colors.gray[400]} rx={2} />
          <text x={70} y={0} fontSize={11} fill={colors.gray[600]}>Rüsten</text>

          <rect x={130} y={-10} width={16} height={16} fill={colors.purple[500]} rx={2} />
          <text x={150} y={0} fontSize={11} fill={colors.gray[600]}>Bearbeitung</text>

          <rect x={240} y={-10} width={16} height={16} fill="white" stroke={colors.error[500]} strokeWidth={2} rx={2} />
          <text x={260} y={0} fontSize={11} fill={colors.gray[600]}>Verspätet</text>
        </g>
      </svg>
    </Box>
  );
}
