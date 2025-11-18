import { Box, Container } from '@mui/material';
import TimeSeriesForecasting from './pages/TimeSeriesForecasting';

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <TimeSeriesForecasting />
      </Container>
    </Box>
  );
}
