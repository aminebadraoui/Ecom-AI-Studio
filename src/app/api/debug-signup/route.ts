import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const { email, password, fullName } = await request.json()

        console.log('Attempting signup with:', { email, fullName })

        // Try to sign up the user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for testing
            user_metadata: {
                full_name: fullName,
            },
        })

        if (error) {
            console.error('Signup error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 400 })
        }

        // Check if profile was created
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        return NextResponse.json({
            success: true,
            user: data.user,
            profile,
            profileError: profileError?.message
        })

    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({
            success: false,
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 