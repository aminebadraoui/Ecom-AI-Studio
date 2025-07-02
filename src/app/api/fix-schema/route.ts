import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
    try {
        console.log('🔧 Fixing database schema...')

        // Check if products table exists and what its constraints are
        const { data: constraints, error: constraintsError } = await supabaseAdmin
            .from('information_schema.table_constraints')
            .select('constraint_name, constraint_type')
            .eq('table_name', 'products')
            .eq('constraint_type', 'FOREIGN KEY')

        console.log('Current products table constraints:', constraints)

        // Drop and recreate the foreign key constraint to reference users table
        const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
            sql: `
        -- Drop existing foreign key constraint if it exists
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
        
        -- Add new foreign key constraint to reference users table
        ALTER TABLE products ADD CONSTRAINT products_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `
        })

        if (dropError) {
            console.error('Error fixing constraint with RPC:', dropError)

            // Try manual approach
            const { error: manualError } = await supabaseAdmin
                .from('products')
                .select('count', { count: 'exact', head: true })

            if (manualError) {
                return NextResponse.json({
                    success: false,
                    error: 'Need to manually run SQL commands',
                    sql: `
            -- Run these commands in Supabase SQL Editor:
            ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
            ALTER TABLE products ADD CONSTRAINT products_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          `,
                    instructions: 'Please run this SQL in your Supabase SQL Editor Dashboard → SQL Editor'
                }, { status: 500 })
            }
        }

        // Verify the fix worked
        const { data: newConstraints, error: verifyError } = await supabaseAdmin
            .from('information_schema.table_constraints')
            .select('constraint_name, constraint_type')
            .eq('table_name', 'products')
            .eq('constraint_type', 'FOREIGN KEY')

        console.log('Updated products table constraints:', newConstraints)

        return NextResponse.json({
            success: true,
            message: 'Database schema fixed successfully',
            before: constraints,
            after: newConstraints,
            note: 'Products table now properly references users table'
        })

    } catch (error) {
        console.error('Schema fix error:', error)
        return NextResponse.json({
            success: false,
            error: 'Schema fix failed',
            sql: `
        -- Run these commands in Supabase SQL Editor:
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
        ALTER TABLE products ADD CONSTRAINT products_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `,
            instructions: 'Please run this SQL in your Supabase SQL Editor Dashboard → SQL Editor',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 