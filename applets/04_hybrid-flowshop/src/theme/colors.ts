/**
 * Color palette for Hybrid Flowshop Scheduling
 */

// Base colors
const purple = {
  50: '#F3F2F9',
  100: '#E5E3F3',
  200: '#C5BFE5',
  300: '#A396DA',
  400: '#8B7FD7',
  500: '#6C5FC7', // Primary
  600: '#5A4DB3',
  700: '#4A3F9A',
};

const orange = {
  50: '#FFF5F0',
  100: '#FFE8DC',
  200: '#FFCDB3',
  300: '#FFB08A',
  400: '#FF9466',
  500: '#FF6B35', // Accent
  600: '#E65A28',
  700: '#CC4A1C',
};

const gray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

const success = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
};

const warning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
};

const error = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
};

const info = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
};

// Setup kit family colors (7+ distinct colors)
const familyColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E76F51', // Burnt Orange
  '#2A9D8F', // Dark Teal
];

// Status colors for machines and jobs
const statusColors = {
  idle: gray[400],
  running: success[500],
  setup: warning[500],
  completed: success[600],
  late: error[500],
  onTime: success[500],
  waiting: info[400],
};

export const colors = {
  purple,
  orange,
  gray,
  success,
  warning,
  error,
  info,
  familyColors,
  statusColors,
};

export type Colors = typeof colors;
