import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#0288d1' },
    success: { main: '#43a047' },
    error: { main: '#e53935' },
    warning: { main: '#fbc02d' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: { defaultProps: { variant: 'contained' } },
  },
})

