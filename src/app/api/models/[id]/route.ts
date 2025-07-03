import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface ModelDetailParams {
    params: Promise<{ id: string }>
}

// Helper function to generate tag from name
function generateTag(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to generate unique name
async function generateUniqueName(baseName: string, userId: string, excludeId?: string): Promise<string> {
    const trimmedName = baseName.trim()

    // Get all existing models for this user
    const { data: existingModels, error } = await supabaseAdmin
        .from('models')
        .select('name')
        .eq('user_id', userId)
        .neq('id', excludeId || 'none') // Exclude current model when updating

    if (error) {
        console.error('Error fetching existing models:', error)
        return trimmedName
    }

    // Check if name already exists
    const exactMatch = existingModels?.some(model =>
        model.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (!exactMatch) {
        return trimmedName
    }

    // Find the highest number suffix
    let highestNumber = 1
    const namePattern = new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( \\d+)?$`, 'i')

    existingModels.forEach(model => {
        const match = model.name.match(namePattern)
        if (match) {
            const number = match[1] ? parseInt(match[1].trim()) : 1
            highestNumber = Math.max(highestNumber, number)
        }
    })

    return `${trimmedName} ${highestNumber + 1}`
}

// GET /api/models/[id] - Get individual model
export async function GET(request: NextRequest, { params }: ModelDetailParams) {
    try {
        const { id } = await params

        // Authenticate the user
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
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Fetch the model
        const { data: model, error } = await supabaseAdmin
            .from('models')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ model })

    } catch (error) {
        console.error('Get model error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH /api/models/[id] - Update model
export async function PATCH(request: NextRequest, { params }: ModelDetailParams) {
    try {
        const { id } = await params

        // Authenticate the user
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
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get the current model to verify ownership
        const { data: currentModel, error: fetchError } = await supabaseAdmin
            .from('models')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !currentModel) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { name } = body

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Model name is required' },
                { status: 400 }
            )
        }

        // Generate unique name and tag
        const uniqueName = await generateUniqueName(name, user.id, id)
        const tag = generateTag(uniqueName)

        // Update the model
        const { data: updatedModel, error: updateError } = await supabaseAdmin
            .from('models')
            .update({
                name: uniqueName,
                tag: tag,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json(
                { error: 'Failed to update model' },
                { status: 500 }
            )
        }

        return NextResponse.json({ model: updatedModel })

    } catch (error) {
        console.error('Update model error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/models/[id] - Delete model
export async function DELETE(request: NextRequest, { params }: ModelDetailParams) {
    try {
        const { id } = await params

        // Authenticate the user
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
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get the model to verify ownership and get Cloudinary info
        const { data: model, error: fetchError } = await supabaseAdmin
            .from('models')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        // Delete from Cloudinary if we have the public_id
        if (model.metadata?.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(model.metadata.cloudinary_public_id)
                console.log('Cloudinary image deleted:', model.metadata.cloudinary_public_id)
            } catch (cloudinaryError) {
                console.error('Failed to delete from Cloudinary:', cloudinaryError)
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        const { error: deleteError } = await supabaseAdmin
            .from('models')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete model' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete model error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 