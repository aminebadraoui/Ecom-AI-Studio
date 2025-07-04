'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

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

export default function PhotoshootsPage() {
    const router = useRouter()
    const [photoshoots, setPhotoshoots] = useState<Photoshoot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchPhotoshoots()
    }, [])

    const fetchPhotoshoots = async () => {
        try {
            const response = await fetch('/api/photoshoots')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch photoshoots')
            }

            setPhotoshoots(data.photoshoots || [])
        } catch (error) {
            console.error('Error fetching photoshoots:', error)
            setError(error instanceof Error ? error.message : 'Failed to load photoshoots')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    return (
        <DashboardLayout title="Photoshoots">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Photoshoots
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create AI-powered photoshoots with your products and models
                        </p>
                    </div>
                    <Link
                        href="/photoshoots/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Photoshoot
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error loading photoshoots
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && photoshoots.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No photoshoots yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first AI-powered photoshoot.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/photoshoots/new"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Photoshoot
                            </Link>
                        </div>
                    </div>
                )}

                {/* Photoshoots Grid */}
                {!loading && !error && photoshoots.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {photoshoots.map((photoshoot) => (
                            <Link
                                key={photoshoot.id}
                                href={`/photoshoots/${photoshoot.id}`}
                                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md overflow-hidden"
                            >
                                {/* Image */}
                                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                    {photoshoot.generated_images && photoshoot.generated_images.length > 0 ? (
                                        <img
                                            src={photoshoot.generated_images[0].url}
                                            alt={photoshoot.products.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                            }}
                                        />
                                    ) : photoshoot.generated_image_url ? (
                                        <img
                                            src={photoshoot.generated_image_url}
                                            alt={photoshoot.products.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K'
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(photoshoot.status)}`}>
                                            {getStatusText(photoshoot.status)}
                                        </span>
                                    </div>

                                    {/* Multiple Images Indicator */}
                                    {photoshoot.generated_images && photoshoot.generated_images.length > 1 && (
                                        <div className="absolute bottom-3 right-3">
                                            <div className="flex items-center px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {photoshoot.generated_images.length}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                        {photoshoot.name || photoshoot.generation_settings?.name || photoshoot.products.name}
                                    </h3>

                                    {/* Details */}
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            {photoshoot.products.name}
                                            {photoshoot.products.tag && (
                                                <span className="ml-1 text-xs text-gray-400">#{photoshoot.products.tag}</span>
                                            )}
                                        </div>

                                        {photoshoot.models && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {photoshoot.models.name}
                                                {photoshoot.models.tag && (
                                                    <span className="ml-1 text-xs text-gray-400">#{photoshoot.models.tag}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {photoshoot.style_type === 'professional' ? 'Professional' : 'UGC'} • {photoshoot.generation_settings?.type === 'product_only' ? 'Product Only' : 'With Model'}
                                            </span>
                                            {photoshoot.credits_used && (
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    {photoshoot.credits_used} credits
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Created {formatDate(photoshoot.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
} 