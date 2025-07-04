'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Product {
    id: string
    name: string
    tag: string
    image_url: string
}

interface Model {
    id: string
    name: string
    tag: string
    image_url: string
}

interface Photoshoot {
    id: string
    user_id: string
    name: string
    product_id: string
    model_id?: string | null
    style_type: 'professional' | 'ugc'
    scene_description: string
    ai_suggested: boolean
    generation_settings?: {
        type: 'product_only' | 'with_model'
        style: 'professional' | 'ugc'
        name: string
        scene_details?: string
        product_analysis?: string
        final_prompt?: string
    }
    status: 'pending' | 'generating' | 'completed' | 'failed'
    generated_image_url?: string
    generated_images?: any[]
    credits_used?: number
    created_at: string
    products: Product
    models?: Model | null
}

interface PhotoshootDetailPageProps {
    params: Promise<{ id: string }>
}

export default function PhotoshootDetailPage({ params }: PhotoshootDetailPageProps) {
    const router = useRouter()
    const [photoshoot, setPhotoshoot] = useState<Photoshoot | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)
    const [id, setId] = useState<string | null>(null)

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params
            setId(resolvedParams.id)
        }
        getParams()
    }, [params])

    useEffect(() => {
        if (id) {
            fetchPhotoshoot()
        }
    }, [id])

    const fetchPhotoshoot = async () => {
        if (!id) return

        try {
            const response = await fetch(`/api/photoshoots/${id}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch photoshoot')
            }

            setPhotoshoot(data.photoshoot)
        } catch (error) {
            console.error('Error fetching photoshoot:', error)
            setError(error instanceof Error ? error.message : 'Failed to load photoshoot')
        } finally {
            setLoading(false)
        }
    }

    const handleRegenerate = async () => {
        if (!photoshoot) return

        setGenerating(true)
        try {
            const response = await fetch('/api/generate-photoshoot-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    photoshoot_id: photoshoot.id
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate image')
            }

            // Refresh the photoshoot data
            await fetchPhotoshoot()
        } catch (error) {
            console.error('Error regenerating image:', error)
            setError(error instanceof Error ? error.message : 'Failed to regenerate image')
        } finally {
            setGenerating(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'generating':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed'
            case 'generating':
                return 'Generating...'
            case 'failed':
                return 'Failed'
            default:
                return 'Pending'
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Photoshoot">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !photoshoot) {
        return (
            <DashboardLayout title="Photoshoot">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error loading photoshoot
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {error || 'Photoshoot not found'}
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={photoshoot.name || photoshoot.generation_settings?.name || photoshoot.products.name}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/photoshoots"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                ← Back to Photoshoots
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {photoshoot.name || photoshoot.generation_settings?.name || photoshoot.products.name}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Created {formatDate(photoshoot.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(photoshoot.status)}`}>
                            {getStatusText(photoshoot.status)}
                        </span>
                        {photoshoot.status === 'completed' && (
                            <button
                                onClick={handleRegenerate}
                                disabled={generating}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Regenerating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Regenerate (1 Credit)
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Generated Images */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Generated Images
                        </h2>
                        {photoshoot.generated_images && photoshoot.generated_images.length > 0 ? (
                            <div className="space-y-4">
                                {photoshoot.generated_images.map((image, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={image.url}
                                                alt={`Generated image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                                }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {image.is_primary && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            Primary
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generated {formatDate(image.created_at)}
                                                    </span>
                                                </div>
                                                <a
                                                    href={image.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : photoshoot.generated_image_url ? (
                            // Fallback to old single image format
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img
                                    src={photoshoot.generated_image_url}
                                    alt={photoshoot.generation_settings?.name || photoshoot.products.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {photoshoot.status === 'generating' ? 'Generating...' : 'No image generated yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Product Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Product Details
                            </h3>
                            <div className="flex items-center gap-4">
                                <img
                                    src={photoshoot.products.image_url}
                                    alt={photoshoot.products.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                    }}
                                />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {photoshoot.products.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {photoshoot.products.tag}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Model Details */}
                        {photoshoot.models && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Model Details
                                </h3>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={photoshoot.models.image_url}
                                        alt={photoshoot.models.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {photoshoot.models.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {photoshoot.models.tag}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Photoshoot Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Photoshoot Settings
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Style:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {photoshoot.style_type === 'professional' ? 'Professional' : 'UGC'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {photoshoot.generation_settings?.type === 'product_only' ? 'Product Only' : 'With Model'}
                                    </span>
                                </div>
                                {photoshoot.credits_used && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Credits Used:</span>
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {photoshoot.credits_used}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 