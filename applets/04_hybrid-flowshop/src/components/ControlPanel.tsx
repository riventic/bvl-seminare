import { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { Zap, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SchedulingHeuristic } from '@/types';

interface ControlPanelProps {
  onOptimize: () => void;
  onCancelOptimize: () => void;
  isOptimizing: boolean;
  onHeuristicChange: (heuristic: SchedulingHeuristic) => void;
  disabled?: boolean;
}

export default function ControlPanel({
  onOptimize,
  onCancelOptimize,
  isOptimizing,
  onHeuristicChange,
  disabled = false,
}: ControlPanelProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHeuristicSelect = (heuristic: SchedulingHeuristic) => {
    onHeuristicChange(heuristic);
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        p: 2,
        bgcolor: 'white',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        variant="outlined"
        onClick={handleMenuClick}
        endIcon={<ChevronDown size={16} />}
        disabled={disabled}
      >
        Sortieren
      </Button>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleHeuristicSelect('FIFO')}>
          {t('heuristics.FIFO')}
        </MenuItem>
        <MenuItem onClick={() => handleHeuristicSelect('EDD')}>
          {t('heuristics.EDD')}
        </MenuItem>
        <MenuItem onClick={() => handleHeuristicSelect('SPT')}>
          {t('heuristics.SPT')}
        </MenuItem>
        <MenuItem onClick={() => handleHeuristicSelect('FAMILY_GROUP')}>
          {t('heuristics.FAMILY_GROUP')}
        </MenuItem>
      </Menu>

      {!isOptimizing ? (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Zap size={18} />}
          onClick={onOptimize}
          disabled={disabled}
        >
          {t('controls.optimize')}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="error"
          onClick={onCancelOptimize}
        >
          Stoppen
        </Button>
      )}
    </Box>
  );
}
