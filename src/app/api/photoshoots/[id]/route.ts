import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken, getUserById } from '@/lib/custom-auth'

interface PhotoshootRouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: PhotoshootRouteParams) {
    try {
        // Get the photoshoot ID from params
        const { id } = await params

        // Get token from cookies - use the same cookie name as other API routes
        const token = request.cookies.get('auth-token')?.value
        if (!token) {
            return NextResponse.json({ error: 'No authentication token found' }, { status: 401 })
        }

        // Verify token
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
        }

        // Get user details
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }

        // Fetch the specific photoshoot with related product and model data
        const { data: photoshoot, error: dbError } = await supabaseAdmin
            .from('photoshoots')
            .select(`
                *,
                products:product_id (
                    id,
                    name,
                    tag,
                    image_url
                ),
                models:model_id (
                    id,
                    name,
                    tag,
                    image_url
                )
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            if (dbError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Photoshoot not found' }, { status: 404 })
            }
            return NextResponse.json({ error: 'Failed to fetch photoshoot' }, { status: 500 })
        }

        if (!photoshoot) {
            return NextResponse.json({ error: 'Photoshoot not found' }, { status: 404 })
        }

        return NextResponse.json({ photoshoot })

    } catch (error) {
        console.error('Error fetching photoshoot:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 