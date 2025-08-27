import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const [logs, setLogs] = useState<any[]>([])
  useEffect(() => { api.get('/analytics/progress').then(({ data }) => setLogs(data.logs)) }, [])

  const data = logs.map((l) => ({ date: new Date(l.date).toLocaleDateString(), weight: l.weightKg }))

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Progress</Typography>
      <Card>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#2e7d32" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

