import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material'

type Summary = {
  date: string
  totals: { calories: number; protein: number; carbs: number; fat: number }
  targets?: { calories: number; protein: number; carbs: number; fat: number }
  remaining?: { calories: number; protein: number; carbs: number; fat: number }
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    api.get('/analytics/daily-summary').then(({ data }) => setSummary(data))
  }, [])

  const metrics = [
    { key: 'calories', label: 'Calories', color: 'primary' },
    { key: 'protein', label: 'Protein', color: 'success' },
    { key: 'carbs', label: 'Carbs', color: 'warning' },
    { key: 'fat', label: 'Fat', color: 'secondary' },
  ] as const

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Today</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {metrics.map((m) => {
          const total = (summary?.totals as any)?.[m.key] || 0
          const target = (summary?.targets as any)?.[m.key] || 1
          const pct = Math.min(100, Math.round((total / target) * 100))
          return (
            <Box key={m.key}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{m.label}: {total} / {target}</Typography>
                  <LinearProgress variant="determinate" value={pct} color={m.color as any} sx={{ height: 10, borderRadius: 1, mt: 1 }} />
                </CardContent>
              </Card>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

