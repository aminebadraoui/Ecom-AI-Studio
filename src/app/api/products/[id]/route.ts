import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface RouteContext {
    params: Promise<{ id: string }>
}

// Helper function to generate unique product name
async function generateUniqueName(baseName: string, userId: string, excludeProductId?: string): Promise<string> {
    const trimmedName = baseName.trim()

    // Check if the base name exists
    let query = supabaseAdmin
        .from('products')
        .select('name')
        .eq('user_id', userId)
        .ilike('name', `${trimmedName}%`)

    if (excludeProductId) {
        query = query.neq('id', excludeProductId)
    }

    const { data: existingProducts } = await query

    if (!existingProducts || existingProducts.length === 0) {
        return trimmedName
    }

    // Check if exact name exists
    const exactMatch = existingProducts.find(p => p.name.toLowerCase() === trimmedName.toLowerCase())
    if (!exactMatch) {
        return trimmedName
    }

    // Find the highest number suffix
    let highestNumber = 1
    const namePattern = new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( \\d+)?$`, 'i')

    existingProducts.forEach(product => {
        const match = product.name.match(namePattern)
        if (match) {
            const number = match[1] ? parseInt(match[1].trim()) : 1
            highestNumber = Math.max(highestNumber, number)
        }
    })

    return `${trimmedName} ${highestNumber + 1}`
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

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: RouteContext) {
    try {
        // Authenticate the user
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        // Await params before using
        const resolvedParams = await params

        // Fetch the specific product
        const { data: product, error: dbError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id) // Ensure user owns the product
            .single()

        if (dbError || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ product })

    } catch (error) {
        console.error('Get product error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH /api/products/[id] - Update product name and physical dimensions
export async function PATCH(request: NextRequest, { params }: RouteContext) {
    try {
        // Authenticate the user
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        // Await params before using
        const resolvedParams = await params

        // Parse request body
        const { name, physical_dimensions } = await request.json()

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            )
        }

        // Generate unique name if needed
        const uniqueName = await generateUniqueName(name, user.id, resolvedParams.id)
        const tag = generateTag(uniqueName)

        // Prepare update data
        const updateData: any = {
            name: uniqueName,
            tag: tag,
            updated_at: new Date().toISOString()
        }

        // Add physical dimensions if provided
        if (physical_dimensions) {
            updateData.physical_dimensions = physical_dimensions
        }

        // Update the product
        const { data: product, error: dbError } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id) // Ensure user owns the product
            .select()
            .single()

        if (dbError || !product) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { error: 'Failed to update product' },
                { status: 500 }
            )
        }

        return NextResponse.json({ product })

    } catch (error) {
        console.error('Update product error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/products/[id] - Delete product and cleanup Cloudinary image
export async function DELETE(request: NextRequest, { params }: RouteContext) {
    try {
        // Authenticate the user
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        // Await params before using
        const resolvedParams = await params

        // First, get the product to retrieve Cloudinary public_id
        const { data: product, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id) // Ensure user owns the product
            .single()

        if (fetchError || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Delete from database first
        const { error: dbError } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id) // Ensure user owns the product

        if (dbError) {
            console.error('Database delete error:', dbError)
            return NextResponse.json(
                { error: 'Failed to delete product from database' },
                { status: 500 }
            )
        }

        // Clean up Cloudinary image
        if (product.metadata && product.metadata.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(product.metadata.cloudinary_public_id)
                console.log('Cloudinary image deleted:', product.metadata.cloudinary_public_id)
            } catch (cloudinaryError) {
                console.error('Failed to delete Cloudinary image:', cloudinaryError)
                // Don't fail the request if Cloudinary cleanup fails, product is already deleted from DB
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        })

    } catch (error) {
        console.error('Delete product error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 