import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

// This file should only be imported in server-side code (API routes, server actions, etc.)
// Never import this in client-side components!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client')
}

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
) 