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
            final_prompts,
            reference_images,
            reference_tags
        } = body

        if (!photoshoot_id || !final_prompts || !Array.isArray(final_prompts) || final_prompts.length !== 5) {
            return NextResponse.json({
                error: 'Photoshoot ID and exactly 5 final prompts are required'
            }, { status: 400 })
        }

        console.log('Generating 5 photoshoot images for ID:', photoshoot_id)
        console.log('Prompts:', final_prompts.map((p, i) => `${i + 1}: ${p.substring(0, 50)}...`))
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

        // Add dimension information to prompts for better scale consistency
        let dimensionText = ''
        if (product && product.physical_dimensions) {
            const dims = product.physical_dimensions
            const unit = dims.unit || 'cm'
            const productTag = product.tag ? `@${product.tag}` : 'the product'

            // Calculate volume and create detailed size description
            const w = parseFloat(dims.width)
            const l = parseFloat(dims.length)
            const d = parseFloat(dims.depth)

            // Convert to cm for reference
            let wCm = w, lCm = l, dCm = d
            if (unit === 'in') {
                wCm = w * 2.54
                lCm = l * 2.54
                dCm = d * 2.54
            } else if (unit === 'mm') {
                wCm = w / 10
                lCm = l / 10
                dCm = d / 10
            }

            // Generate specific scale instructions
            const maxDim = Math.max(wCm, lCm, dCm)
            let scaleInstructions = ''

            if (maxDim < 5) {
                scaleInstructions = 'CRITICAL SCALE: This is a very small product that fits between fingers. When held, it should appear tiny relative to hands, roughly the size of a large coin or small USB drive.'
            } else if (maxDim < 10) {
                scaleInstructions = 'CRITICAL SCALE: This is a palm-sized product. When held, it should fit comfortably in one hand without overwhelming the palm, similar to a smartphone or small cosmetic item.'
            } else if (maxDim < 15) {
                scaleInstructions = 'CRITICAL SCALE: This is a handheld product requiring a full grip. It should appear substantial in hands but not oversized, like a standard book or tablet.'
            } else {
                scaleInstructions = 'CRITICAL SCALE: This is a larger product requiring careful handling. It should appear appropriately sized for its stated dimensions.'
            }

            dimensionText = ` The product ${productTag} has exact dimensions of ${dims.width}x${dims.length}x${dims.depth} ${unit}. ${scaleInstructions} Ensure ${productTag} appears proportionally accurate relative to the model's hands and body - maintain realistic size relationships and proper scale. The product must not appear too large or too small compared to human proportions. Reference the exact measurements when depicting scale.`
        }

        // Enhance all prompts with dimension information
        const enhancedPrompts = final_prompts.map(prompt => prompt + dimensionText)

        console.log('Enhanced prompts with dimensions:', enhancedPrompts.map((p, i) => `${i + 1}: ${p.substring(0, 50)}...`))

        // Update photoshoot status to generating
        await supabaseAdmin
            .from('photoshoots')
            .update({
                status: 'generating',
                generation_settings: {
                    final_prompts: enhancedPrompts,
                    reference_images: reference_images || [],
                    reference_tags: reference_tags || []
                }
            })
            .eq('id', photoshoot_id)
            .eq('user_id', user.id)

        try {
            const generatedImages = []
            const errors: Array<{ index: number; error: string }> = []

            // Generate 5 images in parallel
            const imagePromises = enhancedPrompts.map(async (prompt, index) => {
                try {
                    console.log(`Generating image ${index + 1}/5...`)

                    // Use a base seed and increment for each variation to maintain some consistency
                    const baseSeed = Math.floor(Math.random() * 1000000)
                    const seed = baseSeed + index

                    // Call Replicate Runway ML API with enhanced parameters for consistency
                    const input = {
                        prompt: prompt,
                        resolution: "1080p",
                        aspect_ratio: "4:3",
                        reference_images: reference_images || [],
                        reference_tags: reference_tags || [],
                        seed: seed, // Use seed for more consistent results
                        guidance_scale: 7.5, // Higher guidance for better prompt adherence
                        num_inference_steps: 50 // More steps for better quality
                    }

                    console.log(`Replicate input ${index + 1}:`, input)

                    const output = await replicate.run("runwayml/gen4-image", { input })

                    console.log(`Replicate output ${index + 1}:`, output)
                    console.log(`Output type ${index + 1}:`, typeof output)

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
                        console.log(`Processing Replicate FileOutput object ${index + 1}...`)
                        const urlResult = output.url()
                        // Ensure we get a string URL
                        if (typeof urlResult === 'string') {
                            imageUrl = urlResult
                        } else if (urlResult && typeof urlResult === 'object' && 'href' in urlResult) {
                            imageUrl = urlResult.href
                        } else {
                            imageUrl = String(urlResult)
                        }
                        console.log(`Extracted URL from FileOutput ${index + 1}:`, urlResult)
                        console.log(`Converted to string ${index + 1}:`, imageUrl)
                    } else if (output && typeof output === 'object') {
                        // Try to extract URL from object properties first
                        const obj = output as any

                        if (obj.url && typeof obj.url === 'string') {
                            imageUrl = obj.url
                            console.log(`Found URL property ${index + 1}:`, imageUrl)
                        } else if (obj.image_url) {
                            imageUrl = obj.image_url
                        } else if (obj.data && obj.data.url) {
                            imageUrl = obj.data.url
                        } else {
                            throw new Error(`Invalid output format from Replicate. Object: ${JSON.stringify(obj)}`)
                        }
                    } else {
                        throw new Error(`Invalid output format from Replicate. Type: ${typeof output}`)
                    }

                    console.log(`Extracted image URL ${index + 1}:`, imageUrl)

                    // Validate that we have a proper URL or data URL
                    if (!imageUrl || typeof imageUrl !== 'string' || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:'))) {
                        throw new Error(`Invalid image URL received: ${typeof imageUrl === 'string' ? imageUrl.substring(0, 100) + '...' : imageUrl}`)
                    }

                    // Upload the generated image to Cloudinary
                    console.log(`Uploading generated image ${index + 1} to Cloudinary...`)

                    const cloudinaryResult = await cloudinary.uploader.upload(imageUrl, {
                        folder: `EcomAIStudio/${user.id}/generated`,
                        public_id: `photoshoot_${photoshoot_id}_${index + 1}_${Date.now()}`,
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

                    console.log(`Image ${index + 1} uploaded to Cloudinary:`, generatedImageUrl)

                    // Create the generated image object
                    return {
                        url: generatedImageUrl,
                        thumbnail_url: thumbnailUrl,
                        created_at: new Date().toISOString(),
                        is_primary: index === 0, // First image is primary
                        generation_prompt: prompt,
                        cloudinary_public_id: cloudinaryResult.public_id,
                        variation_index: index + 1,
                        metadata: {
                            reference_images: reference_images || [],
                            reference_tags: reference_tags || [],
                            replicate_output: output
                        }
                    }
                } catch (error) {
                    console.error(`Error generating image ${index + 1}:`, error)
                    errors.push({ index: index + 1, error: error instanceof Error ? error.message : 'Unknown error' })
                    return null
                }
            })

            // Wait for all images to be generated
            const results = await Promise.all(imagePromises)
            const successfulImages = results.filter(result => result !== null)

            console.log(`Successfully generated ${successfulImages.length}/5 images`)

            if (successfulImages.length === 0) {
                throw new Error('Failed to generate any images')
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

            // Add all new images to the generated_images array
            const existingImages = currentPhotoshoot.generated_images || []
            const updatedImages = [...existingImages, ...successfulImages]

            // Update photoshoot with new images and status
            const { data: updatedPhotoshoot, error: updateError } = await supabaseAdmin
                .from('photoshoots')
                .update({
                    status: 'completed',
                    generated_image_url: successfulImages[0].url, // Keep first image for backward compatibility
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

            // Deduct credits (5 credits per image, so 25 total)
            const creditsUsed = successfulImages.length * 5
            const creditsDeducted = await supabaseAdmin.rpc('update_user_credits', {
                user_id_param: user.id,
                amount_param: -creditsUsed,
                transaction_type_param: 'usage',
                description_param: `Photoshoot generation (${successfulImages.length} images)`,
                reference_id_param: photoshoot_id
            })

            console.log(`Photoshoot generation completed successfully. Generated ${successfulImages.length} images, used ${creditsUsed} credits`)

            return NextResponse.json({
                success: true,
                photoshoot: updatedPhotoshoot,
                generated_images: successfulImages,
                images_generated: successfulImages.length,
                credits_used: creditsUsed,
                errors: errors.length > 0 ? errors : undefined,
                message: errors.length > 0
                    ? `Generated ${successfulImages.length}/5 images (${errors.length} failed)`
                    : 'All 5 photoshoot images generated successfully'
            })

        } catch (replicateError) {
            console.error('Replicate generation error:', replicateError)

            // Update photoshoot status to failed
            await supabaseAdmin
                .from('photoshoots')
                .update({
                    status: 'failed',
                    generation_settings: {
                        final_prompts: enhancedPrompts,
                        reference_images: reference_images || [],
                        reference_tags: reference_tags || [],
                        error: replicateError instanceof Error ? replicateError.message : 'Unknown error'
                    }
                })
                .eq('id', photoshoot_id)
                .eq('user_id', user.id)

            return NextResponse.json({
                error: 'Failed to generate images',
                details: replicateError instanceof Error ? replicateError.message : 'Unknown error'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Error generating photoshoot images:', error)

        return NextResponse.json({
            error: 'Failed to generate photoshoot images',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 