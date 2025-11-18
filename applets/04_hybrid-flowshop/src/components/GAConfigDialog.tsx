import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
} from '@mui/material';
import { ChevronDown, RotateCcw } from 'lucide-react';
import type { GAConfig } from '@/types';
import { GA_DEFAULTS, GA_PRESETS } from '@/config/gaDefaults';

interface GAConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialConfig: GAConfig;
  onOptimize: (config: GAConfig) => void;
}

export default function GAConfigDialog({
  open,
  onClose,
  initialConfig,
  onOptimize,
}: GAConfigDialogProps) {
  const [config, setConfig] = useState<GAConfig>(initialConfig);

  const handleReset = () => {
    setConfig({ ...GA_DEFAULTS, tardinessWeight: initialConfig.tardinessWeight });
  };

  const handlePreset = (preset: keyof typeof GA_PRESETS) => {
    setConfig({ ...GA_PRESETS[preset], tardinessWeight: initialConfig.tardinessWeight });
  };

  const handleOptimize = () => {
    onOptimize(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Genetischer Algorithmus - Konfiguration</Typography>
          <IconButton onClick={handleReset} size="small" title="Auf Standard zurücksetzen">
            <RotateCcw size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Presets */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
            Voreinstellungen:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Schnell" onClick={() => handlePreset('fast')} clickable />
            <Chip label="Ausgewogen" onClick={() => handlePreset('balanced')} clickable />
            <Chip label="Gründlich" onClick={() => handlePreset('thorough')} clickable />
            <Chip label="Adaptiv" onClick={() => handlePreset('adaptive')} clickable />
          </Box>
        </Box>

        {/* Basic Parameters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Grundparameter
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Populationsgröße"
              type="number"
              value={config.populationSize}
              onChange={(e) =>
                setConfig({ ...config, populationSize: parseInt(e.target.value) || 100 })
              }
              inputProps={{ min: 20, max: 500, step: 10 }}
              helperText="20-500 Individuen"
              size="small"
              fullWidth
            />

            <TextField
              label="Generationen"
              type="number"
              value={config.generations}
              onChange={(e) =>
                setConfig({ ...config, generations: parseInt(e.target.value) || 500 })
              }
              inputProps={{ min: 50, max: 2000, step: 50 }}
              helperText="50-2000 Iterationen"
              size="small"
              fullWidth
            />

            <Box>
              <Typography variant="caption" gutterBottom>
                Elitismus: {(config.elitismRate * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={config.elitismRate}
                onChange={(_, value) => setConfig({ ...config, elitismRate: value as number })}
                min={0.05}
                max={0.3}
                step={0.05}
                marks={[
                  { value: 0.05, label: '5%' },
                  { value: 0.1, label: '10%' },
                  { value: 0.2, label: '20%' },
                  { value: 0.3, label: '30%' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Advanced Parameters */}
        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Erweiterte Parameter
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Turniergröße"
                type="number"
                value={config.tournamentSize}
                onChange={(e) =>
                  setConfig({ ...config, tournamentSize: parseInt(e.target.value) || 3 })
                }
                inputProps={{ min: 2, max: 7 }}
                helperText="2-7 (höher = mehr Selektionsdruck)"
                size="small"
                fullWidth
              />

              <Box>
                <Typography variant="caption" gutterBottom>
                  Crossover-Rate: {(config.crossoverRate * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={config.crossoverRate}
                  onChange={(_, value) => setConfig({ ...config, crossoverRate: value as number })}
                  min={0.6}
                  max={0.95}
                  step={0.05}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="caption" gutterBottom>
                  Mutations-Rate: {(config.mutationRate * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={config.mutationRate}
                  onChange={(_, value) => setConfig({ ...config, mutationRate: value as number })}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  size="small"
                />
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel>Mutations-Methode</InputLabel>
                <Select
                  value={config.mutationMethod}
                  label="Mutations-Methode"
                  onChange={(e) =>
                    setConfig({ ...config, mutationMethod: e.target.value as 'swap' | 'insert' })
                  }
                >
                  <MenuItem value="swap">Swap (Zwei Positionen tauschen)</MenuItem>
                  <MenuItem value="insert">Insert (Position verschieben)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Adaptive Parameters */}
        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Adaptive Parameter
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.useAdaptive}
                    onChange={(e) => setConfig({ ...config, useAdaptive: e.target.checked })}
                  />
                }
                label="Adaptive Anpassung aktivieren"
              />

              <Typography variant="caption" color="text.secondary">
                Passt Mutations-Rate automatisch basierend auf Diversität und Fortschritt an
              </Typography>

              {config.useAdaptive && (
                <TextField
                  label="Fenster-Größe"
                  type="number"
                  value={config.adaptiveWindow}
                  onChange={(e) =>
                    setConfig({ ...config, adaptiveWindow: parseInt(e.target.value) || 10 })
                  }
                  inputProps={{ min: 5, max: 50 }}
                  helperText="Generationen für Stagnations-Erkennung"
                  size="small"
                  fullWidth
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleReset} variant="outlined">
          Zurücksetzen
        </Button>
        <Button onClick={handleOptimize} variant="contained" color="secondary">
          Optimieren
        </Button>
      </DialogActions>
    </Dialog>
  );
}
