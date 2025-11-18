import { useState } from 'react';
import { Box, Typography, Card, Chip, Button, Menu, MenuItem } from '@mui/material';
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
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Job } from '@/types';
import { colors } from '@/theme';

interface JobQueueProps {
  title: string;
  jobs: Job[];
  jobSequence: number[];
  onSequenceChange: (newSequence: number[]) => void;
  readOnly?: boolean;
  showCompletionInfo?: boolean;
  completionTimes?: Map<number, number>; // jobId -> completion time
  jobStatuses?: Map<number, { isLate: boolean; tardiness: number }>; // For sink
  onHeuristicChange?: (heuristic: string) => void; // For sort button
  isOptimizing?: boolean; // Disable controls during optimization
}

interface SortableJobProps {
  job: Job;
  index: number;
  readOnly?: boolean;
  completionTime?: number;
  status?: { isLate: boolean; tardiness: number };
}

function SortableJob({ job, index, readOnly, completionTime, status }: SortableJobProps) {
  const { t } = useTranslation();
  const sortable = useSortable({ id: job.id });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = readOnly
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  const familyColor = colors.familyColors[job.family % colors.familyColors.length];

  return (
    <Card
      ref={readOnly ? undefined : setNodeRef}
      style={style}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: readOnly ? 'default' : 'grab',
        '&:active': readOnly ? {} : { cursor: 'grabbing' },
        '&:hover': readOnly ? {} : { boxShadow: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              bgcolor: colors.gray[200],
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 600,
            }}
          >
            {index + 1}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('job.id', { id: job.id })}
          </Typography>
        </Box>
        <Chip
          label={`F${job.family}`}
          size="small"
          sx={{
            bgcolor: familyColor,
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          {t('job.t_smd', { time: job.t_smd })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('job.t_aoi', { time: job.t_aoi })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('job.dueDate')}: {job.dueDate}
        </Typography>
        {completionTime !== undefined && (
          <Typography variant="caption" color="text.secondary">
            Fertig: {Math.round(completionTime)} min
          </Typography>
        )}
        {status && (
          <Chip
            label={status.isLate ? `${Math.round(status.tardiness)} min zu spät` : 'Pünktlich'}
            size="small"
            sx={{
              bgcolor: status.isLate ? colors.error[100] : colors.success[100],
              color: status.isLate ? colors.error[700] : colors.success[700],
              height: 20,
              fontSize: 10,
            }}
          />
        )}
      </Box>
    </Card>
  );
}

export default function JobQueue({
  title,
  jobs,
  jobSequence,
  onSequenceChange,
  readOnly = false,
  completionTimes,
  jobStatuses,
  onHeuristicChange,
  isOptimizing = false,
}: JobQueueProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = jobSequence.indexOf(active.id as number);
      const newIndex = jobSequence.indexOf(over.id as number);
      onSequenceChange(arrayMove(jobSequence, oldIndex, newIndex));
    }
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortSelect = (heuristic: string) => {
    if (onHeuristicChange) {
      onHeuristicChange(heuristic);
    }
    setAnchorEl(null);
  };

  const orderedJobs = jobSequence.map((id) => jobs.find((j) => j.id === id)!).filter(Boolean);

  // Read-only mode (no drag & drop)
  if (readOnly) {
    return (
      <Box>
        {title && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
          {orderedJobs.map((job, index) => (
            <SortableJob
              key={job.id}
              job={job}
              index={index}
              readOnly
              completionTime={completionTimes?.get(job.id)}
              status={jobStatuses?.get(job.id)}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Draggable mode
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>

        {onHeuristicChange && (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSortClick}
              endIcon={<ChevronDown size={14} />}
              disabled={isOptimizing}
            >
              Sortieren
            </Button>

            <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => handleSortSelect('FIFO')}>
                {t('heuristics.FIFO')}
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('EDD')}>
                {t('heuristics.EDD')}
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('SPT')}>
                {t('heuristics.SPT')}
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('FAMILY_GROUP')}>
                {t('heuristics.FAMILY_GROUP')}
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Disable drag & drop during optimization */}
      {!isOptimizing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={jobSequence} strategy={verticalListSortingStrategy}>
            <Box sx={{ pr: 1 }}>
              {orderedJobs.map((job, index) => (
                <SortableJob key={job.id} job={job} index={index} />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      ) : (
        <Box sx={{ pr: 1 }}>
          {orderedJobs.map((job, index) => (
            <SortableJob key={job.id} job={job} index={index} readOnly />
          ))}
        </Box>
      )}
    </Box>
  );
}
