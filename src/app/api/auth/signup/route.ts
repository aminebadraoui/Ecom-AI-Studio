import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/custom-auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, fullName } = body

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        // Create user
        const result = await signUp({ email, password, fullName })

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        // Set HTTP-only cookie with JWT token
        const response = NextResponse.json(
            {
                message: 'User created successfully',
                user: result.user
            },
            { status: 201 }
        )

        if (result.token) {
            // Cookie settings that work for both HTTP and HTTPS deployments
            const isHttps = request.headers.get('x-forwarded-proto') === 'https' ||
                request.headers.get('x-forwarded-ssl') === 'on' ||
                request.url.startsWith('https://')

            const cookieOptions = {
                httpOnly: true,
                secure: isHttps, // Only secure if actually using HTTPS
                sameSite: 'lax' as const,
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            }

            response.cookies.set('auth-token', result.token, cookieOptions)
        }

        return response

    } catch (error) {
        console.error('Signup API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 