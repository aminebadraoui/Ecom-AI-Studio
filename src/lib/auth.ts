import { supabase } from './supabase'
import { AuthError, User } from '@supabase/supabase-js'

export interface AuthResult {
    user: User | null
    error: AuthError | null
}

export interface SignUpData {
    email: string
    password: string
    fullName?: string
}

export interface SignInData {
    email: string
    password: string
}

// Sign up new user
export async function signUp({ email, password, fullName }: SignUpData): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    return {
        user: data.user,
        error,
    }
}

// Sign in existing user
export async function signIn({ email, password }: SignInData): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    return {
        user: data.user,
        error,
    }
}

// Sign out current user
export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

// Get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

// Send password reset email
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
}

// Update password
export async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user ?? null)
    })
} 