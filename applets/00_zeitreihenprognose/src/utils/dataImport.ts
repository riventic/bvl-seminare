import * as XLSX from 'xlsx';
import { parse } from 'date-fns';
import type { DataPoint } from '../types';

export interface ImportResult {
  success: boolean;
  data?: DataPoint[];
  error?: string;
}

// Parse CSV file
export function parseCSV(csvText: string): ImportResult {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, error: 'CSV-Datei ist leer oder hat zu wenige Zeilen' };
    }

    const headers = lines[0].split(/[,;]/);
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('datum'));
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes('value') || h.toLowerCase().includes('wert') || h.toLowerCase().includes('absatz'));

    if (dateIndex === -1 || valueIndex === -1) {
      return { success: false, error: 'Spalten "Datum" und "Wert" nicht gefunden' };
    }

    const data: DataPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(/[,;]/);
      if (cells.length < 2) continue;

      const dateStr = cells[dateIndex].trim();
      const valueStr = cells[valueIndex].trim();

      // Try to parse date
      let date: Date;
      try {
        // Try ISO format first
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          // Try DD.MM.YYYY format
          date = parse(dateStr, 'dd.MM.yyyy', new Date());
        }
        if (isNaN(date.getTime())) {
          // Try DD/MM/YYYY format
          date = parse(dateStr, 'dd/MM/yyyy', new Date());
        }
      } catch {
        continue; // Skip invalid dates
      }

      const value = parseFloat(valueStr);
      if (isNaN(value)) continue;

      data.push({ date, value });
    }

    if (data.length < 10) {
      return { success: false, error: 'Zu wenige gültige Datenpunkte (mindestens 10 erforderlich)' };
    }

    // Sort by date
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Fehler beim Parsen der CSV-Datei' };
  }
}

// Parse Excel file
export function parseExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length < 2) {
          resolve({ success: false, error: 'Excel-Datei ist leer oder hat zu wenige Zeilen' });
          return;
        }

        const dataPoints: DataPoint[] = [];

        for (const row of jsonData as any[]) {
          // Find date and value fields (case-insensitive)
          const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('datum'));
          const valueKey = Object.keys(row).find(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('wert') || k.toLowerCase().includes('absatz'));

          if (!dateKey || !valueKey) continue;

          let date: Date;
          const dateValue = row[dateKey];

          // Handle Excel serial dates
          if (typeof dateValue === 'number') {
            date = XLSX.SSF.parse_date_code(dateValue);
          } else {
            date = new Date(dateValue);
          }

          if (isNaN(date.getTime())) continue;

          const value = parseFloat(row[valueKey]);
          if (isNaN(value)) continue;

          dataPoints.push({ date, value });
        }

        if (dataPoints.length < 10) {
          resolve({ success: false, error: 'Zu wenige gültige Datenpunkte (mindestens 10 erforderlich)' });
          return;
        }

        // Sort by date
        dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

        resolve({ success: true, data: dataPoints });
      } catch (error) {
        resolve({ success: false, error: 'Fehler beim Parsen der Excel-Datei' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Fehler beim Lesen der Datei' });
    };

    reader.readAsArrayBuffer(file);
  });
}

// Main import function
export async function importData(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return parseCSV(text);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else {
    return { success: false, error: 'Nicht unterstütztes Dateiformat. Verwenden Sie CSV oder Excel (.xlsx)' };
  }
}
