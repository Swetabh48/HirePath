import { AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemText } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)

  const items = [
    { label: 'Dashboard', path: '/' },
    { label: 'Meal Log', path: '/log' },
    { label: 'Meal Plans', path: '/plans' },
    { label: 'Progress', path: '/progress' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Calorie Coach</Typography>
          <Typography sx={{ cursor: 'pointer' }} onClick={logout}>Logout</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {items.map((i) => (
              <ListItemButton key={i.path} selected={location.pathname === i.path} onClick={() => navigate(i.path)}>
                <ListItemText primary={i.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

