import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Welcome to Calorie Coach</Typography>
        <Box component="form" onSubmit={submit}>
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" sx={{ mt: 2 }}>Login</Button>
        </Box>
      </Paper>
    </Container>
  )
}

