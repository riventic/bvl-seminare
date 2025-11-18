import * as XLSX from 'xlsx';
import type { Job } from '@/types';

/**
 * Parse Excel file and extract job data
 */
export async function parseExcelFile(file: File): Promise<Job[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('No data read from file');
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json<{
          id: number;
          'due date': number;
          family: number;
          t_smd: number;
          t_aoi: number;
        }>(worksheet);

        // Transform to Job objects
        const jobs: Job[] = jsonData.map((row) => ({
          id: row.id,
          dueDate: row['due date'],
          family: row.family,
          t_smd: row.t_smd,
          t_aoi: row.t_aoi,
        }));

        // Validate jobs
        const invalidJobs = jobs.filter(
          (job) =>
            !job.id ||
            job.dueDate === undefined ||
            job.family === undefined ||
            job.t_smd === undefined ||
            job.t_aoi === undefined
        );

        if (invalidJobs.length > 0) {
          console.warn('Invalid jobs found:', invalidJobs);
        }

        resolve(jobs);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Load Excel file from public directory
 */
export async function loadDefaultExcelFile(): Promise<Job[]> {
  try {
    const response = await fetch('./input.xlsx');
    if (!response.ok) {
      throw new Error('Failed to load input.xlsx');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json<{
      id: number;
      'due date': number;
      family: number;
      t_smd: number;
      t_aoi: number;
    }>(worksheet);

    // Transform to Job objects
    const jobs: Job[] = jsonData.map((row) => ({
      id: row.id,
      dueDate: row['due date'],
      family: row.family,
      t_smd: row.t_smd,
      t_aoi: row.t_aoi,
    }));

    return jobs;
  } catch (error) {
    console.error('Error loading default Excel file:', error);
    throw error;
  }
}

/**
 * Get unique families (setup kit types) from jobs
 */
export function getUniqueFamilies(jobs: Job[]): number[] {
  const families = new Set(jobs.map((job) => job.family));
  return Array.from(families).sort((a, b) => a - b);
}

/**
 * Validate job data
 */
export function validateJobs(jobs: Job[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (jobs.length === 0) {
    errors.push('No jobs found in data');
  }

  jobs.forEach((job, index) => {
    if (!job.id) {
      errors.push(`Job at index ${index} has no ID`);
    }
    if (job.dueDate === undefined || job.dueDate < 0) {
      errors.push(`Job ${job.id} has invalid due date`);
    }
    if (job.family === undefined) {
      errors.push(`Job ${job.id} has no family`);
    }
    if (job.t_smd === undefined || job.t_smd <= 0) {
      errors.push(`Job ${job.id} has invalid t_smd`);
    }
    if (job.t_aoi === undefined || job.t_aoi <= 0) {
      errors.push(`Job ${job.id} has invalid t_aoi`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
