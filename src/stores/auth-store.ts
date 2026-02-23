"use client";

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  updateProfile: (partial: Partial<Profile>) => Promise<void>
  setProfile: (profile: Profile | null) => void
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      set({
        user,
        profile: profile ? {
          ...profile,
          email: user.email || '',
        } as Profile : null,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const supabase = createClient()
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({
        user: data.user,
        profile: profile ? { ...profile, email: data.user.email || '' } as Profile : null,
        isAuthenticated: true,
        isLoading: false,
      })
    }

    return { error: null }
  },

  signup: async (email, password, fullName) => {
    const supabase = createClient()
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    // Create profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: 'customer',
      })

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({
        user: data.user,
        profile: profile ? { ...profile, email: data.user.email || '' } as Profile : null,
        isAuthenticated: true,
        isLoading: false,
      })
    }

    return { error: null }
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, isAuthenticated: false })
  },

  updateProfile: async (partial) => {
    const supabase = createClient()
    const { user } = get()
    if (!user) return

    await supabase.from('profiles').update(partial).eq('id', user.id)
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    }))
  },

  setProfile: (profile) => set({ profile }),
}))
