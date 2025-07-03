import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        console.log('🔧 Checking migration 007: Remove characteristics column...')

        // Read the migration file
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '007_remove_characteristics.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf8')

        // Test if models table is working properly (check if characteristics column exists)
        const { data: testData, error: testError } = await supabaseAdmin
            .from('models')
            .select('id, name, tag, image_url, dimensions, metadata')
            .limit(1)

        if (testError) {
            return NextResponse.json({
                success: false,
                message: 'Models table has issues - please run the SQL manually',
                sqlToRun: migrationSQL,
                instructions: [
                    '1. Go to your Supabase dashboard',
                    '2. Navigate to SQL Editor',
                    '3. Copy and paste the SQL below',
                    '4. Click Run to execute the migration'
                ],
                error: testError.message
            })
        }

        // Try to insert a test record to see if characteristics constraint exists
        try {
            const { error: insertError } = await supabaseAdmin
                .from('models')
                .insert({
                    user_id: '00000000-0000-0000-0000-000000000000', // test user id
                    name: 'test-model-for-schema-check',
                    tag: 'test-model',
                    image_url: 'https://example.com/test.jpg'
                })

            if (insertError && insertError.message.includes('characteristics')) {
                return NextResponse.json({
                    success: false,
                    message: 'Characteristics column constraint detected - please run the SQL manually',
                    sqlToRun: migrationSQL,
                    instructions: [
                        '1. Go to your Supabase dashboard',
                        '2. Navigate to SQL Editor',
                        '3. Copy and paste the SQL below',
                        '4. Click Run to execute the migration'
                    ],
                    error: insertError.message
                })
            }

            // Clean up test record if it was inserted
            if (!insertError) {
                await supabaseAdmin
                    .from('models')
                    .delete()
                    .eq('name', 'test-model-for-schema-check')
            }

        } catch (err) {
            // Expected for invalid user_id, but we're testing for characteristics constraint
        }

        return NextResponse.json({
            success: true,
            message: 'Models table schema appears to be correct',
            testResult: 'No characteristics constraint detected'
        })

    } catch (error) {
        console.error('Migration 007 check error:', error)
        return NextResponse.json(
            {
                error: 'Failed to check migration 007',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        )
    }
} 