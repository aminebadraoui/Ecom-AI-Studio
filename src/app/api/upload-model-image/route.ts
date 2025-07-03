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

// Helper function to generate unique model name
async function generateUniqueName(baseName: string, userId: string): Promise<string> {
    const trimmedName = baseName.trim()

    // Check if the base name exists
    const { data: existingModels } = await supabaseAdmin
        .from('models')
        .select('name')
        .eq('user_id', userId)
        .ilike('name', `${trimmedName}%`)

    if (!existingModels || existingModels.length === 0) {
        return trimmedName
    }

    // Check if exact name exists
    const exactMatch = existingModels.find(m => m.name.toLowerCase() === trimmedName.toLowerCase())
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

        const formData = await request.formData()
        const file = formData.get('file') as File
        const modelName = formData.get('modelName') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!modelName || !modelName.trim()) {
            return NextResponse.json(
                { error: 'Model name is required' },
                { status: 400 }
            )
        }

        // Generate unique name and tag
        const uniqueName = await generateUniqueName(modelName, user.id)
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
                    public_id: `model_${Date.now()}`, // Unique public ID for models
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }, // Auto optimization
                        { width: 2000, height: 2000, crop: 'limit' } // Limit max size
                    ],
                    tags: ['model-image', 'original'] // Tags for organization
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
        const { data: model, error: dbError } = await supabaseAdmin
            .from('models')
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
                { error: 'Failed to save model to database' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            modelId: model.id,
            url: cloudinaryResult.secure_url,
            model: model
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 