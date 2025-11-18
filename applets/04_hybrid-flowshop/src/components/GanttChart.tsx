import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { Box, IconButton, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ScheduledJob, Job } from '@/types';
import { colors } from '@/theme';

interface GanttChartProps {
  scheduledJobs: ScheduledJob[];
  jobs: Job[];
  currentTime?: number;
  makespan: number;
}

const MARGIN_LEFT = 100;
const MARGIN_TOP = 60;
const MARGIN_RIGHT = 40;
const ROW_HEIGHT = 50;
const ROW_SPACING = 10;
const MIN_PIXELS_PER_MINUTE = 2;

// Memoized job block component - only re-renders when its own props change
interface JobBlockProps {
  scheduledJob: ScheduledJob;
  x: number;
  y: number;
  width: number;
  setupX?: number;
  setupWidth?: number;
  jobColor: string;
  pixelsPerMinute: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const JobBlock = memo(function JobBlock({
  scheduledJob: sj,
  x,
  y,
  width,
  setupX,
  setupWidth,
  jobColor,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: JobBlockProps) {
  return (
    <Group>
      {/* Setup time (if any) */}
      {setupX !== undefined && setupWidth !== undefined && (
        <Rect
          x={setupX}
          y={y + 2}
          width={setupWidth}
          height={ROW_HEIGHT - 4}
          fill={colors.gray[300]}
          stroke={colors.gray[400]}
          strokeWidth={1}
          cornerRadius={4}
          listening={false}
        />
      )}

      {/* Job block */}
      <Rect
        x={x}
        y={y + 2}
        width={width}
        height={ROW_HEIGHT - 4}
        fill={jobColor}
        stroke={sj.isLate ? colors.error[500] : colors.gray[600]}
        strokeWidth={isHovered ? 3 : sj.isLate ? 2 : 1}
        cornerRadius={4}
        opacity={isHovered ? 1 : 0.9}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* Job label */}
      {width > 30 && (
        <Text
          x={x + 5}
          y={y + ROW_HEIGHT / 2 - 7}
          text={`J${sj.jobId}`}
          fontSize={12}
          fontStyle="bold"
          fill="white"
          listening={false}
        />
      )}
    </Group>
  );
});

export default function GanttChart({
  scheduledJobs,
  currentTime = 0,
  makespan,
}: GanttChartProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };

    updateDimensions();
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoize calculations
  const chartWidth = useMemo(
    () => dimensions.width - MARGIN_LEFT - MARGIN_RIGHT,
    [dimensions.width]
  );

  const pixelsPerMinute = useMemo(
    () => Math.max(MIN_PIXELS_PER_MINUTE * zoom, chartWidth / (makespan || 1)),
    [zoom, chartWidth, makespan]
  );

  // Stable callback references
  const timeToX = useCallback(
    (time: number) => MARGIN_LEFT + time * pixelsPerMinute,
    [pixelsPerMinute]
  );

  const machineToY = useCallback((machineId: number, stage: number) => {
    if (stage === 1) {
      return MARGIN_TOP + (machineId - 1) * (ROW_HEIGHT + ROW_SPACING);
    } else {
      return MARGIN_TOP + (4 + machineId - 5) * (ROW_HEIGHT + ROW_SPACING);
    }
  }, []);

  const getJobColor = useCallback((family: number) => {
    return colors.familyColors[family % colors.familyColors.length];
  }, []);

  // Stable zoom handlers
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.5, 10)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.5, 0.5)), []);
  const handleResetZoom = useCallback(() => setZoom(1), []);

  // Memoize time ticks - limit to max 15 for performance
  const timeTicks = useMemo(() => {
    const maxTicks = 15;
    const timeInterval = Math.ceil(makespan / maxTicks / 10) * 10; // Round to nearest 10
    const ticks: number[] = [];
    for (let t = 0; t <= makespan; t += timeInterval) {
      ticks.push(t);
      if (ticks.length >= maxTicks) break;
    }
    return ticks;
  }, [makespan]);

  // Calculate dynamic stage width for scrolling
  const minStageWidth = useMemo(
    () => MARGIN_LEFT + makespan * pixelsPerMinute + MARGIN_RIGHT,
    [makespan, pixelsPerMinute]
  );

  const stageWidth = useMemo(
    () => Math.max(dimensions.width, minStageWidth),
    [dimensions.width, minStageWidth]
  );

  // Pre-calculate job positions (memoized)
  const jobsWithPositions = useMemo(() => {
    return scheduledJobs.map((sj) => {
      const x = MARGIN_LEFT + sj.startTime * pixelsPerMinute;
      const y = machineToY(sj.machineId, sj.stage);
      const width = (sj.endTime - sj.startTime) * pixelsPerMinute;
      const jobColor = getJobColor(sj.family);

      const setupX =
        sj.setupTime > 0 && sj.setupStartTime !== null
          ? MARGIN_LEFT + sj.setupStartTime * pixelsPerMinute
          : undefined;
      const setupWidth =
        sj.setupTime > 0 ? sj.setupTime * pixelsPerMinute : undefined;

      return {
        scheduledJob: sj,
        x,
        y,
        width,
        setupX,
        setupWidth,
        jobColor,
      };
    });
  }, [scheduledJobs, pixelsPerMinute, machineToY, getJobColor]);

  // Stable hover callbacks
  const createHoverHandlers = useCallback((jobId: number) => ({
    onMouseEnter: () => setHoveredJob(jobId),
    onMouseLeave: () => setHoveredJob(null),
  }), []);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Zoom controls */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            bgcolor: 'white',
            borderRadius: 1,
            border: `1px solid ${colors.gray[200]}`,
            p: 0.5,
          }}
        >
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn size={18} />
          </IconButton>
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut size={18} />
          </IconButton>
          <IconButton size="small" onClick={handleResetZoom}>
            <RotateCcw size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable container for Stage */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{ width: stageWidth, height: '100%' }}>
          <Stage width={stageWidth} height={dimensions.height}>
            {/* Layer 1: Background - static, never changes */}
            <Layer listening={false}>
              <Rect
                x={0}
                y={0}
                width={stageWidth}
                height={dimensions.height}
                fill={colors.gray[50]}
              />
            </Layer>

            {/* Layer 2: Grid and labels - only changes on zoom/resize */}
            <Layer listening={false}>
              {/* Stage labels */}
              <Text
            x={10}
            y={MARGIN_TOP}
            text={t('stages.stage1')}
            fontSize={14}
            fontStyle="bold"
            fill={colors.gray[700]}
          />
          <Text
            x={10}
            y={MARGIN_TOP + 4 * (ROW_HEIGHT + ROW_SPACING)}
            text={t('stages.stage2')}
            fontSize={14}
            fontStyle="bold"
            fill={colors.gray[700]}
          />

          {/* Machine rows */}
          {[1, 2, 3, 4].map((machineId) => (
            <Group key={`stage1-machine-${machineId}`}>
              <Rect
                x={MARGIN_LEFT}
                y={machineToY(machineId, 1)}
                width={minStageWidth - MARGIN_LEFT - MARGIN_RIGHT}
                height={ROW_HEIGHT}
                fill="white"
                stroke={colors.gray[200]}
                strokeWidth={1}
              />
              <Text
                x={MARGIN_LEFT - 90}
                y={machineToY(machineId, 1) + ROW_HEIGHT / 2 - 7}
                text={`${t('machine.id', { id: machineId })}`}
                fontSize={12}
                fill={colors.gray[600]}
              />
            </Group>
          ))}

          {[5, 6, 7, 8, 9].map((machineId) => (
            <Group key={`stage2-machine-${machineId}`}>
              <Rect
                x={MARGIN_LEFT}
                y={machineToY(machineId, 2)}
                width={minStageWidth - MARGIN_LEFT - MARGIN_RIGHT}
                height={ROW_HEIGHT}
                fill="white"
                stroke={colors.gray[200]}
                strokeWidth={1}
              />
              <Text
                x={MARGIN_LEFT - 90}
                y={machineToY(machineId, 2) + ROW_HEIGHT / 2 - 7}
                text={`${t('machine.id', { id: machineId})}`}
                fontSize={12}
                fill={colors.gray[600]}
              />
            </Group>
          ))}

          {/* Time axis */}
          <Line
            points={[MARGIN_LEFT, MARGIN_TOP - 10, timeToX(makespan), MARGIN_TOP - 10]}
            stroke={colors.gray[400]}
            strokeWidth={2}
          />

          {/* Time ticks */}
          {timeTicks.map((tick) => (
            <Group key={`tick-${tick}`}>
              <Line
                points={[timeToX(tick), MARGIN_TOP - 10, timeToX(tick), MARGIN_TOP - 5]}
                stroke={colors.gray[400]}
                strokeWidth={1}
              />
              <Text
                x={timeToX(tick) - 15}
                y={MARGIN_TOP - 30}
                text={`${tick}`}
                fontSize={11}
                fill={colors.gray[600]}
              />
            </Group>
          ))}
        </Layer>

        {/* Layer 3: Jobs - only redraws when jobs or hover changes */}
        <Layer>
          {jobsWithPositions.map((jobData) => {
            const handlers = createHoverHandlers(jobData.scheduledJob.jobId);
            return (
              <JobBlock
                key={`job-${jobData.scheduledJob.jobId}-${jobData.scheduledJob.stage}-${jobData.scheduledJob.machineId}`}
                scheduledJob={jobData.scheduledJob}
                x={jobData.x}
                y={jobData.y}
                width={jobData.width}
                setupX={jobData.setupX}
                setupWidth={jobData.setupWidth}
                jobColor={jobData.jobColor}
                pixelsPerMinute={pixelsPerMinute}
                isHovered={hoveredJob === jobData.scheduledJob.jobId}
                onMouseEnter={handlers.onMouseEnter}
                onMouseLeave={handlers.onMouseLeave}
              />
            );
          })}
        </Layer>

            {/* Layer 4: Interactive overlay - current time indicator */}
            <Layer listening={false}>
              {currentTime > 0 && currentTime <= makespan && (
                <Line
                  points={[
                    timeToX(currentTime),
                    MARGIN_TOP,
                    timeToX(currentTime),
                    MARGIN_TOP + 9 * (ROW_HEIGHT + ROW_SPACING),
                  ]}
                  stroke={colors.orange[500]}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              )}
            </Layer>
          </Stage>
        </Box>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'white',
          p: 2,
          borderRadius: 1,
          border: `1px solid ${colors.gray[200]}`,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Legende
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: colors.gray[300],
                border: `1px solid ${colors.gray[400]}`,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption">{t('gantt.setup')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: colors.purple[500],
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption">{t('gantt.processing')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: 'white',
                border: `2px solid ${colors.error[500]}`,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption">{t('job.late')}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
