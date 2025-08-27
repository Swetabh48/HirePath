import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

export default function Notifications() {
  const [items, setItems] = useState<any[]>([])
  const [content, setContent] = useState('Drink water')

  const load = async () => {
    const { data } = await api.get('/notifications')
    setItems(data.notifications)
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    const when = new Date(Date.now() + 3600_000).toISOString()
    await api.post('/notifications', { type: 'REMINDER', content, scheduledAt: when })
    await load()
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      <TextField label="Reminder" value={content} onChange={(e) => setContent(e.target.value)} />
      <Button sx={{ ml: 1 }} onClick={add}>Schedule</Button>
      {items.map((n) => (
        <Card key={n.id} sx={{ mt: 1 }}>
          <CardContent>
            <Typography>{n.content} — {new Date(n.scheduledAt).toLocaleString()}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

