import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/photoshoots - Get user's photoshoots
export async function GET(request: NextRequest) {
    try {
        // Authenticate the user using the same pattern as other API routes
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        // Verify token
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        // Get user
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        // Fetch user's photoshoots from database
        const { data: photoshoots, error: dbError } = await supabaseAdmin
            .from('photoshoots')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { error: 'Failed to fetch photoshoots' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            photoshoots: photoshoots || [],
            total: photoshoots?.length || 0
        })

    } catch (error) {
        console.error('Photoshoots GET API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/photoshoots - Create new photoshoot
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user using the same pattern as other API routes
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        // Verify token
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        // Get user
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        const body = await request.json()
        console.log('Received photoshoot data:', body)
        console.log('User ID:', user.id)

        const {
            name,
            product_id,
            type,
            style,
            model_id,
            scene_details,
            product_analysis,
            final_prompt
        } = body

        // Map the frontend data to the actual database schema
        const style_type = style === 'professional' ? 'professional' : 'ugc'
        const scene_description = final_prompt || product_analysis || 'AI-generated photoshoot'

        // Create the photoshoot using the correct schema
        const { data: photoshoot, error: createError } = await supabaseAdmin
            .from('photoshoots')
            .insert({
                user_id: user.id,
                product_id,
                model_id: type === 'with_model' ? model_id : null,
                style_type,
                scene_description,
                ai_suggested: true,
                generation_settings: {
                    type,
                    style,
                    name,
                    scene_details,
                    product_analysis,
                    final_prompt
                },
                status: 'pending'
            })
            .select()
            .single()

        if (createError) {
            console.error('Create photoshoot error:', createError)
            return NextResponse.json(
                { error: 'Failed to create photoshoot', details: createError.message },
                { status: 500 }
            )
        }

        console.log('Photoshoot created successfully:', photoshoot.id)

        return NextResponse.json({
            success: true,
            photoshoot
        })

    } catch (error) {
        console.error('Photoshoots API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 