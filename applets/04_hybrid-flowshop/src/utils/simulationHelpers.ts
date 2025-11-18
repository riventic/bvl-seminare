import type { Schedule, Statistics, SimulationEvent } from '@/types';

/**
 * Get queue states at a specific point in time
 */
export function getQueueStatesAtTime(
  schedule: Schedule,
  currentTime: number,
  jobSequence: number[]
): {
  inSource: number[];
  inBuffer: number[];
  inSink: number[];
} {
  const inSource: number[] = [];
  const inBuffer: number[] = [];
  const inSink: number[] = [];

  jobSequence.forEach((jobId) => {
    const stage1Job = schedule.jobs.find((sj) => sj.jobId === jobId && sj.stage === 1);
    const stage2Job = schedule.jobs.find((sj) => sj.jobId === jobId && sj.stage === 2);

    if (!stage1Job) {
      // Job hasn't started Stage 1 yet
      inSource.push(jobId);
    } else if (stage1Job.startTime > currentTime) {
      // Job scheduled but hasn't started yet
      inSource.push(jobId);
    } else if (stage1Job.endTime > currentTime) {
      // Job is currently processing in Stage 1 (on a machine)
      // Not in any queue
    } else if (!stage2Job || stage2Job.startTime > currentTime) {
      // Job finished Stage 1, waiting for Stage 2
      inBuffer.push(jobId);
    } else if (stage2Job.endTime > currentTime) {
      // Job is currently processing in Stage 2 (on a machine)
      // Not in any queue
    } else {
      // Job fully completed
      inSink.push(jobId);
    }
  });

  return { inSource, inBuffer, inSink };
}

/**
 * Extract event timeline from schedule for step-by-step simulation
 */
export function extractEventTimeline(schedule: Schedule): SimulationEvent[] {
  const events: SimulationEvent[] = [];

  schedule.jobs.forEach((sj) => {
    // Setup start event
    if (sj.setupStartTime !== null && sj.setupTime > 0) {
      events.push({
        type: 'SETUP_START',
        time: sj.setupStartTime,
        jobId: sj.jobId,
        machineId: sj.machineId,
        stage: sj.stage,
        setupKit: sj.family,
      });

      events.push({
        type: 'SETUP_END',
        time: sj.setupStartTime + sj.setupTime,
        jobId: sj.jobId,
        machineId: sj.machineId,
        stage: sj.stage,
      });
    }

    // Job start event
    events.push({
      type: 'JOB_START',
      time: sj.startTime,
      jobId: sj.jobId,
      machineId: sj.machineId,
      stage: sj.stage,
    });

    // Job end event
    events.push({
      type: sj.stage === 1 ? 'STAGE1_COMPLETE' : 'SIMULATION_END',
      time: sj.endTime,
      jobId: sj.jobId,
      machineId: sj.machineId,
      stage: sj.stage,
    });
  });

  // Sort by time, then by type priority
  return events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    // Setup events before job events at same time
    const priority: Record<string, number> = {
      SETUP_START: 1,
      SETUP_END: 2,
      JOB_START: 3,
      STAGE1_COMPLETE: 4,
      SIMULATION_END: 5,
    };
    return priority[a.type] - priority[b.type];
  });
}

/**
 * Calculate statistics at a specific point in time during simulation
 */
export function calculateLiveStatistics(
  schedule: Schedule,
  currentTime: number,
  totalJobs: number
): Statistics {
  // Get all Stage 2 jobs (final stage) that have completed by currentTime
  const completedStage2Jobs = schedule.jobs.filter(
    (sj) => sj.stage === 2 && sj.endTime <= currentTime
  );

  const completedJobs = completedStage2Jobs.length;

  // Calculate tardiness for completed jobs only
  const totalTardiness = completedStage2Jobs.reduce((sum, sj) => sum + sj.tardiness, 0);
  const averageTardiness = completedJobs > 0 ? totalTardiness / completedJobs : 0;

  // Count on-time vs late jobs
  const lateJobs = completedStage2Jobs.filter((sj) => sj.isLate).length;
  const onTimeJobs = completedJobs - lateJobs;

  // Count setups that have been completed by currentTime
  const setupCount = schedule.jobs.filter(
    (sj) =>
      sj.setupTime > 0 &&
      sj.setupStartTime !== null &&
      sj.setupStartTime + sj.setupTime <= currentTime
  ).length;

  const minorSetupCount = schedule.jobs.filter(
    (sj) => sj.setupType === 'minor' && sj.setupStartTime !== null &&
      sj.setupStartTime + sj.setupTime <= currentTime
  ).length;

  const majorSetupCount = schedule.jobs.filter(
    (sj) => sj.setupType === 'major' && sj.setupStartTime !== null &&
      sj.setupStartTime + sj.setupTime <= currentTime
  ).length;

  const aoiSetupCount = schedule.jobs.filter(
    (sj) => sj.setupType === 'aoi' && sj.setupStartTime !== null &&
      sj.setupStartTime + sj.setupTime <= currentTime
  ).length;

  // Calculate utilization up to current time
  // For simplicity, we'll use the full schedule utilization
  // (A more accurate implementation would calculate utilization only up to currentTime)
  const utilization = {
    stage1: schedule.utilization.stage1,
    stage2: schedule.utilization.stage2,
  };

  return {
    makespan: schedule.makespan,
    totalTardiness,
    averageTardiness,
    completedJobs,
    totalJobs,
    setupCount,
    minorSetupCount,
    majorSetupCount,
    aoiSetupCount,
    utilization,
    onTimeJobs,
    lateJobs,
  };
}
