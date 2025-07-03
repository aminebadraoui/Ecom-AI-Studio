'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload, { UploadedFile } from '@/components/ImageUpload'

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

export default function ModelDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [model, setModel] = useState<Model | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        async function fetchModel() {
            try {
                const modelId = await params.id
                const response = await fetch(`/api/models/${modelId}`)

                if (response.ok) {
                    const data = await response.json()
                    setModel(data.model)
                    setEditedName(data.model.name)
                } else if (response.status === 404) {
                    router.push('/models')
                } else {
                    setMessage({ type: 'error', text: 'Failed to load model' })
                }
            } catch (error) {
                console.error('Error fetching model:', error)
                setMessage({ type: 'error', text: 'Failed to load model' })
            } finally {
                setIsLoading(false)
            }
        }

        fetchModel()
    }, [params.id, router])

    const handleFileSelected = (files: UploadedFile[]) => {
        setSelectedFile(files.length > 0 ? files[0] : null)
        setMessage(null)
    }

    const handleUpdateModel = async () => {
        if (!model) return

        setIsUpdating(true)
        setMessage(null)

        try {
            let imageUrl = model.image_url

            // Upload new image if selected
            if (selectedFile) {
                const formData = new FormData()
                formData.append('file', selectedFile.file)
                formData.append('modelId', model.id)

                const uploadResponse = await fetch('/api/models/update-image', {
                    method: 'POST',
                    body: formData,
                })

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json()
                    throw new Error(errorData.error || 'Failed to upload new image')
                }

                const uploadResult = await uploadResponse.json()
                imageUrl = uploadResult.url
            }

            // Update model
            const response = await fetch(`/api/models/${model.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedName,
                    image_url: imageUrl,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update model')
            }

            const result = await response.json()
            setModel(result.model)
            setSelectedFile(null)
            setIsEditing(false)
            setMessage({ type: 'success', text: 'Model updated successfully!' })

        } catch (error) {
            console.error('Error updating model:', error)
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update model'
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteModel = async () => {
        if (!model) return

        if (!window.confirm(`Are you sure you want to delete "${model.name}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/models/${model.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                router.push('/models')
            } else {
                setMessage({ type: 'error', text: 'Failed to delete model' })
            }
        } catch (error) {
            console.error('Delete error:', error)
            setMessage({ type: 'error', text: 'Failed to delete model' })
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

    if (isLoading) {
        return (
            <DashboardLayout
                title="Loading..."
                breadcrumbs={[
                    { name: 'Models', href: '/models' },
                    { name: 'Loading...' }
                ]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading model...</span>
                </div>
            </DashboardLayout>
        )
    }

    if (!model) {
        return (
            <DashboardLayout
                title="Model Not Found"
                breadcrumbs={[
                    { name: 'Models', href: '/models' },
                    { name: 'Not Found' }
                ]}
            >
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Model not found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        The model you're looking for doesn't exist or has been deleted.
                    </p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            title={model.name}
            breadcrumbs={[
                { name: 'Models', href: '/models' },
                { name: model.name }
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex">
                            <svg className={`h-5 w-5 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                {message.type === 'success' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                )}
                            </svg>
                            <div className="ml-3">
                                <p className={`text-sm ${message.type === 'success'
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Model Face
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                >
                                    Edit Model
                                </button>
                                <button
                                    onClick={handleDeleteModel}
                                    className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                >
                                    Delete Model
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditedName(model.name)
                                        setSelectedFile(null)
                                        setMessage(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateModel}
                                    disabled={isUpdating || !editedName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Model Image */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Model Image
                            </h3>

                            {/* Current Image */}
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={selectedFile ? selectedFile.preview : model.image_url}
                                    alt={model.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBBMjUgMjUgMCAxIDEgMTAwIDEwMEEyNSAyNSAwIDAgMSAxMDAgNTBaTTEwMCAxMjVBNTAgNTAgMCAwIDAgNTAgMTc1SDE1MEE1MCA1MCAwIDAgMCAxMDAgMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                                    }}
                                />
                            </div>

                            {/* Image Upload (Edit Mode) */}
                            {isEditing && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Change Image
                                    </h4>
                                    <ImageUpload
                                        maxFiles={1}
                                        onFilesSelected={handleFileSelected}
                                        accept={{
                                            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                                        }}
                                        multiple={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Model Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Model Details
                            </h3>

                            <div className="space-y-4">
                                {/* Model Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {model.name}
                                        </p>
                                    )}
                                </div>

                                {/* Tag */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tag
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                                        {model.tag}
                                    </p>
                                </div>

                                {/* Created Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Created
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {formatDate(model.created_at)}
                                    </p>
                                </div>

                                {/* Dimensions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dimensions
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {model.dimensions?.width} × {model.dimensions?.height} pixels
                                    </p>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Image URL
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400 break-all text-sm font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        {model.image_url}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 