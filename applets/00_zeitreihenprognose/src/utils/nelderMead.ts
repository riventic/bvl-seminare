// Simple Nelder-Mead optimization implementation
// Based on the simplex algorithm for unconstrained optimization

interface SimplexPoint {
  params: number[];
  value: number;
}

export function nelderMead(
  objectiveFunction: (params: number[]) => number,
  initialParams: number[],
  options: {
    maxIterations?: number;
    tolerance?: number;
    bounds?: { min: number; max: number }[];
  } = {}
): { params: number[]; value: number; iterations: number } {
  const maxIterations = options.maxIterations || 100;
  const tolerance = options.tolerance || 1e-6;
  const n = initialParams.length;

  // Nelder-Mead coefficients
  const alpha = 1.0; // reflection
  const gamma = 2.0; // expansion
  const rho = 0.5; // contraction
  const sigma = 0.5; // shrinkage

  // Enforce bounds if provided
  const enforceBounds = (params: number[]) => {
    if (!options.bounds) return params;
    return params.map((p, i) => {
      const bound = options.bounds![i];
      return Math.max(bound.min, Math.min(bound.max, p));
    });
  };

  // Initialize simplex with n+1 vertices
  const simplex: SimplexPoint[] = [];

  // First vertex is the initial point
  const initialValue = objectiveFunction(enforceBounds(initialParams));
  simplex.push({ params: [...initialParams], value: initialValue });

  // Create n additional vertices by perturbing each dimension
  for (let i = 0; i < n; i++) {
    const perturbedParams = [...initialParams];
    perturbedParams[i] += 0.1; // Small perturbation
    const boundedParams = enforceBounds(perturbedParams);
    const value = objectiveFunction(boundedParams);
    simplex.push({ params: boundedParams, value });
  }

  let iterations = 0;

  while (iterations < maxIterations) {
    // Sort simplex by function value (best to worst)
    simplex.sort((a, b) => a.value - b.value);

    const best = simplex[0];
    const worst = simplex[n];
    const secondWorst = simplex[n - 1];

    // Check convergence
    const range = worst.value - best.value;
    if (range < tolerance) {
      break;
    }

    // Calculate centroid (excluding worst point)
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += simplex[j].params[i];
      }
      centroid[i] = sum / n;
    }

    // Reflection
    const reflected = centroid.map((c, i) => c + alpha * (c - worst.params[i]));
    const boundedReflected = enforceBounds(reflected);
    const reflectedValue = objectiveFunction(boundedReflected);

    if (reflectedValue < best.value) {
      // Expansion
      const expanded = centroid.map((c, i) => c + gamma * (boundedReflected[i] - c));
      const boundedExpanded = enforceBounds(expanded);
      const expandedValue = objectiveFunction(boundedExpanded);

      if (expandedValue < reflectedValue) {
        simplex[n] = { params: boundedExpanded, value: expandedValue };
      } else {
        simplex[n] = { params: boundedReflected, value: reflectedValue };
      }
    } else if (reflectedValue < secondWorst.value) {
      simplex[n] = { params: boundedReflected, value: reflectedValue };
    } else {
      // Contraction
      if (reflectedValue < worst.value) {
        // Outside contraction
        const contracted = centroid.map((c, i) => c + rho * (boundedReflected[i] - c));
        const boundedContracted = enforceBounds(contracted);
        const contractedValue = objectiveFunction(boundedContracted);

        if (contractedValue < reflectedValue) {
          simplex[n] = { params: boundedContracted, value: contractedValue };
        } else {
          // Shrink
          shrinkSimplex();
        }
      } else {
        // Inside contraction
        const contracted = centroid.map((c, i) => c - rho * (c - worst.params[i]));
        const boundedContracted = enforceBounds(contracted);
        const contractedValue = objectiveFunction(boundedContracted);

        if (contractedValue < worst.value) {
          simplex[n] = { params: boundedContracted, value: contractedValue };
        } else {
          // Shrink
          shrinkSimplex();
        }
      }
    }

    function shrinkSimplex() {
      for (let i = 1; i <= n; i++) {
        simplex[i].params = simplex[i].params.map((p, j) => best.params[j] + sigma * (p - best.params[j]));
        simplex[i].params = enforceBounds(simplex[i].params);
        simplex[i].value = objectiveFunction(simplex[i].params);
      }
    }

    iterations++;
  }

  // Sort one final time and return best
  simplex.sort((a, b) => a.value - b.value);

  return {
    params: simplex[0].params,
    value: simplex[0].value,
    iterations,
  };
}
