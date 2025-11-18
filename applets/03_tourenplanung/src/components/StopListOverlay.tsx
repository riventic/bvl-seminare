/**
 * StopListOverlay - Draggable list of stops
 * Fixed overlay on top-left of map
 */
import { Box, Typography, Paper, Button, ToggleButton, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { GripVertical, Zap, RotateCcw, Navigation, Shuffle, Trash2, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DistanceMode } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Stop } from '../types';
import { colors, spacing } from '../theme';

interface StopListOverlayProps {
  stops: Stop[];
  distances: number[];
  onReorder: (newStops: Stop[]) => void;
  distanceMode: DistanceMode;
  onDistanceModeChange: (mode: DistanceMode) => void;
  onOptimize: () => void;
  onReset: () => void;
  onRandomize: () => void;
  onAddStop: (stop: Stop) => void;
  onDeleteStop: (stopId: string) => void;
  availableStops: Stop[];
  isOptimizing?: boolean;
  optimizationProgress?: number;
}

interface SortableStopItemProps {
  stop: Stop;
  index: number;
  distance?: number;
  onDelete: (stopId: string) => void;
  canDelete: boolean;
}

function SortableStopItem({ stop, index, distance, onDelete, canDelete }: SortableStopItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 1.5,
        bgcolor: 'white',
        borderBottom: `1px solid ${colors.gray[100]}`,
        '&:hover': {
          bgcolor: colors.gray[50],
        },
        transition: 'background-color 0.15s ease',
      }}
      {...attributes}
    >
      {/* Drag handle */}
      <Box
        {...listeners}
        sx={{
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <GripVertical size={14} color={colors.gray[400]} />
      </Box>

      {/* Stop number */}
      <Box
        sx={{
          bgcolor: colors.purple[500],
          color: 'white',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Box>

      {/* Stop info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 13,
            lineHeight: 1.3,
            color: colors.gray[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {stop.name}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            lineHeight: 1.3,
            color: colors.gray[500],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {stop.address}
        </Typography>
      </Box>

      {/* Distance */}
      {distance !== undefined && (
        <Typography sx={{ fontSize: 11, color: colors.gray[600], fontWeight: 500, flexShrink: 0, mr: 0.5 }}>
          {distance.toFixed(1)} km
        </Typography>
      )}

      {/* Delete button */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(stop.id);
        }}
        disabled={!canDelete}
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          '&:hover': {
            bgcolor: colors.error[50],
          },
        }}
      >
        <Trash2 size={14} color={canDelete ? colors.error[500] : colors.gray[300]} />
      </IconButton>
    </Box>
  );
}

export default function StopListOverlay({
  stops,
  distances,
  onReorder,
  distanceMode,
  onDistanceModeChange,
  onOptimize,
  onReset,
  onRandomize,
  onAddStop,
  onDeleteStop,
  availableStops,
  isOptimizing = false,
}: StopListOverlayProps) {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Filter out stops already in the route
  const selectableStops = availableStops.filter(
    (availableStop) => !stops.find((stop) => stop.id === availableStop.id)
  );

  const handleAddStopClick = (stop: Stop) => {
    onAddStop(stop);
    setIsAddDialogOpen(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((stop) => stop.id === active.id);
      const newIndex = stops.findIndex((stop) => stop.id === over.id);

      const newStops = arrayMove(stops, oldIndex, newIndex);
      onReorder(newStops);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: spacing[2],
        left: spacing[2],
        zIndex: 1000,
        width: 340,
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
      }}
    >
      {/* Header - Just text */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${colors.gray[200]}`,
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.gray[700] }}>
          {stops.length} {t('stats.numStops')}
        </Typography>
      </Box>

      {/* Controls - Single row of buttons */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${colors.gray[200]}`,
          display: 'flex',
          gap: 1,
        }}
      >
        <ToggleButton
          value="straight-line"
          selected={distanceMode === 'straight-line'}
          onChange={() => onDistanceModeChange('straight-line')}
          sx={{
            flex: 1,
            height: 32,
            fontSize: 11,
            textTransform: 'none',
            py: 0,
          }}
        >
          <Navigation size={11} style={{ marginRight: 4 }} />
          Luftlinie
        </ToggleButton>
        <ToggleButton
          value="driving"
          selected={distanceMode === 'driving'}
          onChange={() => onDistanceModeChange('driving')}
          sx={{
            flex: 1,
            height: 32,
            fontSize: 11,
            textTransform: 'none',
            py: 0,
          }}
        >
          <Navigation size={11} style={{ marginRight: 4 }} />
          Strecke
        </ToggleButton>
        <Button
          variant="contained"
          size="small"
          onClick={onOptimize}
          disabled={isOptimizing || stops.length < 2}
          sx={{
            height: 32,
            minWidth: 32,
            width: 32,
            p: 0,
          }}
        >
          {isOptimizing ? <CircularProgress size={14} color="inherit" /> : <Zap size={14} />}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onRandomize}
          disabled={isOptimizing}
          sx={{
            height: 32,
            minWidth: 32,
            width: 32,
            p: 0,
          }}
        >
          <Shuffle size={14} />
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onReset}
          disabled={isOptimizing}
          sx={{
            height: 32,
            minWidth: 32,
            width: 32,
            p: 0,
          }}
        >
          <RotateCcw size={14} />
        </Button>
      </Box>

      {/* Scrollable stop list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: colors.gray[100],
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: colors.gray[300],
            borderRadius: 3,
            '&:hover': {
              bgcolor: colors.gray[400],
            },
          },
        }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {stops.map((stop, index) => (
                <SortableStopItem
                  key={stop.id}
                  stop={stop}
                  index={index}
                  distance={distances[index]}
                  onDelete={onDeleteStop}
                  canDelete={stops.length > 2}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>

        {stops.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, fontSize: 12 }}>
            {t('stops.noStops')}
          </Typography>
        )}
      </Box>

      {/* Add Stop Button */}
      <Box
        sx={{
          borderTop: `1px solid ${colors.gray[200]}`,
          p: 1.5,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<Plus size={14} />}
          onClick={() => setIsAddDialogOpen(true)}
          disabled={selectableStops.length === 0}
          sx={{
            height: 36,
            fontSize: 12,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {t('stops.add')}
        </Button>
      </Box>

      {/* Add Stop Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {t('stops.select')}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ py: 0 }}>
            {selectableStops.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={t('stops.noAvailable')}
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            ) : (
              selectableStops.map((stop) => (
                <ListItemButton
                  key={stop.id}
                  onClick={() => handleAddStopClick(stop)}
                  sx={{
                    borderBottom: `1px solid ${colors.gray[100]}`,
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    primary={stop.name}
                    secondary={stop.address}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
