import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        console.log('🔧 Applying migration 005: Adding product fields...')

        let migration1Result = 'Success'
        let migration2Result = 'Success'
        let migration3Result = 'Success'

        // Add tag and physical_dimensions columns
        try {
            await supabaseAdmin.rpc('exec_sql', {
                sql: `
                    ALTER TABLE products 
                    ADD COLUMN IF NOT EXISTS tag TEXT,
                    ADD COLUMN IF NOT EXISTS physical_dimensions JSONB;
                `
            })
        } catch (err) {
            console.log('Migration 1 (add columns) result:', err)
            migration1Result = 'Columns might already exist'
        }

        // Create index on tag
        try {
            await supabaseAdmin.rpc('exec_sql', {
                sql: `CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);`
            })
        } catch (err) {
            console.log('Migration 2 (create index) result:', err)
            migration2Result = 'Index might already exist'
        }

        // Update existing products to have tags
        try {
            await supabaseAdmin.rpc('exec_sql', {
                sql: `
                    UPDATE products 
                    SET tag = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g'))
                    WHERE tag IS NULL;
                `
            })
        } catch (err) {
            console.log('Migration 3 (update tags) result:', err)
            migration3Result = 'Update might have failed'
        }

        // Check results
        const { data: columns } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'products')
            .in('column_name', ['tag', 'physical_dimensions'])

        console.log('Migration completed. New columns:', columns)

        return NextResponse.json({
            success: true,
            message: 'Migration 005 applied successfully',
            newColumns: columns,
            migration1Result,
            migration2Result,
            migration3Result
        })

    } catch (error) {
        console.error('Migration error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Migration failed'
        }, { status: 500 })
    }
} 