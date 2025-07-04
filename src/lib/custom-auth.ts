import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

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

export interface AuthResult {
    user?: User
    token?: string
    error?: string
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

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required')
    }
    return secret
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(userId: string): string {
    const secret = getJwtSecret()
    return jwt.sign({ userId }, secret)
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
    try {
        const secret = getJwtSecret()
        const decoded = jwt.verify(token, secret) as { userId: string }
        return decoded
    } catch {
        return null
    }
}

// Generate random token for email verification/password reset
export function generateRandomToken(): string {
    return uuidv4()
}

// Sign up new user
export async function signUp({ email, password, fullName }: SignUpData): Promise<AuthResult> {
    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single()

        if (existingUser) {
            return { error: 'User with this email already exists' }
        }

        // Hash password
        const passwordHash = await hashPassword(password)

        // Generate email verification token
        const emailVerificationToken = generateRandomToken()

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email: email.toLowerCase(),
                password_hash: passwordHash,
                full_name: fullName || null,
                email_verification_token: emailVerificationToken,
                credits: 5 // 5 free credits
            })
            .select('id, email, full_name, avatar_url, credits, email_verified, created_at, updated_at')
            .single()

        if (error) {
            console.error('Error creating user:', error)
            return { error: 'Failed to create user account' }
        }

        // For now, we'll auto-verify users (you can add email sending later)
        await supabase
            .from('users')
            .update({ email_verified: true, email_verification_token: null })
            .eq('id', newUser.id)

        // Generate JWT token
        const token = generateToken(newUser.id)

        return {
            user: { ...newUser, email_verified: true },
            token
        }

    } catch (error) {
        console.error('Signup error:', error)
        return { error: 'An unexpected error occurred during signup' }
    }
}

// Sign in user
export async function signIn({ email, password }: SignInData): Promise<AuthResult> {
    try {
        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password_hash, full_name, avatar_url, credits, email_verified, created_at, updated_at')
            .eq('email', email.toLowerCase())
            .single()

        if (error || !user) {
            return { error: 'Invalid email or password' }
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash)
        if (!isValidPassword) {
            return { error: 'Invalid email or password' }
        }

        // Check if email is verified
        if (!user.email_verified) {
            return { error: 'Please verify your email before signing in' }
        }

        // Generate JWT token
        const token = generateToken(user.id)

        // Remove password_hash from response
        const { password_hash: _, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            token
        }

    } catch (error) {
        console.error('Signin error:', error)
        return { error: 'An unexpected error occurred during signin' }
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, credits, email_verified, created_at, updated_at')
            .eq('id', userId)
            .single()

        if (error || !user) {
            return null
        }

        return user
    } catch (error) {
        console.error('Get user error:', error)
        return null
    }
}

// Update user credits
export async function updateUserCredits(userId: string, amount: number, transactionType: string, description: string): Promise<boolean> {
    try {
        // Get current credits
        const { data: user } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

        if (!user) return false

        const newCredits = user.credits + amount

        // Check if user has enough credits for usage transactions
        if (transactionType === 'usage' && newCredits < 0) {
            return false
        }

        // Update credits
        const { error: updateError } = await supabase
            .from('users')
            .update({ credits: newCredits })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating credits:', updateError)
            return false
        }

        // Record transaction
        const { error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount,
                transaction_type: transactionType,
                description
            })

        if (transactionError) {
            console.error('Error recording transaction:', transactionError)
            // Don't fail the update if transaction recording fails
        }

        return true

    } catch (error) {
        console.error('Update credits error:', error)
        return false
    }
} 