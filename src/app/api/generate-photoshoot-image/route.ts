import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Replicate from 'replicate'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
})

// POST /api/generate-photoshoot-image - Generate photoshoot image with Runway ML
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

        // Get user details
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const {
            photoshoot_id,
            final_prompt,
            reference_images,
            reference_tags
        } = body

        if (!photoshoot_id || !final_prompt) {
            return NextResponse.json({
                error: 'Photoshoot ID and final prompt are required'
            }, { status: 400 })
        }

        console.log('Generating photoshoot image for ID:', photoshoot_id)
        console.log('Prompt:', final_prompt)
        console.log('Reference images:', reference_images?.length || 0)

        // Get photoshoot details to find product_id
        const { data: photoshoot, error: photoshootError } = await supabaseAdmin
            .from('photoshoots')
            .select('product_id')
            .eq('id', photoshoot_id)
            .eq('user_id', user.id)
            .single()

        if (photoshootError || !photoshoot) {
            return NextResponse.json({
                error: 'Photoshoot not found',
                details: photoshootError?.message
            }, { status: 404 })
        }

        // Get product dimensions and tag
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('physical_dimensions, tag')
            .eq('id', photoshoot.product_id)
            .eq('user_id', user.id)
            .single()

        if (productError || !product) {
            return NextResponse.json({
                error: 'Product not found',
                details: productError?.message
            }, { status: 404 })
        }

        // Extract dimensions for the prompt
        let dimensionText = ''
        if (product.physical_dimensions) {
            const dims = product.physical_dimensions
            const unit = dims.unit || 'cm'
            const productTag = product.tag ? `@${product.tag}` : 'the product'
            dimensionText = ` The product ${productTag} has dimensions of ${dims.width}x${dims.length}x${dims.depth} ${unit}. Ensure ${productTag} appears proportionally accurate relative to the model's hands and body - maintain realistic size relationships and proper scale.`
        }

        // Enhance the prompt with dimension information
        const enhancedPrompt = final_prompt + dimensionText

        console.log('Enhanced prompt with dimensions:', enhancedPrompt)

        // Update photoshoot status to processing (using original schema)
        await supabaseAdmin
            .from('photoshoots')
            .update({
                status: 'processing',
                generation_settings: {
                    final_prompt: enhancedPrompt,
                    reference_images: reference_images || [],
                    reference_tags: reference_tags || []
                }
            })
            .eq('id', photoshoot_id)
            .eq('user_id', user.id)

        try {
            // Call Replicate Runway ML API
            console.log('Calling Replicate Runway ML API...')

            const input = {
                prompt: enhancedPrompt,
                resolution: "1080p",
                aspect_ratio: "4:3",
                reference_images: reference_images || [],
                reference_tags: reference_tags || []
            }

            console.log('Replicate input:', input)

            const output = await replicate.run("runwayml/gen4-image", { input })

            console.log('Replicate output:', output)
            console.log('Output type:', typeof output)

            if (!output) {
                throw new Error('No output received from Replicate')
            }

            // Handle different output types from Replicate
            let imageUrl: string

            if (typeof output === 'string') {
                imageUrl = output
            } else if (Array.isArray(output) && output.length > 0) {
                imageUrl = output[0] as string
            } else if (output && typeof output === 'object' && 'url' in output && typeof output.url === 'function') {
                // Handle Replicate FileOutput object
                console.log('Processing Replicate FileOutput object...')
                const urlResult = output.url()
                // Ensure we get a string URL
                if (typeof urlResult === 'string') {
                    imageUrl = urlResult
                } else if (urlResult && typeof urlResult === 'object' && 'href' in urlResult) {
                    imageUrl = urlResult.href
                } else {
                    imageUrl = String(urlResult)
                }
                console.log('Extracted URL from FileOutput:', urlResult)
                console.log('Converted to string:', imageUrl)
            } else if (output && typeof output === 'object') {
                // Try to extract URL from object properties first
                const obj = output as any

                if (obj.url && typeof obj.url === 'string') {
                    imageUrl = obj.url
                    console.log('Found URL property:', imageUrl)
                } else if (obj.image_url) {
                    imageUrl = obj.image_url
                } else if (obj.data && obj.data.url) {
                    imageUrl = obj.data.url
                } else if ('getReader' in output) {
                    // Only process as ReadableStream if no URL found
                    console.log('No URL found, processing ReadableStream with binary data...')
                    throw new Error('ReadableStream processing disabled - check for URL properties first')
                } else {
                    throw new Error(`Invalid output format from Replicate. Object: ${JSON.stringify(obj)}`)
                }
            } else {
                throw new Error(`Invalid output format from Replicate. Type: ${typeof output}`)
            }

            console.log('Extracted image URL:', imageUrl)

            // Validate that we have a proper URL or data URL
            if (!imageUrl || typeof imageUrl !== 'string' || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:'))) {
                throw new Error(`Invalid image URL received: ${typeof imageUrl === 'string' ? imageUrl.substring(0, 100) + '...' : imageUrl}`)
            }

            // Upload the generated image to Cloudinary
            console.log('Uploading generated image to Cloudinary...')

            const cloudinaryResult = await cloudinary.uploader.upload(imageUrl, {
                folder: `EcomAIStudio/${user.id}/generated`,
                public_id: `photoshoot_${photoshoot_id}_${Date.now()}`,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            })

            const generatedImageUrl = cloudinaryResult.secure_url
            const thumbnailUrl = cloudinary.url(cloudinaryResult.public_id, {
                transformation: [
                    { width: 400, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
                ]
            })

            console.log('Image uploaded to Cloudinary:', generatedImageUrl)

            // Create the generated image object
            const generatedImageObject = {
                url: generatedImageUrl,
                thumbnail_url: thumbnailUrl,
                created_at: new Date().toISOString(),
                is_primary: true,
                generation_prompt: enhancedPrompt,
                cloudinary_public_id: cloudinaryResult.public_id,
                metadata: {
                    reference_images: reference_images || [],
                    reference_tags: reference_tags || [],
                    replicate_output: output
                }
            }

            // Get current photoshoot to check existing generated_images
            const { data: currentPhotoshoot, error: fetchError } = await supabaseAdmin
                .from('photoshoots')
                .select('generated_images')
                .eq('id', photoshoot_id)
                .eq('user_id', user.id)
                .single()

            if (fetchError) {
                console.error('Error fetching current photoshoot:', fetchError)
                return NextResponse.json({
                    error: 'Failed to fetch current photoshoot',
                    details: fetchError.message
                }, { status: 500 })
            }

            // Add the new image to the generated_images array
            const existingImages = currentPhotoshoot.generated_images || []
            const updatedImages = [...existingImages, generatedImageObject]

            // Update photoshoot with new image and status
            const { data: updatedPhotoshoot, error: updateError } = await supabaseAdmin
                .from('photoshoots')
                .update({
                    status: 'completed',
                    generated_image_url: generatedImageUrl, // Keep for backward compatibility
                    generated_images: updatedImages
                })
                .eq('id', photoshoot_id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (updateError) {
                console.error('Error updating photoshoot:', updateError)
                return NextResponse.json({
                    error: 'Failed to update photoshoot',
                    details: updateError.message
                }, { status: 500 })
            }

            // Create a generated photo record
            const { data: generatedPhoto, error: photoError } = await supabaseAdmin
                .from('generated_photos')
                .insert({
                    photoshoot_id,
                    image_url: generatedImageUrl,
                    thumbnail_url: thumbnailUrl,
                    generation_prompt: enhancedPrompt,
                    generation_metadata: {
                        reference_images: reference_images || [],
                        reference_tags: reference_tags || [],
                        generated_at: new Date().toISOString(),
                        cloudinary_public_id: cloudinaryResult.public_id,
                        replicate_output: output
                    }
                })
                .select()
                .single()

            if (photoError) {
                console.error('Error creating generated photo:', photoError)
                // Continue anyway, photoshoot was created successfully
            }

            // Deduct credits using the original function
            const creditsDeducted = await supabaseAdmin.rpc('update_user_credits', {
                user_id_param: user.id,
                amount_param: -5, // Deduct 5 credits for photoshoot generation
                transaction_type_param: 'usage',
                description_param: 'Photoshoot generation',
                reference_id_param: photoshoot_id
            })

            console.log('Photoshoot generation completed successfully')

            return NextResponse.json({
                success: true,
                photoshoot: updatedPhotoshoot,
                generated_photo: generatedPhoto,
                generated_image_url: generatedImageUrl,
                thumbnail_url: thumbnailUrl,
                credits_used: 5,
                message: 'Photoshoot image generated successfully'
            })

        } catch (replicateError) {
            console.error('Replicate generation error:', replicateError)

            // Update photoshoot status to failed
            await supabaseAdmin
                .from('photoshoots')
                .update({
                    status: 'failed',
                    generation_settings: {
                        final_prompt: enhancedPrompt,
                        reference_images: reference_images || [],
                        reference_tags: reference_tags || [],
                        error: replicateError instanceof Error ? replicateError.message : 'Unknown error'
                    }
                })
                .eq('id', photoshoot_id)
                .eq('user_id', user.id)

            return NextResponse.json({
                error: 'Failed to generate image',
                details: replicateError instanceof Error ? replicateError.message : 'Unknown error'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Error generating photoshoot image:', error)

        return NextResponse.json({
            error: 'Failed to generate photoshoot image',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 