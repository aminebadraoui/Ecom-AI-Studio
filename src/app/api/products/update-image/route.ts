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

        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const productName = formData.get('productName') as string
        const productId = formData.get('productId') as string

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

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
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

        // Verify user owns this product
        const { data: existingProduct, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingProduct) {
            return NextResponse.json(
                { error: 'Product not found or access denied' },
                { status: 404 }
            )
        }

        // Convert file to buffer for Cloudinary upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: `EcomAIStudio/${user.id}`,
                    public_id: `product_${Date.now()}`,
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' },
                        { width: 2000, height: 2000, crop: 'limit' }
                    ],
                    tags: ['product-image', 'updated']
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        }) as any

        // Delete old image from Cloudinary if it exists
        if (existingProduct.metadata?.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(existingProduct.metadata.cloudinary_public_id)
            } catch (deleteError) {
                console.warn('Failed to delete old image from Cloudinary:', deleteError)
                // Continue anyway - the new image upload was successful
            }
        }

        // Update product in database
        const { data: updatedProduct, error: dbError } = await supabaseAdmin
            .from('products')
            .update({
                name: productName.trim(),
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
                    upload_timestamp: new Date().toISOString(),
                    previous_image: existingProduct.image_url // Keep reference to old image
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)

            // Try to clean up the uploaded image since DB update failed
            try {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id)
            } catch (cleanupError) {
                console.warn('Failed to cleanup uploaded image after DB error:', cleanupError)
            }

            return NextResponse.json(
                { error: 'Failed to update product in database' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            product: updatedProduct,
            message: 'Product image updated successfully'
        })

    } catch (error) {
        console.error('Update image error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 