import type {
  Job,
  Individual,
  GAConfig,
  GAResult,
  GAWorkerMessage,
  GAWorkerResponse,
} from '../types';
import { runSimulation } from '../utils/simulationCore';

/**
 * Evaluate fitness using REAL simulation engine with weighted average
 */
function evaluateFitness(
  jobs: Job[],
  sequence: number[],
  weight: number // 0.0 = pure makespan, 1.0 = pure tardiness
): { fitness: number; makespan: number; totalTardiness: number } {
  // Use the actual discrete event simulation
  const schedule = runSimulation(jobs, sequence);

  // Scaling factors for normalization (approximate typical values)
  const MAKESPAN_SCALE = 1; // Typical makespan range
  const TARDINESS_SCALE = 1; // Typical total tardiness range

  // Weighted average: (1-weight) for makespan, weight for tardiness
  const makespanWeight = 1 - weight;
  const tardinessWeight = weight;

  const normalizedMakespan = schedule.makespan / MAKESPAN_SCALE;
  const normalizedTardiness = schedule.totalTardiness / TARDINESS_SCALE;

  const fitness = makespanWeight * normalizedMakespan + tardinessWeight * normalizedTardiness;

  return {
    fitness,
    makespan: schedule.makespan,
    totalTardiness: schedule.totalTardiness,
  };
}

/**
 * Create initial population
 */
function createInitialPopulation(
  jobs: Job[],
  populationSize: number,
  tardinessWeight: number,
  initialSequence?: number[]
): Individual[] {
  const population: Individual[] = [];
  const baseSequence = jobs.map((j) => j.id);

  // Add initial sequence if provided
  if (initialSequence) {
    const { fitness, makespan, totalTardiness } = evaluateFitness(
      jobs,
      initialSequence,
      tardinessWeight
    );
    population.push({ chromosome: initialSequence, fitness, makespan, totalTardiness });
  }

  // Generate random individuals
  while (population.length < populationSize) {
    const chromosome = [...baseSequence];
    // Fisher-Yates shuffle
    for (let i = chromosome.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chromosome[i], chromosome[j]] = [chromosome[j], chromosome[i]];
    }

    const { fitness, makespan, totalTardiness } = evaluateFitness(
      jobs,
      chromosome,
      tardinessWeight
    );
    population.push({ chromosome, fitness, makespan, totalTardiness });
  }

  return population;
}

/**
 * Tournament selection
 */
function tournamentSelection(population: Individual[], tournamentSize: number): Individual {
  const tournament: Individual[] = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }
  return tournament.reduce((best, current) => (current.fitness < best.fitness ? current : best));
}

/**
 * Order crossover (OX)
 */
function orderCrossover(parent1: number[], parent2: number[]): number[] {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = Math.floor(Math.random() * (size - start)) + start;

  const child = Array(size).fill(-1);

  // Copy segment from parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }

  // Fill remaining from parent2
  let childIndex = (end + 1) % size;
  let parent2Index = (end + 1) % size;

  while (child.includes(-1)) {
    if (!child.includes(parent2[parent2Index])) {
      child[childIndex] = parent2[parent2Index];
      childIndex = (childIndex + 1) % size;
    }
    parent2Index = (parent2Index + 1) % size;
  }

  return child;
}

/**
 * Swap mutation
 */
function swapMutation(chromosome: number[]): number[] {
  const mutated = [...chromosome];
  const i = Math.floor(Math.random() * mutated.length);
  const j = Math.floor(Math.random() * mutated.length);
  [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
  return mutated;
}

/**
 * Insert mutation (more effective than swap for scheduling)
 */
function insertMutation(chromosome: number[]): number[] {
  const mutated = [...chromosome];
  const i = Math.floor(Math.random() * mutated.length);
  const j = Math.floor(Math.random() * mutated.length);
  const gene = mutated.splice(i, 1)[0];
  mutated.splice(j, 0, gene);
  return mutated;
}

/**
 * Hamming distance between two sequences
 */
function hammingDistance(seq1: number[], seq2: number[]): number {
  let distance = 0;
  const minLen = Math.min(seq1.length, seq2.length);
  for (let i = 0; i < minLen; i++) {
    if (seq1[i] !== seq2[i]) distance++;
  }
  return distance + Math.abs(seq1.length - seq2.length);
}

/**
 * Calculate population diversity
 */
function calculateDiversity(population: Individual[]): number {
  if (population.length < 2) return 0.5;

  // Fitness diversity
  const fitnesses = population.map((p) => p.fitness);
  const mean = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
  const variance =
    fitnesses.reduce((sum, f) => sum + (f - mean) ** 2, 0) / fitnesses.length;
  const std = Math.sqrt(variance);
  const fitnessDiversity = Math.min(1.0, std / (mean + 1e-10));

  // Chromosome diversity (sample for performance)
  const sampleSize = Math.min(20, population.length);
  const sample = population.slice(0, sampleSize);
  const distances: number[] = [];

  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      const dist = hammingDistance(sample[i].chromosome, sample[j].chromosome);
      distances.push(dist / sample[i].chromosome.length);
    }
  }

  const chromDiversity =
    distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0.5;

  return 0.4 * fitnessDiversity + 0.6 * chromDiversity;
}

/**
 * Detect stagnation in evolution
 */
function detectStagnation(fitnessHistory: number[], windowSize: number = 10): number {
  if (fitnessHistory.length < windowSize) return 0.0;

  const recent = fitnessHistory.slice(-windowSize);
  let improvements = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i] < recent[i - 1] * 0.999) {
      improvements++;
    }
  }

  return 1.0 - improvements / (windowSize - 1);
}

/**
 * Adapt mutation rate based on search state
 */
function adaptMutationRate(
  baseMutationRate: number,
  diversity: number,
  stagnation: number,
  progressRatio: number
): number {
  const diversityFactor = 1.5 - diversity;
  const stagnationFactor = 1.0 + 0.5 * stagnation;
  const progressFactor = 1.0 - 0.3 * progressRatio;

  const adapted = baseMutationRate * diversityFactor * stagnationFactor * progressFactor;
  return Math.max(0.01, Math.min(0.5, adapted));
}

/**
 * Run genetic algorithm
 */
function runGA(
  jobs: Job[],
  config: GAConfig,
  initialSequence?: number[],
  onProgress?: (generation: number, bestFitness: number, bestMakespan: number, bestTardiness: number, bestSequence: number[]) => void
): GAResult {
  const startTime = performance.now();

  let population = createInitialPopulation(
    jobs,
    config.populationSize,
    config.tardinessWeight,
    initialSequence
  );

  const fitnessHistory: number[] = [];
  let bestEver = population.reduce((best, current) =>
    current.fitness < best.fitness ? current : best
  );

  for (let generation = 0; generation < config.generations; generation++) {
    // Check cancellation request at start of each generation
    if (cancelRequested) {
      throw new Error('Optimization cancelled');
    }

    // Sort by fitness
    population.sort((a, b) => a.fitness - b.fitness);
    const currentBest = population[0];

    // Track improvements
    let improved = false;
    if (currentBest.fitness < bestEver.fitness) {
      bestEver = currentBest;
      improved = true;
    }

    fitnessHistory.push(currentBest.fitness);

    // Always report progress (counter updates every generation)
    if (onProgress) {
      onProgress(
        generation,
        bestEver.fitness,
        bestEver.makespan,
        bestEver.totalTardiness,
        improved ? bestEver.chromosome : bestEver.chromosome  // Always send for simplicity
      );
    }

    // Adaptive parameter control
    let adaptedMutationRate = config.mutationRate;
    if (config.useAdaptive && generation > 0) {
      const diversity = calculateDiversity(population);
      const stagnation = detectStagnation(fitnessHistory, config.adaptiveWindow);
      const progressRatio = generation / config.generations;
      adaptedMutationRate = adaptMutationRate(
        config.mutationRate,
        diversity,
        stagnation,
        progressRatio
      );
    }

    // Create next generation
    const newPopulation: Individual[] = [];

    // Elitism (percentage-based)
    const eliteCount = Math.max(1, Math.floor(config.populationSize * config.elitismRate));
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(population[i]);
    }

    // Generate offspring
    while (newPopulation.length < config.populationSize) {
      const parent1 = tournamentSelection(population, config.tournamentSize);
      const parent2 = tournamentSelection(population, config.tournamentSize);

      let offspring: number[];
      if (Math.random() < config.crossoverRate) {
        offspring = orderCrossover(parent1.chromosome, parent2.chromosome);
      } else {
        offspring = [...parent1.chromosome];
      }

      if (Math.random() < adaptedMutationRate) {
        offspring =
          config.mutationMethod === 'insert'
            ? insertMutation(offspring)
            : swapMutation(offspring);
      }

      const { fitness, makespan, totalTardiness } = evaluateFitness(
        jobs,
        offspring,
        config.tardinessWeight
      );
      newPopulation.push({ chromosome: offspring, fitness, makespan, totalTardiness });
    }

    population = newPopulation;
  }

  const endTime = performance.now();

  // Calculate improvement
  const initialFitness = fitnessHistory[0];
  const finalFitness = bestEver.fitness;
  const improvement = ((initialFitness - finalFitness) / initialFitness) * 100;

  return {
    bestIndividual: bestEver,
    bestSequence: bestEver.chromosome,
    makespan: bestEver.makespan,
    totalTardiness: bestEver.totalTardiness,
    improvement,
    generationsRun: config.generations,
    executionTime: endTime - startTime,
    fitnessHistory,
  };
}

// Web Worker message handler
let cancelRequested = false;

self.onmessage = (event: MessageEvent<GAWorkerMessage>) => {
  const message = event.data;

  if (message.type === 'CANCEL') {
    cancelRequested = true;
    return;
  }

  if (message.type === 'START') {
    cancelRequested = false;

    try {
      const result = runGA(
        message.jobs,
        message.config,
        message.initialSequence,
        (generation, bestFitness, bestMakespan, bestTardiness, bestSequence) => {
          if (cancelRequested) {
            throw new Error('Optimization cancelled');
          }

          const response: GAWorkerResponse = {
            type: 'PROGRESS',
            generation,
            bestFitness,
            bestMakespan,
            bestTardiness,
            bestSequence,
          };
          self.postMessage(response);
        }
      );

      const response: GAWorkerResponse = {
        type: 'COMPLETE',
        result,
      };
      self.postMessage(response);
    } catch (error) {
      const response: GAWorkerResponse = {
        type: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      self.postMessage(response);
    }
  }
};
