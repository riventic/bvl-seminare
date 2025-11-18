import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import MultiProductForecasting from './pages/MultiProductForecasting';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MultiProductForecasting />
    </ThemeProvider>
  );
}
