/**
 * App - Root component
 */
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import TourPlanning from './pages/TourPlanning';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TourPlanning />
    </ThemeProvider>
  );
}
