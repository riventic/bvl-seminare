/**
 * Simulator wrapper and helper functions
 * Core simulation logic is in simulationCore.ts
 */

import type { Job, Schedule, Statistics } from '@/types';
import { runSimulation as runSimulationCore } from './simulationCore';

/**
 * Run discrete event simulation
 * (Re-export from core for backwards compatibility)
 */
export function runSimulation(jobs: Job[], jobSequence: number[]): Schedule {
  return runSimulationCore(jobs, jobSequence);
}

/**
 * Calculate statistics from schedule
 */
export function calculateStatistics(schedule: Schedule, totalJobs: number): Statistics {
  const completedJobs = schedule.jobs.filter((sj) => sj.stage === 2).length;
  const lateJobs = schedule.jobs.filter((sj) => sj.stage === 2 && sj.isLate).length;
  const onTimeJobs = completedJobs - lateJobs;

  return {
    makespan: schedule.makespan,
    totalTardiness: schedule.totalTardiness,
    averageTardiness: schedule.averageTardiness,
    completedJobs,
    totalJobs,
    setupCount: schedule.setupCount,
    minorSetupCount: schedule.minorSetupCount,
    majorSetupCount: schedule.majorSetupCount,
    aoiSetupCount: schedule.aoiSetupCount,
    utilization: schedule.utilization,
    onTimeJobs,
    lateJobs,
  };
}

/**
 * Apply scheduling heuristic to generate job sequence
 */
export function applyHeuristic(jobs: Job[], heuristic: string): number[] {
  const jobsCopy = [...jobs];

  switch (heuristic) {
    case 'FIFO':
      return jobsCopy.map((j) => j.id);

    case 'EDD':
      jobsCopy.sort((a, b) => a.dueDate - b.dueDate);
      return jobsCopy.map((j) => j.id);

    case 'SPT':
      jobsCopy.sort((a, b) => a.t_smd + a.t_aoi - (b.t_smd + b.t_aoi));
      return jobsCopy.map((j) => j.id);

    case 'FAMILY_GROUP':
      jobsCopy.sort((a, b) => {
        if (a.family !== b.family) return a.family - b.family;
        return a.dueDate - b.dueDate;
      });
      return jobsCopy.map((j) => j.id);

    default:
      return jobsCopy.map((j) => j.id);
  }
}
