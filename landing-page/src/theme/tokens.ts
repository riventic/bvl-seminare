export const spacing = {
  0: 0,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
  16: 128,
  20: 160,
  24: 192,
}

export const space = (multiplier: number): number => {
  return multiplier * 8
}

export const tokens = {
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    full: 9999,
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
    sm: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    hover: '0 8px 16px -4px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.1)',
    modal: '0 24px 48px -12px rgba(0,0,0,0.25)',
  },
  transition: {
    fast: 'all 150ms ease-out',
    normal: 'all 200ms ease-out',
    slow: 'all 300ms ease-out',
  },
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
}
