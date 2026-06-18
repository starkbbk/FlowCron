import { create } from 'zustand'
import api, { setClerkGetToken } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('flowcron_token'),
  isAuthenticated: !!localStorage.getItem('flowcron_token'),
  isLoading: true,

  setIsLoading: (isLoading) => set({ isLoading }),

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('flowcron_token', token)
    }
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('flowcron_token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  setUser: (user) => set({ user }),

  setClerkTokenResolver: (getTokenFn) => {
    setClerkGetToken(getTokenFn)
  },

  fetchUser: async () => {
    // Legacy fallback/check
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
