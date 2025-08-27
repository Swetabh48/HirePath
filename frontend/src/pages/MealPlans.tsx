import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'

export default function MealPlans() {
  const [plans, setPlans] = useState<any[]>([])

  const load = async () => {
    const { data } = await api.get('/plans')
    setPlans(data.plans)
  }

  useEffect(() => { load() }, [])

  const createPlan = async () => {
    await api.post('/plans', {})
    await load()
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Meal Plans</Typography>
      <Button onClick={createPlan}>Generate Plan</Button>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
        {plans.map((p) => (
          <Box key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{new Date(p.startDate).toDateString()}</Typography>
                {p.items.map((it: any) => (
                  <Typography key={it.id} variant="body2">{it.mealType}: {it.recipeTitle} ({it.calories} kcal)</Typography>
                ))}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

