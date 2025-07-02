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

// Helper function to generate unique product name
async function generateUniqueName(baseName: string, userId: string): Promise<string> {
    const trimmedName = baseName.trim()

    // Check if the base name exists
    const { data: existingProducts } = await supabaseAdmin
        .from('products')
        .select('name')
        .eq('user_id', userId)
        .ilike('name', `${trimmedName}%`)

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

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user using the same pattern as /api/auth/me
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

        const formData = await request.formData()
        const file = formData.get('file') as File
        const productName = formData.get('productName') as string
        const physicalDimensionsString = formData.get('physicalDimensions') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!productName || !productName.trim()) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            )
        }

        // Parse physical dimensions
        let physicalDimensions = null
        if (physicalDimensionsString) {
            try {
                physicalDimensions = JSON.parse(physicalDimensionsString)
            } catch (error) {
                console.error('Failed to parse physical dimensions:', error)
            }
        }

        // Generate unique name and tag
        const uniqueName = await generateUniqueName(productName, user.id)
        const tag = generateTag(uniqueName)

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            )
        }

        // Convert file to buffer for Cloudinary upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: `EcomAIStudio/${user.id}`, // Organize by user ID in EcomAIStudio folder
                    public_id: `product_${Date.now()}`, // Unique public ID
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }, // Auto optimization
                        { width: 2000, height: 2000, crop: 'limit' } // Limit max size
                    ],
                    tags: ['product-image', 'original'] // Tags for organization
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        const cloudinaryResult = uploadResult as any

        if (!cloudinaryResult || !cloudinaryResult.secure_url) {
            return NextResponse.json(
                { error: 'Failed to upload image to CDN' },
                { status: 500 }
            )
        }

        // Store image metadata in database
        const { data: product, error: dbError } = await supabaseAdmin
            .from('products')
            .insert({
                user_id: user.id,
                name: uniqueName,
                tag: tag,
                image_url: cloudinaryResult.secure_url,
                dimensions: {
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height,
                    unit: 'px'
                },
                physical_dimensions: physicalDimensions,
                metadata: {
                    cloudinary_public_id: cloudinaryResult.public_id,
                    file_format: cloudinaryResult.format,
                    file_size: file.size,
                    upload_timestamp: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // If DB insert fails, we should clean up the Cloudinary upload
            try {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id)
            } catch (cleanupError) {
                console.error('Failed to cleanup Cloudinary upload:', cleanupError)
            }
            return NextResponse.json(
                { error: 'Failed to save image metadata' },
                { status: 500 }
            )
        }

        // Return success with CDN URL and metadata
        return NextResponse.json({
            success: true,
            imageUrl: cloudinaryResult.secure_url,
            thumbnailUrl: cloudinary.url(cloudinaryResult.public_id, {
                width: 400,
                height: 400,
                crop: 'fill',
                quality: 'auto',
                format: 'auto'
            }),
            productId: product.id,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            dimensions: {
                width: cloudinaryResult.width,
                height: cloudinaryResult.height
            },
            cloudinaryPublicId: cloudinaryResult.public_id
        })

    } catch (error) {
        console.error('Image upload error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 