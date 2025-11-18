import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Grid, Card, Slider, Paper, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type {
  Job,
  Schedule,
  GAConfig,
  GAWorkerMessage,
  GAWorkerResponse,
} from './types';
import { loadDefaultExcelFile } from './utils/dataParser';
import { runSimulation, applyHeuristic } from './utils/simulator';
import GanttChartSVG from './components/GanttChartSVG';
import FactoryFloor from './components/FactoryFloor';
import JobQueue from './components/JobQueue';
import GAConfigDialog from './components/GAConfigDialog';
import { colors } from './theme';
import { Zap } from 'lucide-react';
import { GA_DEFAULTS } from './config/gaDefaults';

export default function App() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSequence, setJobSequence] = useState<number[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState<{
    generation: number;
    total: number;
    bestFitness: number;
    bestMakespan: number;
    bestTardiness: number;
  } | null>(null);
  const [optimizationWeight, setOptimizationWeight] = useState(50); // 0-100 slider
  const [gaConfig, setGaConfig] = useState<GAConfig>({
    ...GA_DEFAULTS,
    tardinessWeight: 0.5,
  });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-run simulation when job sequence or jobs change
  useEffect(() => {
    if (jobs.length === 0) return;

    try {
      const newSchedule = runSimulation(jobs, jobSequence);
      setSchedule(newSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.simulationFailed'));
    }
  }, [jobs, jobSequence, t]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedJobs = await loadDefaultExcelFile();
      setJobs(loadedJobs);
      const initialSequence = loadedJobs.map((j) => j.id);
      setJobSequence(initialSequence);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleHeuristicChange = (heuristic: string) => {
    if (heuristic !== 'MANUAL') {
      const newSequence = applyHeuristic(jobs, heuristic);
      setJobSequence(newSequence);
    }
  };

  const handleCancelOptimization = () => {
    if (workerRef.current) {
      // Send cancel message
      const message: GAWorkerMessage = {
        type: 'CANCEL',
        jobs: [],
        config: {} as GAConfig,
      };
      workerRef.current.postMessage(message);

      // Immediately terminate the worker
      workerRef.current.terminate();

      // Clear reference so new worker created next time
      workerRef.current = null;
    }

    setIsOptimizing(false);
    setOptimizationProgress(null);
  };

  const handleOptimizeWithConfig = (config: GAConfig) => {
    // Update config with current weight from slider
    const finalConfig = { ...config, tardinessWeight: optimizationWeight / 100 };
    setGaConfig(finalConfig);

    // Terminate old worker if exists to avoid state carryover
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Always create fresh worker
    workerRef.current = new Worker(new URL('./workers/gaWorker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event: MessageEvent<GAWorkerResponse>) => {
      const response = event.data;

      if (response.type === 'PROGRESS') {
        // Always update counter and metrics
        setOptimizationProgress({
          generation: response.generation || 0,
          total: 500,
          bestFitness: response.bestFitness || 0,
          bestMakespan: response.bestMakespan || 0,
          bestTardiness: response.bestTardiness || 0,
        });

        // Only update UI sequence when improvement found
        if (response.bestSequence) {
          setJobSequence(response.bestSequence);
          // This triggers useEffect which runs simulation and updates Gantt/UI
        }
      } else if (response.type === 'COMPLETE') {
        setIsOptimizing(false);
        setOptimizationProgress(null);

        if (response.result) {
          setJobSequence(response.result.bestSequence);
          // Simulation will auto-run via useEffect
        }
      } else if (response.type === 'ERROR') {
        setIsOptimizing(false);
        setOptimizationProgress(null);
        setError(response.error || t('errors.optimizationFailed'));
      }
    };

    const message: GAWorkerMessage = {
      type: 'START',
      jobs,
      config: finalConfig,
      initialSequence: jobSequence,
    };

    setIsOptimizing(true);
    workerRef.current.postMessage(message);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {t('app.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('app.subtitle')}
          </Typography>

          {/* Documentation */}
          <Box sx={{ mt: 3, p: 2, bgcolor: colors.gray[50], borderRadius: 1 }}>
            <Typography variant="body2" paragraph>
              Diese Anwendung simuliert ein <strong>Hybrid Flowshop Scheduling Problem</strong> aus der
              Leiterplattenproduktion. Jeder Job durchläuft zwei Fertigungsstufen: SMD (Surface Mount Device)
              und AOI (Automated Optical Inspection). Die Herausforderung besteht darin, die optimale
              Job-Reihenfolge zu finden, um Gesamtdauer und Verspätungen zu minimieren.
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              Fertigungsumgebung
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Stufe 1 (SMD):</strong> 4 parallele Maschinen bestücken Leiterplatten mit
              elektronischen Bauteilen. Jede Produktfamilie benötigt ein spezielles Rüstkit. Es kann immer
              nur EIN Kit an EINER Maschine gleichzeitig sein.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Stufe 2 (AOI):</strong> 5 parallele Maschinen prüfen die Bestückungsqualität optisch.
              Jeder Job benötigt eine 25-minütige Rüstzeit, unabhängig von vorherigen Jobs.
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              Rüstzeiten & Constraints
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>SMD Kleinrüsten (20 min):</strong> Wenn das benötigte Rüstkit frei verfügbar ist
                </li>
                <li>
                  <strong>SMD Großrüsten (65 min):</strong> Wenn das Rüstkit von einer anderen Maschine
                  geholt werden muss (sehr teuer!)
                </li>
                <li>
                  <strong>AOI Rüsten (25 min):</strong> Jeder Job benötigt Setup, keine Wiederverwendung
                </li>
                <li>
                  <strong>Kit-Constraint:</strong> Solange Kit A an SMD1 ist, können SMD2-4 keine Jobs der
                  Familie A starten
                </li>
              </ul>
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              Optimierungsziele
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Gesamtdauer (Makespan):</strong> Zeit bis alle Jobs fertiggestellt sind - je
                  kürzer, desto besser
                </li>
                <li>
                  <strong>Verspätung (Tardiness):</strong> Summe aller verspäteten Minuten - wichtig für
                  Kundenzufriedenheit
                </li>
                <li>
                  <strong>Großrüstvorgänge minimieren:</strong> Familien gruppieren spart bis zu 45 Minuten
                  pro vermiedenem Großrüsten
                </li>
              </ul>
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              Funktionen
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Manuelle Planung:</strong> Ziehen Sie Jobs per Drag & Drop in der Warteschlange
                </li>
                <li>
                  <strong>Heuristiken:</strong> Schnelle Sortierstrategien (FIFO, EDD, SPT, Familie
                  gruppieren)
                </li>
                <li>
                  <strong>Genetische Optimierung:</strong> KI-basierte Suche nach optimaler Reihenfolge mit
                  konfigurierbaren Parametern
                </li>
                <li>
                  <strong>2D Fabrikansicht:</strong> Live-Animation zeigt Maschinen, Warteschlangen und
                  Job-Fortschritt
                </li>
                <li>
                  <strong>Gantt-Diagramm:</strong> Timeline-Übersicht mit allen Jobs, Maschinen und
                  Rüstzeiten
                </li>
                <li>
                  <strong>Schrittmodus:</strong> Event-für-Event durch die Simulation navigieren
                </li>
              </ul>
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
              Metriken
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Makespan:</strong> Gesamtdauer in Minuten (niedriger = besser)
                </li>
                <li>
                  <strong>Setups:</strong> Anzahl Kleinrüsten / Großrüsten / AOI-Rüsten
                </li>
                <li>
                  <strong>Verspätung:</strong> Summe aller zu spät gelieferten Minuten (niedriger = besser)
                </li>
                <li>
                  <strong>Auslastung:</strong> Prozent der Zeit, die Maschinen produktiv arbeiten (höher =
                  besser)
                </li>
              </ul>
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Optimization Weight Slider */}
        <Paper sx={{ p: 1.5, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>
              Optimierungsziel:
            </Typography>

            <Typography variant="caption" sx={{ minWidth: 80, textAlign: 'right' }}>
              Gesamtdauer
            </Typography>

            <Slider
              value={optimizationWeight}
              onChange={(_, value) => setOptimizationWeight(value as number)}
              min={0}
              max={100}
              step={10}
              sx={{ flex: 1, maxWidth: 300 }}
              disabled={isOptimizing}
              size="small"
            />

            <Typography variant="caption" sx={{ minWidth: 80 }}>
              Verspätung
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
              ({100 - optimizationWeight}/{optimizationWeight})
            </Typography>

            {/* Optimize button moved here */}
            {!isOptimizing ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Zap size={18} />}
                onClick={() => setConfigDialogOpen(true)}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                Optimieren
              </Button>
            ) : (
              <Button variant="contained" color="error" onClick={handleCancelOptimization} sx={{ ml: 2 }}>
                Stoppen
              </Button>
            )}
          </Box>
        </Paper>

        {/* Optimization Progress */}
        {optimizationProgress && (
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t('optimization.generation', {
                current: optimizationProgress.generation,
                total: optimizationProgress.total,
              })}
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Fitness:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {optimizationProgress.bestFitness.toFixed(3)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Gesamtdauer:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.purple[600] }}>
                  {Math.round(optimizationProgress.bestMakespan)} min
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Verspätung:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.error[600] }}>
                  {Math.round(optimizationProgress.bestTardiness)} min
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Job Queue */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ p: 2, maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <JobQueue
                title={t('stages.queue')}
                jobs={jobs}
                jobSequence={jobSequence}
                onSequenceChange={setJobSequence}
                onHeuristicChange={handleHeuristicChange}
                isOptimizing={isOptimizing}
              />
            </Card>
          </Grid>

          {/* Factory Floor Visualization */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ p: 2, minHeight: '70vh' }}>
              {schedule ? (
                <FactoryFloor
                  schedule={schedule}
                  jobs={jobs}
                  makespan={schedule.makespan}
                  jobSequence={jobSequence}
                  isOptimizing={isOptimizing}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {t('controls.runSimulation')}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Gantt Chart */}
        {schedule && (
          <Card sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gantt-Diagramm
            </Typography>
            <GanttChartSVG
              scheduledJobs={schedule.jobs}
              jobs={jobs}
              makespan={schedule.makespan}
            />
          </Card>
        )}

        {/* GA Configuration Dialog */}
        <GAConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          initialConfig={{ ...gaConfig, tardinessWeight: optimizationWeight / 100 }}
          onOptimize={handleOptimizeWithConfig}
        />
      </Container>
    </Box>
  );
}
