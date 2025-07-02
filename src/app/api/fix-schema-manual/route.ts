import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        message: 'Manual Database Schema Fix Required',
        problem: 'Products table is referencing profiles table instead of users table',
        solution: 'Run the SQL commands below in your Supabase SQL Editor',
        steps: [
            '1. Go to your Supabase Dashboard',
            '2. Navigate to SQL Editor',
            '3. Create a new query',
            '4. Copy and paste the SQL below',
            '5. Click Run to execute'
        ],
        sql: `-- Fix foreign key constraint for products table
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Optional: Also fix other tables if they have the same issue
ALTER TABLE models DROP CONSTRAINT IF EXISTS models_user_id_fkey;
ALTER TABLE models ADD CONSTRAINT models_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE photoshoots DROP CONSTRAINT IF EXISTS photoshoots_user_id_fkey;
ALTER TABLE photoshoots ADD CONSTRAINT photoshoots_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_user_id_fkey;
ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`,
        verification: 'After running the SQL, try uploading an image again. It should work!'
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
} 