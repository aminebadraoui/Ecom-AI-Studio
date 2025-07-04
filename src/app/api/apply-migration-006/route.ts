import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        console.log('🔧 Checking migration 006: Models table...')

        // Try to query the models table to see if it exists
        const { error: tableError } = await supabaseAdmin
            .from('models')
            .select('count(*)')
            .limit(1)

        if (tableError && tableError.message.includes('relation "models" does not exist')) {
            console.log('Models table does not exist')

            // Provide the SQL for manual execution
            const sqlInstructions = `
-- Execute this SQL in your Supabase Dashboard > SQL Editor:

CREATE TABLE IF NOT EXISTS models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    image_url TEXT NOT NULL,
    dimensions JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_tag ON models(tag);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

CREATE OR REPLACE FUNCTION update_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_models_updated_at ON models;
CREATE TRIGGER trigger_update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_models_updated_at();
            `

            return NextResponse.json({
                success: false,
                tableExists: false,
                message: 'Models table does not exist. Please execute the SQL manually.',
                sql: sqlInstructions.trim()
            })
        }

        console.log('Models table exists or accessible')

        return NextResponse.json({
            success: true,
            message: 'Migration 006: Models table is ready',
            tableExists: true
        })

    } catch (error) {
        console.error('Migration check error:', error)
        return NextResponse.json(
            {
                error: 'Failed to check migration',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        )
    }
} 