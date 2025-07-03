'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Model {
    id: string
    name: string
    tag: string
    image_url: string
    dimensions: {
        width: number
        height: number
        unit: string
    }
    created_at: string
    metadata?: any
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchModels()
    }, [])

    const fetchModels = async () => {
        try {
            const response = await fetch('/api/models')
            if (response.ok) {
                const data = await response.json()
                setModels(data.models || [])
            } else {
                setError('Failed to fetch models')
            }
        } catch (err) {
            console.error('Error fetching models:', err)
            setError('Failed to fetch models')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteModel = async (modelId: string) => {
        const model = models.find(m => m.id === modelId)
        if (!model) return

        if (!window.confirm(`Are you sure you want to delete "${model.name}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/models/${modelId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                // Remove the model from the list
                setModels(prev => prev.filter(m => m.id !== modelId))
            } else {
                setError('Failed to delete model')
            }
        } catch (err) {
            console.error('Delete error:', err)
            setError('Failed to delete model')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout
                title="Models"
                breadcrumbs={[{ name: 'Models' }]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading models...</span>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            title="Models"
            breadcrumbs={[{ name: 'Models' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Model Faces
                        </h2>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Manage your collection of model face images
                        </p>
                    </div>
                    <Link
                        href="/models/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Model
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Models Grid */}
                {models.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No models yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Get started by creating your first model or generating one with AI.
                        </p>
                        <Link
                            href="/models/new"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Model
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {models.map((model) => (
                            <div key={model.id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                                {/* Model Image */}
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <Link href={`/models/${model.id}`}>
                                        <img
                                            src={model.image_url}
                                            alt={model.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBBMjUgMjUgMCAxIDEgMTAwIDEwMEEyNSAyNSAwIDAgMSAxMDAgNTBaTTEwMCAxMjVBNTAgNTAgMCAwIDAgNTAgMTc1SDE1MEE1MCA1MCAwIDAgMCAxMDAgMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                                            }}
                                        />
                                    </Link>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleDeleteModel(model.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                                        title="Delete model"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Model Info */}
                                <div className="p-4">
                                    <Link href={`/models/${model.id}`}>
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                            {model.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Created {formatDate(model.created_at)}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {model.dimensions?.width} × {model.dimensions?.height}px
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Model
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
} 