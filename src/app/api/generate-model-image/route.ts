import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Replicate from 'replicate'
import { v2 as cloudinary } from 'cloudinary'

// Configure Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
})

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

        // Check if user has enough credits (3 credits required)
        if (user.credits < 3) {
            return NextResponse.json(
                { error: 'Insufficient credits. 3 credits required for AI model generation.' },
                { status: 400 }
            )
        }

        const { prompt, modelName } = await request.json()

        if (!prompt || !modelName) {
            return NextResponse.json(
                { error: 'Prompt and model name are required' },
                { status: 400 }
            )
        }

        console.log('Generating image with prompt:', prompt)

        // Generate image with Imagen-4 via Replicate
        const output = await replicate.run(
            "google/imagen-4", // Correct Imagen-4 model on Replicate
            {
                input: {
                    prompt: prompt,
                    aspect_ratio: "1:1", // Square format for portraits
                    safety_filter_level: "block_medium_and_above"
                }
            }
        ) as unknown as string

        if (!output) {
            return NextResponse.json(
                { error: 'Failed to generate image' },
                { status: 500 }
            )
        }

        const imageUrl = output
        console.log('Generated image URL:', imageUrl)

        // Download and upload to Cloudinary
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
            throw new Error('Failed to download generated image')
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const buffer = Buffer.from(imageBuffer)

        // Generate unique name and tag
        const uniqueName = await generateUniqueName(modelName, user.id)
        const tag = generateTag(uniqueName)

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: `EcomAIStudio/${user.id}`, // Organize by user ID in EcomAIStudio folder
                    public_id: `ai_model_${Date.now()}`, // Unique public ID for AI generated models
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }, // Auto optimization
                        { width: 1024, height: 1024, crop: 'limit' } // Ensure good resolution
                    ],
                    tags: ['model-image', 'ai-generated'] // Tags for organization
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

        // Deduct 3 credits from user
        const { error: creditError } = await supabaseAdmin
            .from('users')
            .update({ credits: user.credits - 3 })
            .eq('id', user.id)

        if (creditError) {
            console.error('Failed to deduct credits:', creditError)
            // Continue anyway, but log the issue
        }

        // Store model in database
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
                    generation_method: 'ai',
                    prompt: prompt,
                    model_used: 'imagen-4',
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

        console.log('AI model created successfully:', model.id)

        return NextResponse.json({
            success: true,
            modelId: model.id,
            url: cloudinaryResult.secure_url,
            model: model,
            creditsUsed: 3,
            creditsRemaining: user.credits - 3
        })

    } catch (error) {
        console.error('Error generating model image:', error)

        if (error instanceof Error) {
            if (error.message.includes('REPLICATE_API_TOKEN')) {
                return NextResponse.json(
                    { error: 'Replicate API configuration error. Please check your API token.' },
                    { status: 500 }
                )
            }

            if (error.message.includes('Rate limit')) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again later.' },
                    { status: 429 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 