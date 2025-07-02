'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Custom User interface (not using Supabase Auth)
export interface User {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    credits: number
    email_verified: boolean
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Auth check error:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    async function signUp(email: string, password: string, fullName?: string) {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, fullName }),
            })

            const data = await response.json()

            if (response.ok) {
                setUser(data.user)
                return {}
            } else {
                return { error: data.error || 'Signup failed' }
            }
        } catch (error) {
            console.error('Signup error:', error)
            return { error: 'An unexpected error occurred' }
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setUser(data.user)
                return {}
            } else {
                return { error: data.error || 'Sign in failed' }
            }
        } catch (error) {
            console.error('Sign in error:', error)
            return { error: 'An unexpected error occurred' }
        }
    }

    async function signOut() {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include',
            })
        } catch (error) {
            console.error('Sign out error:', error)
        } finally {
            setUser(null)
        }
    }

    async function refreshUser() {
        if (!user) return

        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('Refresh user error:', error)
        }
    }

    const value: AuthContextType = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 