import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
    try {
        console.log('Starting migration...')

        // 1. Create custom users table
        const { error: createTableError } = await supabaseAdmin.rpc('exec', {
            sql: `
                CREATE TABLE IF NOT EXISTS users (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT,
                    avatar_url TEXT,
                    credits INTEGER DEFAULT 5,
                    email_verified BOOLEAN DEFAULT false,
                    email_verification_token TEXT,
                    password_reset_token TEXT,
                    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        })

        if (createTableError) {
            console.error('Error creating users table:', createTableError)
            // Try direct SQL execution
            const { error } = await supabaseAdmin
                .from('_temp')
                .select('*')
                .limit(0) // This will fail but let us test the connection

            // Let's try creating the table using the data API instead
            // First, let's just check if the table exists
            const { data: tables, error: tablesError } = await supabaseAdmin
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_name', 'users')
                .eq('table_schema', 'public')

            if (tablesError) {
                return NextResponse.json({
                    error: 'Cannot access database to check tables',
                    details: tablesError.message
                }, { status: 500 })
            }

            if (!tables || tables.length === 0) {
                return NextResponse.json({
                    error: 'Unable to create users table. Please run the migration manually in Supabase dashboard.',
                    sql: `
                        CREATE TABLE users (
                            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                            email TEXT UNIQUE NOT NULL,
                            password_hash TEXT NOT NULL,
                            full_name TEXT,
                            avatar_url TEXT,
                            credits INTEGER DEFAULT 5,
                            email_verified BOOLEAN DEFAULT false,
                            email_verification_token TEXT,
                            password_reset_token TEXT,
                            password_reset_expires_at TIMESTAMP WITH TIME ZONE,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        CREATE INDEX idx_users_email ON users(email);
                        CREATE INDEX idx_users_created_at ON users(created_at DESC);
                        
                        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
                        CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
                    `
                }, { status: 500 })
            }
        }

        return NextResponse.json({
            message: 'Migration completed successfully. Users table is ready.',
            note: 'If you see errors, please run the SQL manually in Supabase dashboard.'
        })

    } catch (error) {
        console.error('Unexpected migration error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred during migration' },
            { status: 500 }
        )
    }
} 