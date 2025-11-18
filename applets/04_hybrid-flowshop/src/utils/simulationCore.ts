/**
 * Core simulation engine - shared between main thread and Web Worker
 * This file contains the discrete event simulation logic that can be used
 * by both the UI (simulator.ts) and the genetic algorithm (gaWorker.ts)
 */

import type { Job, Machine, SetupKit, ScheduledJob, Schedule, SimulationEvent } from '../types';
import { PriorityQueue } from './PriorityQueue';

// Setup time constants
const SETUP_TIME_SMD_MINOR = 20; // Kit available or free
const SETUP_TIME_SMD_MAJOR = 65; // Kit on another machine, needs transfer
const SETUP_TIME_AOI = 25; // AOI always requires setup
const STAGE1_MACHINES = 4;
const STAGE2_MACHINES = 5;

/**
 * Simulation state
 */
interface SimulationState {
  currentTime: number;
  machines: Machine[];
  setupKits: Map<number, SetupKit>;
  stage1Queue: number[];
  stage2Queue: number[];
  completedJobs: ScheduledJob[];
  jobsMap: Map<number, Job>;
}

/**
 * Initialize simulation state
 */
function initializeState(jobs: Job[], jobSequence: number[]): SimulationState {
  const machines: Machine[] = [];

  // Stage 1 machines
  for (let i = 1; i <= STAGE1_MACHINES; i++) {
    machines.push({
      id: i,
      stage: 1,
      currentSetupKit: null,
      availableAt: 0,
      currentJob: null,
    });
  }

  // Stage 2 machines
  for (let i = 1; i <= STAGE2_MACHINES; i++) {
    machines.push({
      id: STAGE1_MACHINES + i,
      stage: 2,
      currentSetupKit: null,
      availableAt: 0,
      currentJob: null,
    });
  }

  // Setup kits
  const setupKits = new Map<number, SetupKit>();
  const families = new Set(jobs.map((j) => j.family));
  families.forEach((family) => {
    setupKits.set(family, {
      family,
      currentMachine: null,
      inTransit: false,
      availableAt: 0,
    });
  });

  const jobsMap = new Map(jobs.map((j) => [j.id, j]));

  return {
    currentTime: 0,
    machines,
    setupKits,
    stage1Queue: [...jobSequence],
    stage2Queue: [],
    completedJobs: [],
    jobsMap,
  };
}

/**
 * Try to assign jobs from Stage 1 queue
 */
function tryAssignStage1Jobs(
  state: SimulationState,
  eventQueue: PriorityQueue<SimulationEvent>
): void {
  let assigned = true;

  while (assigned && state.stage1Queue.length > 0) {
    assigned = false;
    const jobId = state.stage1Queue[0];
    const job = state.jobsMap.get(jobId);
    if (!job) continue;

    const kit = state.setupKits.get(job.family);
    if (!kit) continue;

    const stage1Machines = state.machines.filter((m) => m.stage === 1);
    let bestMachine: Machine | null = null;
    let bestStartTime = Infinity;
    let setupRequired = false;
    let bestSetupTime = 0;

    for (const machine of stage1Machines) {
      // SMD ALWAYS requires setup (minor or major)
      let setupTime = 0;

      if (machine.currentSetupKit === job.family) {
        // Correct kit already ON this machine - MINOR setup (20 min)
        setupTime = SETUP_TIME_SMD_MINOR;
      } else if (kit.currentMachine !== null && kit.currentMachine !== machine.id) {
        // Kit on ANOTHER machine - MAJOR setup (65 min), can't use this machine yet
        setupTime = SETUP_TIME_SMD_MAJOR;
        continue; // Skip this machine - kit is busy elsewhere
      } else {
        // New kit needed (kit is free or first time) - MAJOR setup (65 min)
        setupTime = SETUP_TIME_SMD_MAJOR;
      }

      const machineReadyAt = machine.availableAt;
      const kitReadyAt = kit.availableAt;
      const setupStartTime = Math.max(state.currentTime, machineReadyAt, kitReadyAt);
      const jobStartTime = setupStartTime + setupTime;

      if (jobStartTime < bestStartTime) {
        bestStartTime = jobStartTime;
        bestMachine = machine;
        setupRequired = true; // Always true for SMD
        bestSetupTime = setupTime;
      }
    }

    if (bestMachine) {
      state.stage1Queue.shift();
      assigned = true;

      const setupStartTime = setupRequired
        ? Math.max(state.currentTime, bestMachine.availableAt, kit.availableAt)
        : Math.max(state.currentTime, bestMachine.availableAt);

      const jobStartTime = setupRequired ? setupStartTime + bestSetupTime : setupStartTime;
      const jobEndTime = jobStartTime + job.t_smd;

      bestMachine.currentJob = jobId;
      bestMachine.availableAt = jobEndTime;

      // SMD always requires setup - handle kit transfer
      // If kit is on another machine, remove it from there first
      if (kit.currentMachine !== null && kit.currentMachine !== bestMachine.id) {
        const oldMachine = state.machines.find((m) => m.id === kit.currentMachine);
        if (oldMachine) {
          oldMachine.currentSetupKit = null; // Remove kit from old machine
        }
      }

      // Install kit on this machine
      kit.currentMachine = bestMachine.id;
      kit.availableAt = jobEndTime;
      bestMachine.currentSetupKit = job.family;

      eventQueue.push({
        type: 'STAGE1_COMPLETE',
        time: jobEndTime,
        jobId,
        machineId: bestMachine.id,
        stage: 1,
      });

      state.completedJobs.push({
        jobId,
        machineId: bestMachine.id,
        stage: 1,
        startTime: jobStartTime,
        endTime: jobEndTime,
        setupTime: setupRequired ? bestSetupTime : 0,
        setupType: setupRequired
          ? bestSetupTime === SETUP_TIME_SMD_MAJOR
            ? 'major'
            : 'minor'
          : 'none',
        setupStartTime: setupRequired ? setupStartTime : null,
        processingTime: job.t_smd,
        family: job.family,
        isLate: false,
        tardiness: 0,
      });
    } else {
      break;
    }
  }
}

/**
 * Try to assign jobs from Stage 2 queue
 */
function tryAssignStage2Jobs(
  state: SimulationState,
  eventQueue: PriorityQueue<SimulationEvent>
): void {
  let assigned = true;

  while (assigned && state.stage2Queue.length > 0) {
    assigned = false;
    const jobId = state.stage2Queue[0];
    const job = state.jobsMap.get(jobId);
    if (!job) continue;

    const stage2Machines = state.machines.filter((m) => m.stage === 2);
    const bestMachine = stage2Machines.reduce((best, current) =>
      current.availableAt < best.availableAt ? current : best
    );

    const stage1Job = state.completedJobs.find((sj) => sj.jobId === jobId && sj.stage === 1);
    if (!stage1Job) continue;

    // AOI ALWAYS requires 25 min setup
    const setupStartTime = Math.max(
      stage1Job.endTime,
      bestMachine.availableAt,
      state.currentTime
    );
    const jobStartTime = setupStartTime + SETUP_TIME_AOI;
    const jobEndTime = jobStartTime + job.t_aoi;

    state.stage2Queue.shift();
    assigned = true;

    bestMachine.currentJob = jobId;
    bestMachine.availableAt = jobEndTime;

    eventQueue.push({
      type: 'SIMULATION_END',
      time: jobEndTime,
      jobId,
      machineId: bestMachine.id,
      stage: 2,
    });

    const tardiness = Math.max(0, jobEndTime - job.dueDate);
    state.completedJobs.push({
      jobId,
      machineId: bestMachine.id,
      stage: 2,
      startTime: jobStartTime,
      endTime: jobEndTime,
      setupTime: SETUP_TIME_AOI,
      setupType: 'aoi',
      setupStartTime: setupStartTime,
      processingTime: job.t_aoi,
      family: job.family,
      isLate: tardiness > 0,
      tardiness,
    });
  }
}

/**
 * Process an event
 */
function processEvent(
  event: SimulationEvent,
  state: SimulationState,
  eventQueue: PriorityQueue<SimulationEvent>
): void {
  state.currentTime = event.time;

  switch (event.type) {
    case 'STAGE1_COMPLETE': {
      const machine = state.machines.find((m) => m.id === event.machineId);
      if (machine) {
        machine.currentJob = null;
        // Kit stays on machine - machine.currentSetupKit and kit.currentMachine remain set
        // Kit will only be removed when another machine needs it
      }
      state.stage2Queue.push(event.jobId!);
      tryAssignStage2Jobs(state, eventQueue);
      break;
    }

    case 'SIMULATION_END': {
      const machine = state.machines.find((m) => m.id === event.machineId);
      if (machine) {
        machine.currentJob = null;
      }
      break;
    }
  }
}

/**
 * Run discrete event simulation
 */
export function runSimulation(jobs: Job[], jobSequence: number[]): Schedule {
  const eventQueue = new PriorityQueue<SimulationEvent>();
  const state = initializeState(jobs, jobSequence);

  tryAssignStage1Jobs(state, eventQueue);

  let iterations = 0;
  const maxIterations = 10000;

  while (!eventQueue.isEmpty() && iterations < maxIterations) {
    iterations++;

    const event = eventQueue.pop();
    if (!event) break;

    processEvent(event, state, eventQueue);
    tryAssignStage1Jobs(state, eventQueue);
  }

  if (iterations >= maxIterations) {
    console.warn('Simulation reached max iterations - possible deadlock');
  }

  // Build final schedule
  const makespan = Math.max(...state.completedJobs.map((sj) => sj.endTime), 0);
  const stage2Jobs = state.completedJobs.filter((sj) => sj.stage === 2);
  const totalTardiness = stage2Jobs.reduce((sum, sj) => sum + sj.tardiness, 0);
  const averageTardiness = stage2Jobs.length > 0 ? totalTardiness / stage2Jobs.length : 0;

  // Count setup types
  const setupCount = state.completedJobs.filter((sj) => sj.setupTime > 0).length;
  const minorSetupCount = state.completedJobs.filter((sj) => sj.setupType === 'minor').length;
  const majorSetupCount = state.completedJobs.filter((sj) => sj.setupType === 'major').length;
  const aoiSetupCount = state.completedJobs.filter((sj) => sj.setupType === 'aoi').length;

  const stage1TotalProcessing = state.completedJobs
    .filter((sj) => sj.stage === 1)
    .reduce((sum, sj) => sum + sj.processingTime + sj.setupTime, 0);
  const stage2TotalProcessing = state.completedJobs
    .filter((sj) => sj.stage === 2)
    .reduce((sum, sj) => sum + sj.processingTime + sj.setupTime, 0);

  const stage1Utilization =
    makespan > 0 ? stage1TotalProcessing / (makespan * STAGE1_MACHINES) : 0;
  const stage2Utilization =
    makespan > 0 ? stage2TotalProcessing / (makespan * STAGE2_MACHINES) : 0;

  return {
    jobs: state.completedJobs,
    makespan,
    totalTardiness,
    averageTardiness,
    setupCount,
    minorSetupCount,
    majorSetupCount,
    aoiSetupCount,
    utilization: {
      stage1: stage1Utilization,
      stage2: stage2Utilization,
    },
  };
}
