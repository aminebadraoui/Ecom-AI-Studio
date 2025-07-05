import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json(
            { message: 'Signed out successfully' },
            { status: 200 }
        )

        // Cookie settings that work for both HTTP and HTTPS deployments
        const isHttps = request.headers.get('x-forwarded-proto') === 'https' ||
            request.headers.get('x-forwarded-ssl') === 'on' ||
            request.url.startsWith('https://')

        // Clear the auth token cookie
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: isHttps, // Only secure if actually using HTTPS
            sameSite: 'lax',
            maxAge: 0,
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Signout API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 