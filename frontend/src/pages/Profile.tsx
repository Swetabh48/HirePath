import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth'

export default function Profile() {
  const { profile, fetchProfile, saveProfile } = useAuthStore()
  const [form, setForm] = useState<any>({
    age: 30,
    gender: 'MALE',
    heightCm: 175,
    weightKg: 70,
    activityLevel: 1.2,
    goal: 'MAINTAIN',
    dietaryPreferences: [],
    allergies: [],
  })

  useEffect(() => { fetchProfile().catch(() => {}) }, [])
  useEffect(() => { if (profile) setForm(profile) }, [profile])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile({ ...form, dietaryPreferences: form.dietaryPreferences || [], allergies: form.allergies || [] })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Profile</Typography>
      <Box component="form" onSubmit={submit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box><TextField fullWidth type="number" label="Age" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></Box>
          <Box><TextField fullWidth select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {['MALE','FEMALE','OTHER'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField></Box>
          <Box><TextField fullWidth type="number" label="Height (cm)" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} /></Box>
          <Box><TextField fullWidth type="number" label="Weight (kg)" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} /></Box>
          <Box><TextField fullWidth type="number" label="Activity Level" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: Number(e.target.value) })} /></Box>
          <Box><TextField fullWidth select label="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
            {['LOSS','MAINTAIN','GAIN'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField></Box>
          <Box sx={{ gridColumn: '1 / -1' }}><TextField fullWidth label="Dietary Preferences (comma separated)" value={(form.dietaryPreferences||[]).join(', ')} onChange={(e) => setForm({ ...form, dietaryPreferences: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean) })} /></Box>
          <Box sx={{ gridColumn: '1 / -1' }}><TextField fullWidth label="Allergies (comma separated)" value={(form.allergies||[]).join(', ')} onChange={(e) => setForm({ ...form, allergies: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean) })} /></Box>
        </Box>
        <Button type="submit" sx={{ mt: 2 }}>Save</Button>
      </Box>
    </Paper>
  )
}

