import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('flowcron_token'),
  isAuthenticated: !!localStorage.getItem('flowcron_token'),
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('flowcron_token', token)
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('flowcron_token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  fetchUser: async () => {
    const token = get().token
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('flowcron_token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

export default useAuthStore
