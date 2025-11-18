import { Card, CardActionArea, Typography, Chip, Box } from '@mui/material'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/tokens'

interface AppletCardProps {
  title: string
  description: string
  category: string
  onClick: () => void
}

export default function AppletCard({ title, description, category, onClick }: AppletCardProps) {
  return (
    <Card
      sx={{
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: spacing[1.5] }}>
        <Box>
          {/* Category */}
          <Chip
            label={category}
            size="small"
            sx={{
              mb: spacing[0.5],
              bgcolor: colors.purple[50],
              color: colors.purple[700],
              fontWeight: 500,
              fontSize: 10,
              height: 20,
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              mb: spacing[0.5],
              color: colors.gray[900],
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: colors.gray[600],
              lineHeight: 1.4,
              fontSize: 12,
            }}
          >
            {description}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  )
}
