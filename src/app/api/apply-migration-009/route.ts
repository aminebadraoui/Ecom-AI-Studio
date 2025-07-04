import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
    try {
        console.log('Starting migration 009...')

        // Migration 009: Fix photoshoots schema and add generated_images array
        const migrations = [
            // Add generated_image_url column if it doesn't exist
            `ALTER TABLE photoshoots ADD COLUMN IF NOT EXISTS generated_image_url TEXT;`,

            // Add the generated_images column to store multiple generated images
            `ALTER TABLE photoshoots ADD COLUMN IF NOT EXISTS generated_images JSONB DEFAULT '[]'::jsonb;`,

            // Add index for the generated_images column
            `CREATE INDEX IF NOT EXISTS idx_photoshoots_generated_images ON photoshoots USING GIN (generated_images);`,

            // Add comment to document the generated_images structure
            `COMMENT ON COLUMN photoshoots.generated_images IS 'Array of generated image objects with URLs, timestamps, and metadata';`,

            // Update existing data
            `UPDATE photoshoots 
             SET generated_images = jsonb_build_array(
                 jsonb_build_object(
                     'url', generated_image_url,
                     'created_at', updated_at,
                     'is_primary', true
                 )
             )
             WHERE generated_image_url IS NOT NULL AND generated_images = '[]'::jsonb;`
        ]

        // Test database connection
        const { error: testError } = await supabaseAdmin.from('photoshoots').select('id').limit(1)
        if (testError) {
            console.error('Database connection test failed:', testError)
            return NextResponse.json({
                error: 'Database connection failed',
                details: testError.message
            }, { status: 500 })
        }

        console.log('Migration 009 SQL ready')

        return NextResponse.json({
            success: true,
            message: 'Migration 009 SQL prepared. Please run the following SQL in your Supabase dashboard:',
            sql: migrations.join('\n\n'),
            instructions: [
                '1. Go to your Supabase dashboard',
                '2. Navigate to the SQL Editor',
                '3. Run the provided SQL commands',
                '4. The migration will add the generated_images column and migrate existing data'
            ]
        })

    } catch (error) {
        console.error('Migration error:', error)
        return NextResponse.json({
            error: 'Migration failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 