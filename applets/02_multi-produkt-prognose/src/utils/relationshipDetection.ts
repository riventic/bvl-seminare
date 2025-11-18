import type {
  Product,
  CorrelationMatrix,
  ProductRelationship,
  RelationshipType,
  RelationshipStrength
} from '../types';

/**
 * Classify relationship type based on correlation
 */
function classifyRelationshipType(correlation: number): RelationshipType {
  if (correlation > 0.3) {
    return 'complementary'; // Positive correlation = cross-selling
  } else if (correlation < -0.3) {
    return 'substitute'; // Negative correlation = cannibalization
  }
  return 'neutral';
}

/**
 * Classify relationship strength based on correlation magnitude
 */
function classifyRelationshipStrength(correlation: number): RelationshipStrength {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.4) return 'moderate';
  return 'weak';
}

/**
 * Detect significant relationships between products
 */
export function detectRelationships(
  correlationMatrix: CorrelationMatrix,
  products: Product[],
  minCorrelation: number
): ProductRelationship[] {
  const relationships: ProductRelationship[] = [];
  const n = products.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const correlation = correlationMatrix.matrix[i][j];

      // Only include relationships above threshold
      if (Math.abs(correlation) >= minCorrelation) {
        relationships.push({
          productA: products[i].id,
          productB: products[j].id,
          correlation,
          type: classifyRelationshipType(correlation),
          strength: classifyRelationshipStrength(correlation)
        });
      }
    }
  }

  // Sort by absolute correlation (strongest first)
  relationships.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return relationships;
}

/**
 * Get product name by ID
 */
export function getProductName(productId: string, products: Product[]): string {
  const product = products.find(p => p.id === productId);
  return product ? product.name : productId;
}
