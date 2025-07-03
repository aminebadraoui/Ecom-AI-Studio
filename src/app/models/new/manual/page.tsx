'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload, { UploadedFile } from '@/components/ImageUpload'

export default function ManualModelCreationPage() {
    const router = useRouter()
    const [modelName, setModelName] = useState('')
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileSelected = (files: UploadedFile[]) => {
        setSelectedFile(files.length > 0 ? files[0] : null)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!modelName.trim()) {
            setError('Please enter a model name')
            return
        }

        if (!selectedFile) {
            setError('Please upload an image')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile.file)
            formData.append('modelName', modelName)

            const uploadResponse = await fetch('/api/upload-model-image', {
                method: 'POST',
                body: formData,
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                throw new Error(errorData.error || 'Failed to upload image')
            }

            const result = await uploadResponse.json()
            router.push(`/models/${result.modelId}`)

        } catch (error) {
            console.error('Error creating model:', error)
            setError(error instanceof Error ? error.message : 'Failed to create model')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <DashboardLayout
            title="Manual Model Creation"
            breadcrumbs={[
                { name: 'Models', href: '/models' },
                { name: 'Create New', href: '/models/new' },
                { name: 'Manual Creation' }
            ]}
        >
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Upload Model Image
                        </h2>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Upload a close-up model face image from your device
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Model Name */}
                        <div>
                            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Model Name *
                            </label>
                            <input
                                type="text"
                                id="modelName"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter model name"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Model Image *
                            </label>
                            <ImageUpload
                                maxFiles={1}
                                onFilesSelected={handleFileSelected}
                                accept={{
                                    'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                                }}
                                multiple={false}
                            />
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Upload a clear, well-lit close-up image of a model's face. Maximum file size: 10MB.
                            </p>
                        </div>

                        {/* Preview */}
                        {selectedFile && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                    Preview
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <img
                                            src={selectedFile.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {modelName || 'Untitled Model'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Uploaded image • {Math.round(selectedFile.file.size / 1024)}KB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.push('/models/new')}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading || !selectedFile || !modelName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating Model...
                                    </>
                                ) : (
                                    'Create Model'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex">
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                Tips for Best Results
                            </h3>
                            <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Use high-resolution images (at least 512x512 pixels)</li>
                                    <li>Ensure the face is well-lit and clearly visible</li>
                                    <li>Avoid heavy shadows or extreme lighting</li>
                                    <li>The model should be looking toward the camera</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 