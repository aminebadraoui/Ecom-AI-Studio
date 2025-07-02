import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        // Test basic connection by trying to access the profiles table
        // If tables don't exist, we'll get a different error that we can handle
        const { data, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .limit(1)

        if (error) {
            // Check if it's a "relation does not exist" error (tables not created)
            if (error.code === 'PGRST106' || error.message.includes('relation') || error.message.includes('does not exist')) {
                return NextResponse.json({
                    success: false,
                    error: 'Database tables not found',
                    details: 'Please run the database migration in Supabase SQL Editor',
                    migration_needed: true,
                    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    environment: {
                        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                    }
                }, { status: 404 })
            }

            console.error('Supabase connection error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database connection failed',
                    details: error.message,
                    code: error.code
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase connection and database tables verified successfully!',
            timestamp: new Date().toISOString(),
            tables_exist: true,
            environment: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            }
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Unexpected error occurred',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 