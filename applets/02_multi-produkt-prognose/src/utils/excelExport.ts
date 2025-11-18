import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { ExportData } from '../types';

/**
 * Export all data to Excel file
 */
export function exportToExcel(data: ExportData): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Historical Data
  const historicalRows = data.historicalData.map(point => {
    const row: any = {
      Datum: format(point.date, 'dd.MM.yyyy', { locale: de })
    };
    data.products.forEach(product => {
      row[product.name] = point.values[product.id] || 0;
    });
    return row;
  });
  const historicalSheet = XLSX.utils.json_to_sheet(historicalRows);
  XLSX.utils.book_append_sheet(workbook, historicalSheet, 'Historische Daten');

  // Sheet 2: Forecasts
  const forecastRows = data.forecastData.map(point => {
    const row: any = {
      Datum: format(point.date, 'dd.MM.yyyy', { locale: de })
    };
    data.products.forEach(product => {
      row[product.name] = point.values[product.id] || 0;
      row[`${product.name} (Oben)`] = point.upperBounds?.[product.id] || 0;
      row[`${product.name} (Unten)`] = point.lowerBounds?.[product.id] || 0;
    });
    return row;
  });
  const forecastSheet = XLSX.utils.json_to_sheet(forecastRows);
  XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Prognosen');

  // Sheet 3: Correlation Matrix
  const correlationRows = data.correlationMatrix.productIds.map((productIdA, i) => {
    const row: any = {
      Produkt: data.products.find(p => p.id === productIdA)?.name || productIdA
    };
    data.correlationMatrix.productIds.forEach((productIdB, j) => {
      const productName = data.products.find(p => p.id === productIdB)?.name || productIdB;
      row[productName] = data.correlationMatrix.matrix[i][j].toFixed(3);
    });
    return row;
  });
  const correlationSheet = XLSX.utils.json_to_sheet(correlationRows);
  XLSX.utils.book_append_sheet(workbook, correlationSheet, 'Korrelationsmatrix');

  // Sheet 4: Relationships
  const relationshipRows = data.relationships.map(rel => ({
    'Produkt A': data.products.find(p => p.id === rel.productA)?.name || rel.productA,
    'Produkt B': data.products.find(p => p.id === rel.productB)?.name || rel.productB,
    'Korrelation': rel.correlation.toFixed(3),
    'Typ': rel.type === 'complementary' ? 'Komplementär' : rel.type === 'substitute' ? 'Substitut' : 'Neutral',
    'Stärke': rel.strength === 'strong' ? 'Stark' : rel.strength === 'moderate' ? 'Mittel' : 'Schwach'
  }));
  const relationshipSheet = XLSX.utils.json_to_sheet(relationshipRows);
  XLSX.utils.book_append_sheet(workbook, relationshipSheet, 'Produkt-Beziehungen');

  // Download file
  XLSX.writeFile(workbook, 'multi-produkt-prognose.xlsx');
}
