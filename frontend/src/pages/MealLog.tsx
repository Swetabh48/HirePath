import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

type FoodItem = { name: string; brand?: string | null; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number }

export default function MealLog() {
  const [meals, setMeals] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<any[]>([])
  const [items, setItems] = useState<FoodItem[]>([])

  useEffect(() => {
    api.get('/meals').then(({ data }) => setMeals(data.meals))
  }, [])

  const doSearch = async () => {
    const { data } = await api.get('/food/search', { params: { q: query } })
    setSearch(data.items)
  }

  const addItem = (f: any) => {
    setItems((prev) => [...prev, { name: f.name, brand: f.brand, quantity: 1, unit: f.unit || 'serving', calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat }])
  }

  const saveMeal = async () => {
    if (!items.length) return
    const { data } = await api.post('/meals', { items })
    setMeals((m) => [data.meal, ...m])
    setItems([])
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Log Meal</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <TextField fullWidth placeholder="Search food (e.g., chicken)" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button sx={{ mt: 1 }} onClick={doSearch}>Search</Button>
          <Box sx={{ mt: 2 }}>
            {search.map((f:any, idx:number) => (
              <Card key={idx} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography>{f.name} — {f.calories} kcal</Typography>
                  <Button size="small" onClick={() => addItem(f)}>Add</Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle1">Current meal items</Typography>
          {items.map((it, idx) => (
            <Card key={idx} sx={{ mb: 1 }}>
              <CardContent>
                <Typography>{it.name} — {it.calories} kcal</Typography>
              </CardContent>
            </Card>
          ))}
          <Button disabled={!items.length} onClick={saveMeal}>Save Meal</Button>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mt: 4 }}>Recent Meals</Typography>
      {meals.map((m) => (
        <Card key={m.id} sx={{ mb: 1 }}>
          <CardContent>
            <Typography>{new Date(m.occurredAt).toLocaleString()} — {m.totalCalories} kcal</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

