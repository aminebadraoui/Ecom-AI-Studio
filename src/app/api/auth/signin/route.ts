import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/custom-auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Sign in user
        const result = await signIn({ email, password })

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            )
        }

        // Set HTTP-only cookie with JWT token
        const response = NextResponse.json(
            {
                message: 'Signed in successfully',
                user: result.user
            },
            { status: 200 }
        )

        if (result.token) {
            response.cookies.set('auth-token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            })
        }

        return response

    } catch (error) {
        console.error('Signin API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 