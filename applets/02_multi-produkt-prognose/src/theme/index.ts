import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.purple[500],
      light: colors.purple[300],
      dark: colors.purple[700],
    },
    secondary: {
      main: colors.orange[500],
      light: colors.orange[300],
      dark: colors.orange[700],
    },
    error: {
      main: colors.error[500],
    },
    warning: {
      main: colors.warning[500],
    },
    info: {
      main: colors.info[500],
    },
    success: {
      main: colors.success[500],
    },
    grey: colors.gray,
    background: {
      default: colors.gray[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.gray[700],
      secondary: colors.gray[500],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: 36,
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: 30,
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 13,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 11,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.gray[200]}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;

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
};

export const space = (multiplier: number) => multiplier * 8;
