import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const { email, password, fullName } = await request.json()

        console.log('🔍 Testing signup process...')
        console.log('📧 Email:', email)
        console.log('👤 Full Name:', fullName)

        // Test 1: Check if we can create a user with admin client
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: `test-${Date.now()}@test.com`, // Use a unique test email
            password: 'test123456',
            email_confirm: true,
            user_metadata: {
                full_name: 'Test User',
            },
        })

        if (userError) {
            console.error('❌ User creation failed:', userError)
            return NextResponse.json({
                step: 'user_creation',
                success: false,
                error: userError.message,
                details: userError
            }, { status: 400 })
        }

        console.log('✅ User created successfully:', userData.user.id)

        // Test 2: Check if profile was created by trigger
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single()

        if (profileError) {
            console.error('❌ Profile fetch failed:', profileError)

            // Test 3: Try to manually create profile
            const { data: manualProfile, error: manualError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: userData.user.id,
                    email: userData.user.email!,
                    full_name: 'Test User',
                    credits: 5
                })
                .select()
                .single()

            if (manualError) {
                console.error('❌ Manual profile creation failed:', manualError)

                // Clean up the test user
                await supabaseAdmin.auth.admin.deleteUser(userData.user.id)

                return NextResponse.json({
                    step: 'profile_creation',
                    success: false,
                    trigger_error: profileError.message,
                    manual_error: manualError.message,
                    fix_needed: 'RLS policies or trigger function issue'
                }, { status: 500 })
            }

            console.log('✅ Manual profile creation worked')
        }

        console.log('✅ Profile found:', profile)

        // Clean up the test user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)

        return NextResponse.json({
            success: true,
            message: 'Auth system working correctly',
            user_created: true,
            profile_created: !!profile,
            trigger_working: !!profile
        })

    } catch (error) {
        console.error('💥 Unexpected error:', error)
        return NextResponse.json({
            success: false,
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 