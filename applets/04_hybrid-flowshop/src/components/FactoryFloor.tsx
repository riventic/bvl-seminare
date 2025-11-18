import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlayCircle,
  SkipForward,
  FastForward,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Schedule, Job } from '@/types';
import { colors } from '@/theme';
import { calculateLiveStatistics, extractEventTimeline, getQueueStatesAtTime } from '@/utils/simulationHelpers';
import JobQueue from './JobQueue';

interface FactoryFloorProps {
  schedule: Schedule;
  jobs: Job[];
  makespan: number;
  jobSequence: number[];
  isOptimizing?: boolean;
}

const GRID_SIZE = 40;
const MACHINE_WIDTH = 120;
const MACHINE_HEIGHT = 80;
const MARGIN = 90; // Increased from 60 to avoid Source overlap
const STAGE_SPACING = 80; // Increased from 40 for Buffer clearance
const CONTAINER_WIDTH = 100;

// Fixed canvas height calculation
const SINK_Y = MARGIN + MACHINE_HEIGHT + STAGE_SPACING + MACHINE_HEIGHT + 20;
const CANVAS_HEIGHT = SINK_Y + 60 + 20; // Total: 430px

export default function FactoryFloor({ schedule, jobs, makespan, jobSequence, isOptimizing = false }: FactoryFloorProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playMode, setPlayMode] = useState<'continuous' | 'step'>('continuous');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState<'source' | 'buffer' | 'sink' | null>(
    null
  );

  // Extract event timeline
  const eventTimeline = useMemo(() => extractEventTimeline(schedule), [schedule]);

  // Get queue states at current time
  const queueStates = useMemo(
    () => getQueueStatesAtTime(schedule, currentTime, jobSequence),
    [schedule, currentTime, jobSequence]
  );

  // Update dimensions - fixed height, only width changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: CANVAS_HEIGHT, // Fixed height - no scrolling needed
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop (only for continuous mode)
  useEffect(() => {
    if (!isPlaying || playMode === 'step') return;

    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const newTime = t + speed;
        if (newTime >= makespan) {
          setIsPlaying(false);
          return makespan;
        }
        return newTime;
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isPlaying, speed, makespan, playMode]);

  // Calculate live statistics
  const liveStats = useMemo(
    () => calculateLiveStatistics(schedule, currentTime, jobs.length),
    [schedule, currentTime, jobs.length]
  );

  // Calculate machine states at current time
  const machineStates = useMemo(() => {
    const states = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      stage: (i < 4 ? 1 : 2) as 1 | 2,
      currentJob: null as number | null,
      setupKit: null as number | null,
      isSetup: false,
      color: colors.gray[200],
    }));

    // Find which jobs are active at currentTime
    schedule.jobs.forEach((sj) => {
      const machineIndex = sj.machineId - 1;

      // Check if setup is happening
      if (sj.setupStartTime !== null && sj.setupTime > 0) {
        const setupEnd = sj.setupStartTime + sj.setupTime;
        if (currentTime >= sj.setupStartTime && currentTime < setupEnd) {
          states[machineIndex].isSetup = true;
          states[machineIndex].setupKit = sj.family;
          states[machineIndex].color = colors.warning[500];
          return;
        }
      }

      // Check if job is processing
      if (currentTime >= sj.startTime && currentTime < sj.endTime) {
        states[machineIndex].currentJob = sj.jobId;
        states[machineIndex].setupKit = sj.family;
        states[machineIndex].color = colors.familyColors[sj.family % colors.familyColors.length];
      }
    });

    return states;
  }, [schedule, currentTime]);

  // Machine positions
  const getMachinePosition = useCallback(
    (machineId: number) => {
      const stage = machineId <= 4 ? 1 : 2;
      const indexInStage = stage === 1 ? machineId - 1 : machineId - 5;
      const machinesInStage = stage === 1 ? 4 : 5;

      const totalWidth = machinesInStage * MACHINE_WIDTH + (machinesInStage - 1) * 20;
      const startX = (dimensions.width - totalWidth) / 2;
      const x = startX + indexInStage * (MACHINE_WIDTH + 20);

      // Updated y-positions with new margins
      const y = stage === 1 ? MARGIN : MARGIN + MACHINE_HEIGHT + STAGE_SPACING;

      return { x, y };
    },
    [dimensions.width]
  );

  // Draw grid
  const gridLines = useMemo(() => {
    const lines: Array<{ points: number[]; key: string }> = [];

    // Vertical lines
    for (let x = 0; x <= dimensions.width; x += GRID_SIZE) {
      lines.push({
        key: `v-${x}`,
        points: [x, 0, x, dimensions.height],
      });
    }

    // Horizontal lines
    for (let y = 0; y <= dimensions.height; y += GRID_SIZE) {
      lines.push({
        key: `h-${y}`,
        points: [0, y, dimensions.width, y],
      });
    }

    return lines;
  }, [dimensions]);

  const handlePlayPause = () => {
    if (currentTime >= makespan) {
      setCurrentTime(0);
      setCurrentEventIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentEventIndex(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (_: Event, value: number | number[]) => {
    setSpeed(value as number);
  };

  const handleStepForward = () => {
    if (currentEventIndex >= eventTimeline.length) {
      setCurrentTime(makespan);
      return;
    }

    const nextEvent = eventTimeline[currentEventIndex];
    setCurrentTime(nextEvent.time);
    setCurrentEventIndex((i) => i + 1);
  };

  const handleStepBackward = () => {
    if (currentEventIndex <= 0) {
      setCurrentTime(0);
      return;
    }

    setCurrentEventIndex((i) => i - 1);
    const prevEvent = eventTimeline[currentEventIndex - 1];
    setCurrentTime(prevEvent.time);
  };

  const handleJumpForward = () => {
    const newIndex = Math.min(eventTimeline.length, currentEventIndex + 10);
    setCurrentEventIndex(newIndex);

    if (newIndex >= eventTimeline.length) {
      setCurrentTime(makespan);
    } else {
      const event = eventTimeline[newIndex - 1];
      setCurrentTime(event.time);
    }
  };

  const handleJumpBackward = () => {
    const newIndex = Math.max(0, currentEventIndex - 10);
    setCurrentEventIndex(newIndex);

    if (newIndex === 0) {
      setCurrentTime(0);
    } else {
      const event = eventTimeline[newIndex - 1];
      setCurrentTime(event.time);
    }
  };

  const handleJumpToEnd = () => {
    setCurrentTime(makespan);
    setCurrentEventIndex(eventTimeline.length);
    setIsPlaying(false);
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'SETUP_START':
        return 'Rüsten Start';
      case 'SETUP_END':
        return 'Rüsten Ende';
      case 'JOB_START':
        return 'Job Start';
      case 'STAGE1_COMPLETE':
        return 'Stufe 1 ✓';
      case 'SIMULATION_END':
        return 'Job Fertig';
      default:
        return type;
    }
  };

  const progress = (currentTime / makespan) * 100;

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Canvas - fixed height */}
      <Box sx={{ height: CANVAS_HEIGHT, flexShrink: 0, position: 'relative', bgcolor: colors.gray[50] }}>
        <Stage width={dimensions.width} height={CANVAS_HEIGHT}>
          {/* Grid Background Layer */}
          <Layer listening={false}>
            {gridLines.map((line) => (
              <Line
                key={line.key}
                points={line.points}
                stroke={colors.gray[300]}
                strokeWidth={1}
                opacity={0.3}
              />
            ))}
          </Layer>

          {/* Stage Labels Layer */}
          <Layer listening={false}>
            <Text
              x={20}
              y={MARGIN + MACHINE_HEIGHT / 2 - 10}
              text={t('stages.stage1')}
              fontSize={16}
              fontStyle="bold"
              fill={colors.gray[600]}
            />
            <Text
              x={20}
              y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING + MACHINE_HEIGHT / 2 - 10}
              text={t('stages.stage2')}
              fontSize={16}
              fontStyle="bold"
              fill={colors.gray[600]}
            />
          </Layer>

          {/* Machines Layer */}
          <Layer>
            {machineStates.map((machine) => {
              const pos = getMachinePosition(machine.id);

              return (
                <Group key={`machine-${machine.id}`}>
                  {/* Machine box */}
                  <Rect
                    x={pos.x}
                    y={pos.y}
                    width={MACHINE_WIDTH}
                    height={MACHINE_HEIGHT}
                    fill={machine.color}
                    stroke={colors.gray[600]}
                    strokeWidth={2}
                    cornerRadius={8}
                    shadowBlur={machine.currentJob || machine.isSetup ? 10 : 0}
                    shadowColor={machine.color}
                  />

                  {/* Machine label */}
                  <Text
                    x={pos.x + MACHINE_WIDTH / 2}
                    y={pos.y + 15}
                    text={machine.stage === 1 ? `SMD${machine.id}` : `AOI${machine.id - 4}`}
                    fontSize={14}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                    offsetX={machine.stage === 1 ? 20 : 22}
                  />

                  {/* Job/Setup info */}
                  {machine.isSetup && (
                    <Text
                      x={pos.x + MACHINE_WIDTH / 2}
                      y={pos.y + MACHINE_HEIGHT / 2 - 5}
                      text="RÜSTEN"
                      fontSize={12}
                      fill="white"
                      align="center"
                      offsetX={25}
                    />
                  )}

                  {machine.currentJob && !machine.isSetup && (
                    <Text
                      x={pos.x + MACHINE_WIDTH / 2}
                      y={pos.y + MACHINE_HEIGHT / 2 - 5}
                      text={`Job ${machine.currentJob}`}
                      fontSize={14}
                      fontStyle="bold"
                      fill="white"
                      align="center"
                      offsetX={30}
                    />
                  )}

                  {/* Setup kit indicator */}
                  {machine.setupKit !== null && (
                    <Group>
                      <Rect
                        x={pos.x + MACHINE_WIDTH - 30}
                        y={pos.y + MACHINE_HEIGHT - 25}
                        width={25}
                        height={20}
                        fill={colors.gray[800]}
                        cornerRadius={4}
                      />
                      <Text
                        x={pos.x + MACHINE_WIDTH - 28}
                        y={pos.y + MACHINE_HEIGHT - 22}
                        text={`K${machine.setupKit}`}
                        fontSize={10}
                        fill="white"
                      />
                    </Group>
                  )}
                </Group>
              );
            })}

            {/* Source, Buffer, Sink Containers */}
            {/* Source (above Stage 1) */}
            <Group onClick={() => setSelectedContainer('source')}>
              <Rect
                x={dimensions.width / 2 - CONTAINER_WIDTH / 2}
                y={10}
                width={CONTAINER_WIDTH}
                height={60}
                fill={colors.info[200]}
                stroke={colors.info[500]}
                strokeWidth={2}
                cornerRadius={8}
                shadowBlur={5}
              />
              <Text
                x={dimensions.width / 2}
                y={20}
                text="Quelle"
                fontSize={12}
                fontStyle="bold"
                fill={colors.info[700]}
                align="center"
              />
              <Text
                x={dimensions.width / 2}
                y={40}
                text={`${queueStates.inSource.length} Jobs`}
                fontSize={11}
                fill={colors.info[700]}
                align="center"
              />
            </Group>

            {/* Buffer (between stages) */}
            <Group onClick={() => setSelectedContainer('buffer')}>
              <Rect
                x={dimensions.width / 2 - CONTAINER_WIDTH / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING / 2 - 30}
                width={CONTAINER_WIDTH}
                height={60}
                fill={colors.warning[200]}
                stroke={colors.warning[500]}
                strokeWidth={2}
                cornerRadius={8}
                shadowBlur={5}
              />
              <Text
                x={dimensions.width / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING / 2 - 20}
                text="Puffer"
                fontSize={12}
                fontStyle="bold"
                fill={colors.warning[700]}
                align="center"
              />
              <Text
                x={dimensions.width / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING / 2}
                text={`${queueStates.inBuffer.length} Jobs`}
                fontSize={11}
                fill={colors.warning[700]}
                align="center"
              />
            </Group>

            {/* Sink (below Stage 2) */}
            <Group onClick={() => setSelectedContainer('sink')}>
              <Rect
                x={dimensions.width / 2 - CONTAINER_WIDTH / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING + MACHINE_HEIGHT + 20}
                width={CONTAINER_WIDTH}
                height={60}
                fill={colors.success[200]}
                stroke={colors.success[500]}
                strokeWidth={2}
                cornerRadius={8}
                shadowBlur={5}
              />
              <Text
                x={dimensions.width / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING + MACHINE_HEIGHT + 30}
                text="Senke"
                fontSize={12}
                fontStyle="bold"
                fill={colors.success[700]}
                align="center"
              />
              <Text
                x={dimensions.width / 2}
                y={MARGIN + MACHINE_HEIGHT + STAGE_SPACING + MACHINE_HEIGHT + 50}
                text={`${queueStates.inSink.length} Jobs`}
                fontSize={11}
                fill={colors.success[700]}
                align="center"
              />
            </Group>
          </Layer>
        </Stage>
      </Box>

      {/* Dialog for job lists */}
      <Dialog
        open={selectedContainer !== null}
        onClose={() => setSelectedContainer(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedContainer === 'source' && `Quelle (${queueStates.inSource.length} Jobs)`}
          {selectedContainer === 'buffer' && `Puffer (${queueStates.inBuffer.length} Jobs)`}
          {selectedContainer === 'sink' && `Senke (${queueStates.inSink.length} Jobs)`}
        </DialogTitle>
        <DialogContent>
          {selectedContainer === 'source' && (
            <JobQueue
              title=""
              jobs={jobs}
              jobSequence={queueStates.inSource}
              onSequenceChange={() => {}}
              readOnly
            />
          )}

          {selectedContainer === 'buffer' && (
            <JobQueue
              title=""
              jobs={jobs}
              jobSequence={queueStates.inBuffer}
              onSequenceChange={() => {}}
              readOnly
              showCompletionInfo
              completionTimes={
                new Map(
                  queueStates.inBuffer.map((jobId) => {
                    const stage1Job = schedule.jobs.find(
                      (sj) => sj.jobId === jobId && sj.stage === 1
                    );
                    return [jobId, stage1Job?.endTime || 0];
                  })
                )
              }
            />
          )}

          {selectedContainer === 'sink' && (
            <JobQueue
              title=""
              jobs={jobs}
              jobSequence={queueStates.inSink}
              onSequenceChange={() => {}}
              readOnly
              showCompletionInfo
              jobStatuses={
                new Map(
                  queueStates.inSink.map((jobId) => {
                    const stage2Job = schedule.jobs.find(
                      (sj) => sj.jobId === jobId && sj.stage === 2
                    );
                    return [
                      jobId,
                      {
                        isLate: stage2Job?.isLate || false,
                        tardiness: stage2Job?.tardiness || 0,
                      },
                    ];
                  })
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: `1px solid ${colors.gray[200]}` }}>
        {/* Mode Toggle */}
        <Box sx={{ mb: 1.5 }}>
          <ToggleButtonGroup
            value={playMode}
            exclusive
            onChange={(_, mode) => {
              if (mode) {
                setPlayMode(mode);
                setIsPlaying(false);
              }
            }}
            size="small"
            disabled={isOptimizing}
          >
            <ToggleButton value="continuous">
              <PlayCircle size={16} style={{ marginRight: 4 }} />
              Kontinuierlich
            </ToggleButton>
            <ToggleButton value="step">
              <SkipForward size={16} style={{ marginRight: 4 }} />
              Schrittweise
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {/* Continuous Mode Controls */}
          {playMode === 'continuous' && (
            <>
              {/* Play/Pause */}
              <IconButton onClick={handlePlayPause} color="primary" disabled={isOptimizing}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </IconButton>

              {/* Reset */}
              <IconButton onClick={handleReset} disabled={isOptimizing}>
                <RotateCcw size={20} />
              </IconButton>

              {/* Jump to End */}
              <IconButton onClick={handleJumpToEnd} disabled={isOptimizing} title="Zum Ende springen">
                <FastForward size={20} />
              </IconButton>
            </>
          )}

          {/* Step Mode Controls */}
          {playMode === 'step' && (
            <>
              {/* Jump backward 10 */}
              <IconButton
                onClick={handleJumpBackward}
                disabled={currentEventIndex === 0 || isOptimizing}
                size="small"
                title="10 Events zurück"
              >
                <ChevronsLeft size={20} />
              </IconButton>

              {/* Step backward 1 */}
              <IconButton
                onClick={handleStepBackward}
                disabled={currentEventIndex === 0 || isOptimizing}
                size="small"
                title="1 Event zurück"
              >
                <ChevronLeft size={20} />
              </IconButton>

              {/* Step forward 1 */}
              <IconButton
                onClick={handleStepForward}
                disabled={currentEventIndex >= eventTimeline.length || isOptimizing}
                size="small"
                color="primary"
                title="1 Event vor"
              >
                <ChevronRight size={20} />
              </IconButton>

              {/* Jump forward 10 */}
              <IconButton
                onClick={handleJumpForward}
                disabled={currentEventIndex >= eventTimeline.length || isOptimizing}
                size="small"
                color="primary"
                title="10 Events vor"
              >
                <ChevronsRight size={20} />
              </IconButton>

              {/* Reset */}
              <IconButton onClick={handleReset} size="small" disabled={isOptimizing} title="Zurücksetzen">
                <RotateCcw size={20} />
              </IconButton>

              {/* Jump to End */}
              <IconButton onClick={handleJumpToEnd} size="small" disabled={isOptimizing} title="Zum Ende springen">
                <FastForward size={20} />
              </IconButton>

              <Typography variant="caption" sx={{ minWidth: 100 }}>
                Event {currentEventIndex} / {eventTimeline.length}
              </Typography>
            </>
          )}

          {/* Time display */}
          <Typography variant="body2" sx={{ minWidth: 120 }}>
            {Math.round(currentTime)} / {Math.round(makespan)} min
          </Typography>

          {/* Progress bar */}
          <Box sx={{ flex: 1, mx: 2 }}>
            <Box
              sx={{
                height: 8,
                bgcolor: colors.gray[200],
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${progress}%`,
                  bgcolor: colors.purple[500],
                  transition: 'width 0.1s linear',
                }}
              />
            </Box>
          </Box>

          {/* Speed control - only in continuous mode */}
          {playMode === 'continuous' && (
            <>
              <Typography variant="caption" sx={{ minWidth: 80 }}>
                Geschwindigkeit:
              </Typography>
              <Box sx={{ width: 120 }}>
                <Slider
                  value={speed}
                  onChange={handleSpeedChange}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '1x' },
                    { value: 5, label: '5x' },
                    { value: 10, label: '10x' },
                  ]}
                  size="small"
                  disabled={isOptimizing}
                />
              </Box>
            </>
          )}

          {/* Current Event Info - only in step mode */}
          {playMode === 'step' && currentEventIndex > 0 && (
            <Chip
              label={`${getEventLabel(eventTimeline[currentEventIndex - 1].type)}: Job ${
                eventTimeline[currentEventIndex - 1].jobId
              } @ ${
                eventTimeline[currentEventIndex - 1].stage === 1
                  ? `SMD${eventTimeline[currentEventIndex - 1].machineId}`
                  : `AOI${eventTimeline[currentEventIndex - 1].machineId! - 4}`
              }`}
              size="small"
              sx={{
                bgcolor: colors.info[100],
                color: colors.info[700],
                fontSize: 12,
              }}
            />
          )}
        </Box>

        {/* Live Statistics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 1.5,
            pt: 1.5,
            borderTop: `1px solid ${colors.gray[200]}`,
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Live:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption">
              {liveStats.completedJobs} / {liveStats.totalJobs} Jobs
            </Typography>
            <Chip
              label={`✓ ${liveStats.onTimeJobs}`}
              size="small"
              sx={{ bgcolor: colors.success[100], color: colors.success[700], height: 22 }}
            />
            <Chip
              label={`✗ ${liveStats.lateJobs}`}
              size="small"
              sx={{ bgcolor: colors.error[100], color: colors.error[700], height: 22 }}
            />
            <Typography variant="caption">
              Setups: {liveStats.setupCount}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.error[600] }}>
              Verspätung: {Math.round(liveStats.totalTardiness)} min
            </Typography>
          </Box>
        </Box>

        {/* Final Schedule Metrics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 1.5,
            pt: 1.5,
            mt: 1.5,
            borderTop: `1px solid ${colors.gray[200]}`,
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Qualität:
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: colors.purple[600], fontWeight: 600 }}>
              Makespan: {Math.round(schedule.makespan)} min
            </Typography>
            <Typography variant="caption" sx={{ color: colors.orange[600], fontWeight: 600 }}>
              Setups: Minor {schedule.minorSetupCount} | Major {schedule.majorSetupCount} | AOI{' '}
              {schedule.aoiSetupCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: schedule.totalTardiness > 0 ? colors.error[600] : colors.success[600],
              }}
            >
              Verspätung: {Math.round(schedule.totalTardiness)} min
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
