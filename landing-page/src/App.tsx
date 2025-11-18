import { useState, useEffect } from 'react'
import { Box, Container, Grid } from '@mui/material'
import AppletCard from '@/components/AppletCard'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/tokens'

interface Applet {
  id: string
  title: string
  description: string
  path: string
  category: string
  tags: string[]
}

export default function App() {
  const [applets, setApplets] = useState<Applet[]>([])

  useEffect(() => {
    fetch('/applets.json')
      .then((response) => response.json())
      .then((data) => setApplets(data))
      .catch((error) => console.error('Error loading applets:', error))
  }, [])

  const handleAppletClick = (path: string) => {
    window.location.href = `/${path}/`
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.gray[50], py: spacing[2] }}>
      <Container maxWidth="md">
        <Grid container spacing={1.5}>
          {applets.map((applet) => (
            <Grid key={applet.id} size={{ xs: 12, sm: 6 }}>
              <AppletCard
                title={applet.title}
                description={applet.description}
                category={applet.category}
                onClick={() => handleAppletClick(applet.path)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
