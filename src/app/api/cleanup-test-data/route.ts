import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
    try {
        console.log('🧹 Cleaning up test data...')

        // Find and delete any test users and profiles
        const { data: testProfiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .like('email', '%trigger-test-%')

        if (profileError) {
            console.error('Error finding test profiles:', profileError)
        } else if (testProfiles && testProfiles.length > 0) {
            console.log(`Found ${testProfiles.length} test profiles to clean up`)

            for (const profile of testProfiles) {
                // Delete the user (this will cascade to delete the profile)
                const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(profile.id)
                if (deleteError) {
                    console.error(`Failed to delete test user ${profile.email}:`, deleteError)
                } else {
                    console.log(`✅ Cleaned up test user: ${profile.email}`)
                }
            }
        } else {
            console.log('✅ No test data found to clean up')
        }

        return NextResponse.json({
            success: true,
            message: 'Test data cleanup completed',
            cleanedCount: testProfiles?.length || 0
        })

    } catch (error) {
        console.error('Error during cleanup:', error)
        return NextResponse.json({
            success: false,
            error: 'Cleanup failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 