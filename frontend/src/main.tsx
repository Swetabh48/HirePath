import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, Button, Snackbar } from '@mui/material'
import App from './App'
import { theme } from './theme'
import './index.css'

// PWA install prompt
function InstallPrompt() {
  const [open, setOpen] = React.useState(false)
  const deferredRef = React.useRef<any>(null)

  React.useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault()
      deferredRef.current = e
      setOpen(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const install = async () => {
    const e = deferredRef.current
    if (!e) return
    e.prompt()
    const { outcome } = await e.userChoice
    if (outcome) setOpen(false)
    deferredRef.current = null
  }

  return (
    <Snackbar open={open} onClose={() => setOpen(false)} message="Install Calorie Coach?" action={<Button color="secondary" size="small" onClick={install}>Install</Button>} />
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <InstallPrompt />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
