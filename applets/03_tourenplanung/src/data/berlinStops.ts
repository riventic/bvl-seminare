/**
 * Real Berlin landmarks as delivery stops
 */
import type { Stop } from '../types';

export const berlinStops: Stop[] = [
  {
    id: '1',
    name: 'Brandenburger Tor',
    address: 'Pariser Platz, 10117 Berlin',
    location: [52.5163, 13.3777],
  },
  {
    id: '2',
    name: 'Alexanderplatz',
    address: 'Alexanderplatz, 10178 Berlin',
    location: [52.5219, 13.4132],
  },
  {
    id: '3',
    name: 'Reichstagsgebäude',
    address: 'Platz der Republik 1, 11011 Berlin',
    location: [52.5186, 13.3761],
  },
  {
    id: '4',
    name: 'Berliner Dom',
    address: 'Am Lustgarten, 10178 Berlin',
    location: [52.5191, 13.4009],
  },
  {
    id: '5',
    name: 'Potsdamer Platz',
    address: 'Potsdamer Platz, 10785 Berlin',
    location: [52.5096, 13.3750],
  },
  {
    id: '6',
    name: 'Checkpoint Charlie',
    address: 'Friedrichstraße 43-45, 10969 Berlin',
    location: [52.5075, 13.3903],
  },
  {
    id: '7',
    name: 'Gendarmenmarkt',
    address: 'Gendarmenmarkt, 10117 Berlin',
    location: [52.5134, 13.3926],
  },
  {
    id: '8',
    name: 'Museumsinsel',
    address: 'Bodestraße, 10178 Berlin',
    location: [52.5211, 13.3975],
  },
  {
    id: '9',
    name: 'East Side Gallery',
    address: 'Mühlenstraße, 10243 Berlin',
    location: [52.5058, 13.4394],
  },
  {
    id: '10',
    name: 'Kurfürstendamm',
    address: 'Kurfürstendamm, 10719 Berlin',
    location: [52.5048, 13.2981],
  },
  {
    id: '11',
    name: 'Fernsehturm',
    address: 'Panoramastraße 1A, 10178 Berlin',
    location: [52.5208, 13.4094],
  },
  {
    id: '12',
    name: 'Charlottenburg Schloss',
    address: 'Spandauer Damm 10-22, 14059 Berlin',
    location: [52.5208, 13.2957],
  },
];

/**
 * Get a random subset of stops
 */
export function getRandomStops(count: number = 10): Stop[] {
  const shuffled = [...berlinStops].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, berlinStops.length));
}

/**
 * Get the geographic center of Berlin stops
 */
export function getBerlinCenter(): [number, number] {
  return [52.5200, 13.4050]; // Center of Berlin
}
