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
        const modelId = formData.get('modelId') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!modelId) {
            return NextResponse.json(
                { error: 'Model ID is required' },
                { status: 400 }
            )
        }

        // Get the existing model to verify ownership and get old image info
        const { data: existingModel, error: fetchError } = await supabaseAdmin
            .from('models')
            .select('*')
            .eq('id', modelId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingModel) {
            return NextResponse.json(
                { error: 'Model not found or access denied' },
                { status: 404 }
            )
        }

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

        // Upload new image to Cloudinary
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
                    tags: ['model-image', 'updated'] // Tags for organization
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

        // Update model in database
        const { data: updatedModel, error: updateError } = await supabaseAdmin
            .from('models')
            .update({
                image_url: cloudinaryResult.secure_url,
                dimensions: {
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height,
                    unit: 'px'
                },
                metadata: {
                    ...existingModel.metadata,
                    cloudinary_public_id: cloudinaryResult.public_id,
                    file_format: cloudinaryResult.format,
                    file_size: file.size,
                    last_updated: new Date().toISOString()
                }
            })
            .eq('id', modelId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (updateError) {
            console.error('Database update error:', updateError)
            // If DB update fails, clean up the new Cloudinary upload
            try {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id)
            } catch (cleanupError) {
                console.error('Failed to cleanup new Cloudinary upload:', cleanupError)
            }
            return NextResponse.json(
                { error: 'Failed to update model in database' },
                { status: 500 }
            )
        }

        // Delete old image from Cloudinary if it exists
        if (existingModel.metadata?.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(existingModel.metadata.cloudinary_public_id)
                console.log(`Cloudinary image deleted: ${existingModel.metadata.cloudinary_public_id}`)
            } catch (deleteError) {
                console.error('Failed to delete old Cloudinary image:', deleteError)
                // Don't fail the request if old image cleanup fails
            }
        }

        return NextResponse.json({
            success: true,
            url: cloudinaryResult.secure_url,
            model: updatedModel
        })

    } catch (error) {
        console.error('Update image error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 