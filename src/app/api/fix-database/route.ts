import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
    try {
        // Add the missing INSERT policy for profiles
        const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql: `
                -- Add INSERT policy for profiles table to allow trigger function to create profiles
                CREATE POLICY IF NOT EXISTS "Allow profile creation on signup" ON profiles FOR INSERT WITH CHECK (true);
            `
        })

        if (error) {
            // Try alternative approach using direct SQL
            const { error: directError } = await supabaseAdmin
                .from('profiles')
                .select('count', { count: 'exact', head: true })

            // If we can't use RPC, we'll return instructions
            return NextResponse.json({
                success: false,
                error: 'Need to manually run SQL',
                sql: `CREATE POLICY IF NOT EXISTS "Allow profile creation on signup" ON profiles FOR INSERT WITH CHECK (true);`,
                instructions: 'Please run this SQL command in your Supabase SQL Editor'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Database policy fixed successfully'
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Database fix failed',
            sql: `CREATE POLICY IF NOT EXISTS "Allow profile creation on signup" ON profiles FOR INSERT WITH CHECK (true);`,
            instructions: 'Please run this SQL command in your Supabase SQL Editor',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 