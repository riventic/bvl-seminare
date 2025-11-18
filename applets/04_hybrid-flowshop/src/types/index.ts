/**
 * Type definitions for Hybrid Flowshop Scheduling
 */

/**
 * Job data from Excel file
 */
export interface Job {
  id: number;
  dueDate: number;
  family: number; // Setup kit type
  t_smd: number; // Processing time for Stage 1 (SMD)
  t_aoi: number; // Processing time for Stage 2 (AOI)
}

/**
 * Machine in a stage
 */
export interface Machine {
  id: number;
  stage: 1 | 2; // Stage 1 (SMD) or Stage 2 (AOI)
  currentSetupKit: number | null; // Currently equipped setup kit (family)
  availableAt: number; // Time when machine becomes available
  currentJob: number | null; // Current job being processed
}

/**
 * Setup kit (family) state
 */
export interface SetupKit {
  family: number; // Family/kit type
  currentMachine: number | null; // Which machine has this kit (null if available)
  inTransit: boolean; // Is the kit being moved between machines?
  availableAt: number; // When the kit becomes available
}

/**
 * Scheduled job on a machine
 */
export interface ScheduledJob {
  jobId: number;
  machineId: number;
  stage: 1 | 2;
  startTime: number;
  endTime: number;
  setupTime: number; // Setup time required (0, 20, 25, or 65 minutes)
  setupType?: 'none' | 'minor' | 'major' | 'aoi'; // Type of setup
  setupStartTime: number | null; // When setup starts (if required)
  processingTime: number;
  family: number;
  isLate: boolean; // Did it miss the due date?
  tardiness: number; // How late (0 if on time)
}

/**
 * Complete schedule
 */
export interface Schedule {
  jobs: ScheduledJob[];
  makespan: number; // Total time to complete all jobs
  totalTardiness: number; // Sum of all tardiness
  averageTardiness: number;
  setupCount: number; // Total number of setups
  minorSetupCount: number; // SMD minor setups (20 min)
  majorSetupCount: number; // SMD major setups (65 min)
  aoiSetupCount: number; // AOI setups (25 min)
  utilization: {
    stage1: number; // Average utilization of Stage 1 machines (0-1)
    stage2: number; // Average utilization of Stage 2 machines (0-1)
  };
}

/**
 * Simulation event
 */
export type EventType =
  | 'SETUP_START'
  | 'SETUP_END'
  | 'JOB_START'
  | 'JOB_END'
  | 'STAGE1_COMPLETE'
  | 'SIMULATION_END';

export interface SimulationEvent {
  type: EventType;
  time: number;
  jobId?: number;
  machineId?: number;
  stage?: 1 | 2;
  setupKit?: number;
}

/**
 * Simulation state
 */
export interface SimulationState {
  currentTime: number;
  machines: Machine[];
  setupKits: SetupKit[];
  stage1Queue: number[]; // Job IDs waiting for Stage 1
  stage2Queue: number[]; // Job IDs waiting for Stage 2
  completedJobs: number[]; // Completed job IDs
  scheduledJobs: ScheduledJob[];
  events: SimulationEvent[];
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // Simulation speed multiplier
}

/**
 * Job ordering configuration
 */
export interface JobOrdering {
  stage1: number[]; // Order of jobs for Stage 1
  stage2: number[]; // Order of jobs for Stage 2 (usually FIFO from Stage 1)
}

/**
 * Genetic Algorithm individual
 */
export interface Individual {
  chromosome: number[]; // Job sequence for Stage 1
  fitness: number; // Lower is better (makespan + weighted tardiness)
  makespan: number;
  totalTardiness: number;
}

/**
 * Genetic Algorithm configuration
 */
export interface GAConfig {
  populationSize: number;
  generations: number;
  tournamentSize: number;
  crossoverRate: number;
  mutationRate: number;
  mutationMethod: 'swap' | 'insert';
  elitismRate: number; // Percentage of population to preserve as elites (0.05-0.3)
  tardinessWeight: number; // Weight for tardiness in fitness function (0-1)
  useAdaptive: boolean; // Enable adaptive parameter control
  adaptiveWindow: number; // Window size for stagnation detection
}

/**
 * Genetic Algorithm result
 */
export interface GAResult {
  bestIndividual: Individual;
  bestSequence: number[];
  makespan: number;
  totalTardiness: number;
  improvement: number; // Percentage improvement over initial
  generationsRun: number;
  executionTime: number; // milliseconds
  fitnessHistory: number[]; // Best fitness per generation
}

/**
 * Web Worker message for GA optimization
 */
export interface GAWorkerMessage {
  type: 'START' | 'CANCEL';
  jobs: Job[];
  config: GAConfig;
  initialSequence?: number[];
}

/**
 * Web Worker response from GA
 */
export interface GAWorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR';
  generation?: number;
  bestFitness?: number;
  bestMakespan?: number;
  bestTardiness?: number;
  bestSequence?: number[];
  result?: GAResult;
  error?: string;
}

/**
 * Statistics for display
 */
export interface Statistics {
  makespan: number;
  totalTardiness: number;
  averageTardiness: number;
  completedJobs: number;
  totalJobs: number;
  setupCount: number;
  minorSetupCount: number;
  majorSetupCount: number;
  aoiSetupCount: number;
  utilization: {
    stage1: number;
    stage2: number;
  };
  onTimeJobs: number;
  lateJobs: number;
}

/**
 * Scheduling heuristic type
 */
export type SchedulingHeuristic =
  | 'MANUAL' // User-defined order
  | 'FIFO' // First In First Out
  | 'EDD' // Earliest Due Date
  | 'SPT' // Shortest Processing Time
  | 'FAMILY_GROUP' // Group by family to minimize setups
  | 'GENETIC'; // Genetic algorithm optimization
