/**
 * Nelder-Mead Simplex Algorithm for function minimization
 * A derivative-free optimization method that works well for non-smooth functions
 */

export interface NelderMeadOptions {
  maxIterations?: number;
  tolerance?: number;
  adaptiveParameters?: boolean;
  randomRestarts?: number;
}

export interface NelderMeadResult {
  params: number[];
  value: number;
  iterations: number;
  converged: boolean;
}

interface Bounds {
  min: number[];
  max: number[];
}

/**
 * Clamp parameters to bounds
 */
function clampToBounds(params: number[], bounds?: Bounds): number[] {
  if (!bounds) return params;

  return params.map((p, i) => {
    const min = bounds.min[i];
    const max = bounds.max[i];
    return Math.max(min, Math.min(max, p));
  });
}

/**
 * Calculate centroid of all points except the worst
 */
function calculateCentroid(simplex: number[][], excludeIndex: number): number[] {
  const n = simplex[0].length;
  const centroid = new Array(n).fill(0);

  for (let i = 0; i < simplex.length; i++) {
    if (i === excludeIndex) continue;
    for (let j = 0; j < n; j++) {
      centroid[j] += simplex[i][j];
    }
  }

  const count = simplex.length - 1;
  return centroid.map(val => val / count);
}

/**
 * Generate random initial parameters within bounds
 */
function generateRandomParams(bounds: Bounds): number[] {
  const params: number[] = [];
  for (let i = 0; i < bounds.min.length; i++) {
    const min = bounds.min[i];
    const max = bounds.max[i];
    params.push(min + Math.random() * (max - min));
  }
  return params;
}

/**
 * Single run of Nelder-Mead optimization algorithm
 */
function nelderMeadSingleRun(
  objectiveFunction: (params: number[]) => number,
  initialParams: number[],
  bounds?: Bounds,
  maxIterations: number = 200,
  tolerance: number = 1e-6
): NelderMeadResult {

  const n = initialParams.length;

  // Nelder-Mead coefficients
  const alpha = 1.0;   // Reflection
  const gamma = 2.0;   // Expansion
  const rho = 0.5;     // Contraction
  const sigma = 0.5;   // Shrink

  // Initialize simplex: n+1 points
  const simplex: number[][] = [clampToBounds(initialParams, bounds)];

  // Create initial simplex by perturbing each parameter
  for (let i = 0; i < n; i++) {
    const point = [...initialParams];
    const step = Math.abs(point[i]) * 0.05 || 0.05; // 5% perturbation
    point[i] += step;
    simplex.push(clampToBounds(point, bounds));
  }

  // Evaluate objective function at each simplex point
  let values = simplex.map(point => objectiveFunction(point));

  let iteration = 0;
  let converged = false;

  while (iteration < maxIterations && !converged) {
    iteration++;

    // Sort simplex by objective value (ascending)
    const indices = values.map((_, i) => i).sort((a, b) => values[a] - values[b]);
    const sortedSimplex = indices.map(i => simplex[i]);
    const sortedValues = indices.map(i => values[i]);

    // Update simplex and values
    simplex.splice(0, simplex.length, ...sortedSimplex);
    values = sortedValues;

    // Check convergence: range of function values
    const range = values[n] - values[0];
    if (range < tolerance) {
      converged = true;
      break;
    }

    // Calculate centroid of all points except worst
    const centroid = calculateCentroid(simplex, n);

    // 1. Reflection
    const reflected = centroid.map((c, i) => c + alpha * (c - simplex[n][i]));
    const reflectedClamped = clampToBounds(reflected, bounds);
    const reflectedValue = objectiveFunction(reflectedClamped);

    if (reflectedValue >= values[0] && reflectedValue < values[n - 1]) {
      // Accept reflected point
      simplex[n] = reflectedClamped;
      values[n] = reflectedValue;
      continue;
    }

    // 2. Expansion (if reflected is best so far)
    if (reflectedValue < values[0]) {
      const expanded = centroid.map((c, i) => c + gamma * (reflectedClamped[i] - c));
      const expandedClamped = clampToBounds(expanded, bounds);
      const expandedValue = objectiveFunction(expandedClamped);

      if (expandedValue < reflectedValue) {
        simplex[n] = expandedClamped;
        values[n] = expandedValue;
      } else {
        simplex[n] = reflectedClamped;
        values[n] = reflectedValue;
      }
      continue;
    }

    // 3. Contraction
    if (reflectedValue >= values[n - 1]) {
      let contracted: number[];

      if (reflectedValue < values[n]) {
        // Outside contraction
        contracted = centroid.map((c, i) => c + rho * (reflectedClamped[i] - c));
      } else {
        // Inside contraction
        contracted = centroid.map((c, i) => c + rho * (simplex[n][i] - c));
      }

      const contractedClamped = clampToBounds(contracted, bounds);
      const contractedValue = objectiveFunction(contractedClamped);

      if (contractedValue < values[n]) {
        simplex[n] = contractedClamped;
        values[n] = contractedValue;
        continue;
      }
    }

    // 4. Shrink all points toward best point
    for (let i = 1; i <= n; i++) {
      simplex[i] = simplex[i].map((val, j) => simplex[0][j] + sigma * (val - simplex[0][j]));
      simplex[i] = clampToBounds(simplex[i], bounds);
      values[i] = objectiveFunction(simplex[i]);
    }
  }

  // Return best point
  const bestIndex = values.indexOf(Math.min(...values));

  return {
    params: simplex[bestIndex],
    value: values[bestIndex],
    iterations: iteration,
    converged
  };
}

/**
 * Nelder-Mead optimization with random restarts
 *
 * @param objectiveFunction - Function to minimize f(params) -> value
 * @param initialParams - Starting parameter values
 * @param bounds - Optional parameter bounds {min: [], max: []}
 * @param options - Algorithm options
 * @returns Best optimized parameters across all restarts
 */
export function nelderMead(
  objectiveFunction: (params: number[]) => number,
  initialParams: number[],
  bounds?: Bounds,
  options: NelderMeadOptions = {}
): NelderMeadResult {
  const {
    maxIterations = 200,
    tolerance = 1e-6,
    randomRestarts = 15
  } = options;

  let bestResult: NelderMeadResult | null = null;

  // First run: start from initial parameters (user's current values)
  const firstResult = nelderMeadSingleRun(
    objectiveFunction,
    initialParams,
    bounds,
    maxIterations,
    tolerance
  );
  bestResult = firstResult;

  // Random restarts: try different starting points
  if (randomRestarts > 0 && bounds) {
    for (let restart = 0; restart < randomRestarts; restart++) {
      const randomStart = generateRandomParams(bounds);
      const result = nelderMeadSingleRun(
        objectiveFunction,
        randomStart,
        bounds,
        maxIterations,
        tolerance
      );

      // Keep best result
      if (result.value < bestResult.value) {
        bestResult = result;
      }
    }
  }

  return bestResult;
}
