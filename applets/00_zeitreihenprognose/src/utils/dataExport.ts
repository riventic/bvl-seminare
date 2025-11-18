import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { DataPoint, ForecastPoint } from '../types';

// Export data to CSV
export function exportToCSV(
  historicalData: DataPoint[],
  forecastData: ForecastPoint[]
): void {
  const rows: string[] = [];

  // Header
  rows.push('Datum,Historische Daten,Prognose,Obere Grenze,Untere Grenze');

  // Historical data
  for (const point of historicalData) {
    const dateStr = format(point.date, 'dd.MM.yyyy', { locale: de });
    rows.push(`${dateStr},${point.value},,,`);
  }

  // Forecast data
  for (const point of forecastData) {
    const dateStr = format(point.date, 'dd.MM.yyyy', { locale: de });
    rows.push(`${dateStr},,${point.value},${point.upperBound || ''},${point.lowerBound || ''}`);
  }

  const csv = rows.join('\n');

  // Create download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `zeitreihenprognose_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export data to Excel
export function exportToExcel(
  historicalData: DataPoint[],
  forecastData: ForecastPoint[]
): void {
  const data: any[] = [];

  // Add historical data
  for (const point of historicalData) {
    data.push({
      Datum: format(point.date, 'dd.MM.yyyy', { locale: de }),
      'Historische Daten': point.value,
      Prognose: null,
      'Obere Grenze': null,
      'Untere Grenze': null,
    });
  }

  // Add forecast data
  for (const point of forecastData) {
    data.push({
      Datum: format(point.date, 'dd.MM.yyyy', { locale: de }),
      'Historische Daten': null,
      Prognose: point.value,
      'Obere Grenze': point.upperBound || null,
      'Untere Grenze': point.lowerBound || null,
    });
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Datum
    { wch: 18 }, // Historische Daten
    { wch: 12 }, // Prognose
    { wch: 15 }, // Obere Grenze
    { wch: 15 }, // Untere Grenze
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Zeitreihenprognose');

  // Download
  XLSX.writeFile(workbook, `zeitreihenprognose_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
