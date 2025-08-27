import { create } from 'zustand'
import { api } from '../api/client'

type Profile = {
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  heightCm: number
  weightKg: number
  activityLevel: number
  goal: 'LOSS' | 'MAINTAIN' | 'GAIN'
  dietaryPreferences: string[]
  allergies: string[]
  dailyCalorieTarget?: number
  proteinTargetGrams?: number
  carbsTargetGrams?: number
  fatsTargetGrams?: number
}

type AuthState = {
  token: string | null
  profile: Profile | null
  setToken: (t: string | null) => void
  fetchProfile: () => Promise<void>
  saveProfile: (p: Profile) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  profile: null,
  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token })
  },
  fetchProfile: async () => {
    const { data } = await api.get('/profile')
    set({ profile: data.profile })
  },
  saveProfile: async (p) => {
    const { data } = await api.post('/profile', p)
    set({ profile: data.profile })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, profile: null })
  },
}))

