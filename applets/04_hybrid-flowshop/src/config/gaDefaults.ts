import type { GAConfig } from '@/types';

/**
 * Default GA configuration based on research best practices
 */
export const GA_DEFAULTS: GAConfig = {
  populationSize: 100,
  generations: 500,
  tournamentSize: 3,
  crossoverRate: 0.8,
  mutationRate: 0.2,
  mutationMethod: 'insert', // Insert is more effective than swap for scheduling
  elitismRate: 0.1, // 10% of population
  tardinessWeight: 0.5, // Balanced (will be overridden by slider)
  useAdaptive: false, // Disabled by default for simplicity
  adaptiveWindow: 10,
};

/**
 * Preset configurations for different scenarios
 */
export const GA_PRESETS = {
  fast: {
    ...GA_DEFAULTS,
    populationSize: 50,
    generations: 200,
  },
  balanced: {
    ...GA_DEFAULTS,
  },
  thorough: {
    ...GA_DEFAULTS,
    populationSize: 150,
    generations: 1000,
    useAdaptive: true,
  },
  adaptive: {
    ...GA_DEFAULTS,
    useAdaptive: true,
    mutationMethod: 'insert' as const,
  },
};
