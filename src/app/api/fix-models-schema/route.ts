import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        console.log('🔧 Fixing models table schema...')

        // Try to remove the characteristics column since we don't need to store it
        const dropCharacteristicsQuery = `ALTER TABLE models DROP COLUMN IF EXISTS characteristics;`

        try {
            const { error } = await supabaseAdmin.rpc('exec', { sql: dropCharacteristicsQuery })
            if (error) {
                console.log(`Drop characteristics failed:`, error)
            } else {
                console.log(`Drop characteristics success`)
            }
        } catch (err) {
            console.log(`Drop characteristics error:`, err)
        }

        // Try to add missing columns to the models table
        const alterQueries = [
            `ALTER TABLE models ADD COLUMN IF NOT EXISTS dimensions JSONB;`,
            `ALTER TABLE models ADD COLUMN IF NOT EXISTS metadata JSONB;`,
            `ALTER TABLE models ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE models ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
        ]

        const results = []

        for (const query of alterQueries) {
            try {
                const { error } = await supabaseAdmin.rpc('exec', { sql: query })
                if (error) {
                    console.log(`Query failed: ${query}`, error)
                    results.push({ query, success: false, error: error.message })
                } else {
                    console.log(`Query success: ${query}`)
                    results.push({ query, success: true })
                }
            } catch (err) {
                console.log(`Query error: ${query}`, err)
                results.push({ query, success: false, error: err instanceof Error ? err.message : 'Unknown error' })
            }
        }

        // Create indexes if they don't exist
        const indexQueries = [
            `CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);`,
            `CREATE INDEX IF NOT EXISTS idx_models_tag ON models(tag);`,
            `CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);`
        ]

        for (const query of indexQueries) {
            try {
                const { error } = await supabaseAdmin.rpc('exec', { sql: query })
                if (error) {
                    console.log(`Index query failed: ${query}`, error)
                } else {
                    console.log(`Index query success: ${query}`)
                }
            } catch (err) {
                console.log(`Index query error: ${query}`, err)
            }
        }

        // Test if we can now query the table with the dimensions column
        const { data: testData, error: testError } = await supabaseAdmin
            .from('models')
            .select('id, dimensions')
            .limit(1)

        return NextResponse.json({
            success: !testError,
            message: testError ? 'Schema fix failed' : 'Models table schema fixed successfully',
            results,
            testResult: testError ? testError.message : 'Dimensions column accessible'
        })

    } catch (error) {
        console.error('Schema fix error:', error)
        return NextResponse.json(
            {
                error: 'Failed to fix schema',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        )
    }
} 