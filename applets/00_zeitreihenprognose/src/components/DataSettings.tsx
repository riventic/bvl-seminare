import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import { RefreshCw, Info, Upload, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ForecastConfig } from '../types';
import type { DatasetType } from '../utils/dataGenerator';
import { colors } from '../theme/colors';

interface DataSettingsProps {
  config: ForecastConfig;
  onChange: (config: ForecastConfig) => void;
  onRegenerate: () => void;
  onImport: (file: File) => void;
  onExport: (format: 'csv' | 'excel') => void;
  selectedDataset: DatasetType;
  onDatasetChange: (dataset: DatasetType) => void;
}

interface InlineSliderProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  tooltip?: string;
}

function InlineSlider({ label, value, unit, min, max, step, onChange, tooltip }: InlineSliderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.gray[700], fontSize: 13, whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ p: 0.25 }}>
              <Info size={14} color={colors.gray[400]} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 80, maxWidth: 120 }}>
        <Slider
          value={value}
          onChange={(_, val) => onChange(val as number)}
          min={min}
          max={max}
          step={step}
          size="small"
          sx={{
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: colors.purple[500],
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 6px ${colors.purple[100]}`,
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: colors.purple[500],
              border: 'none',
              height: 3,
            },
            '& .MuiSlider-rail': {
              backgroundColor: colors.gray[200],
              height: 3,
            },
          }}
        />
      </Box>
      <Chip
        label={`${value}${unit || ''}`}
        size="small"
        sx={{
          backgroundColor: colors.purple[50],
          color: colors.purple[700],
          fontWeight: 600,
          fontSize: 12,
          height: 22,
          minWidth: 50,
          '& .MuiChip-label': {
            px: 1,
          },
        }}
      />
    </Box>
  );
}

export default function DataSettings({
  config,
  onChange,
  onRegenerate,
  onImport,
  onExport,
  selectedDataset,
  onDatasetChange,
}: DataSettingsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const handleChange = (key: keyof ForecastConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportFormat = (format: 'csv' | 'excel') => {
    onExport(format);
    handleExportClose();
  };

  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600, color: colors.gray[700] }}>
            {t('controls.dataSettings')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderColor: colors.gray[300],
                color: colors.gray[700],
                fontSize: 13,
                textTransform: 'none',
                '&:hover': {
                  borderColor: colors.gray[400],
                  backgroundColor: colors.gray[50],
                },
              }}
            >
              {t('controls.import')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={handleExportClick}
              sx={{
                borderColor: colors.gray[300],
                color: colors.gray[700],
                fontSize: 13,
                textTransform: 'none',
                '&:hover': {
                  borderColor: colors.gray[400],
                  backgroundColor: colors.gray[50],
                },
              }}
            >
              {t('controls.export')}
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportClose}
            >
              <MenuItem onClick={() => handleExportFormat('csv')}>
                {t('controls.exportCSV')}
              </MenuItem>
              <MenuItem onClick={() => handleExportFormat('excel')}>
                {t('controls.exportExcel')}
              </MenuItem>
            </Menu>
            <Button
              size="small"
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              onClick={onRegenerate}
              sx={{
                backgroundColor: colors.orange[500],
                fontSize: 13,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colors.orange[600],
                },
              }}
            >
              {t('controls.regenerate')}
            </Button>
          </Box>
        </Box>

        {/* Dataset Selector */}
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: colors.gray[700] }}>
            {t('controls.dataset')}:
          </Typography>
          <FormControl size="small">
            <Select
              value={selectedDataset}
              onChange={(e) => onDatasetChange(e.target.value as DatasetType)}
              sx={{
                fontSize: 13,
                minWidth: 250,
                height: 32,
                '& .MuiSelect-select': {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="random">{t('datasets.random')}</MenuItem>
              <MenuItem value="ecommerce">{t('datasets.ecommerce')}</MenuItem>
              <MenuItem value="industrial">{t('datasets.industrial')}</MenuItem>
              <MenuItem value="startup">{t('datasets.startup')}</MenuItem>
              <MenuItem value="restaurant">{t('datasets.restaurant')}</MenuItem>
              <MenuItem value="retail-promo">{t('datasets.retail-promo')}</MenuItem>
              <MenuItem value="logistics">{t('datasets.logistics')}</MenuItem>
              <MenuItem value="seasonal">{t('datasets.seasonal')}</MenuItem>
              <MenuItem value="declining">{t('datasets.declining')}</MenuItem>
              <MenuItem value="chaotic">{t('datasets.chaotic')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          <InlineSlider
            label={t('controls.forecastPeriod')}
            value={config.forecastPeriod}
            unit={` ${t('controls.forecastPeriodUnit')}`}
            min={7}
            max={90}
            step={1}
            onChange={(val) => handleChange('forecastPeriod', val)}
            tooltip={t('tooltips.forecastPeriod')}
          />

          <InlineSlider
            label={t('controls.historicalDays')}
            value={config.historicalDays}
            unit={` ${t('controls.historicalDaysUnit')}`}
            min={90}
            max={730}
            step={30}
            onChange={(val) => handleChange('historicalDays', val)}
            tooltip={t('tooltips.historicalDays')}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
