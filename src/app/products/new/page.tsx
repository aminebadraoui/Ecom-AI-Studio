'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload, { UploadedFile } from '@/components/ImageUpload'

export default function NewProductPage() {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
    const [productName, setProductName] = useState('')
    const [physicalDimensions, setPhysicalDimensions] = useState({
        width: 0,
        length: 0,
        depth: 0,
        unit: 'cm'
    })
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFileSelected = (files: UploadedFile[]) => {
        // Since we're in single mode, take the first file
        setSelectedFile(files.length > 0 ? files[0] : null)
        setUploadError(null) // Reset any previous errors

        // Auto-generate product name from filename if not set
        if (!productName && files.length > 0) {
            const filename = files[0].file.name
            const nameWithoutExtension = filename.split('.')[0]
            // Clean up filename for product name
            const cleanName = nameWithoutExtension
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
            setProductName(cleanName)
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
    }

    const handleCreateProduct = async () => {
        if (!selectedFile) {
            setUploadError('Please select a product image first')
            return
        }

        if (!productName.trim()) {
            setUploadError('Please enter a product name')
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            // Upload image to Cloudinary and create product record
            const formData = new FormData()
            formData.append('file', selectedFile.file)
            formData.append('productName', productName.trim())
            formData.append('physicalDimensions', JSON.stringify(physicalDimensions))

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const result = await response.json()

            // Redirect to the product detail page
            router.push(`/products/${result.productId}`)

        } catch (error) {
            console.error('Upload error:', error)
            setUploadError('Failed to create product. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <DashboardLayout
            title="Create New Product"
            breadcrumbs={[
                { name: 'Products', href: '/products' },
                { name: 'Create New Product' }
            ]}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Create New Product
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Upload a product image and give it a name to get started
                    </p>
                </div>

                {/* Product Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <div className="space-y-6">
                        {/* Product Name Input */}
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter a descriptive name for your product"
                                disabled={isUploading}
                            />
                        </div>

                        {/* Physical Dimensions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Physical Dimensions
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                                    <input
                                        type="number"
                                        value={physicalDimensions.width}
                                        onChange={(e) => setPhysicalDimensions({ ...physicalDimensions, width: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="0"
                                        disabled={isUploading}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Length</label>
                                    <input
                                        type="number"
                                        value={physicalDimensions.length}
                                        onChange={(e) => setPhysicalDimensions({ ...physicalDimensions, length: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="0"
                                        disabled={isUploading}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Depth</label>
                                    <input
                                        type="number"
                                        value={physicalDimensions.depth}
                                        onChange={(e) => setPhysicalDimensions({ ...physicalDimensions, depth: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="0"
                                        disabled={isUploading}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                                    <select
                                        value={physicalDimensions.unit}
                                        onChange={(e) => setPhysicalDimensions({ ...physicalDimensions, unit: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        disabled={isUploading}
                                    >
                                        <option value="cm">cm</option>
                                        <option value="in">in</option>
                                        <option value="mm">mm</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Product Image
                            </label>
                            <ImageUpload
                                onFilesSelected={handleFileSelected}
                                multiple={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Image Preview & Details */}
                {selectedFile && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Image Preview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Product Image
                                </h4>
                                <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square">
                                    <img
                                        src={selectedFile.preview}
                                        alt="Product preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Image Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">File name:</span>
                                        <span className="text-gray-900 dark:text-gray-100">{selectedFile.file.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">File size:</span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">File type:</span>
                                        <span className="text-gray-900 dark:text-gray-100">{selectedFile.file.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {uploadError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {uploadError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreateProduct}
                        disabled={!selectedFile || !productName.trim() || isUploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating Product...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create Product
                            </>
                        )}
                    </button>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                About Product Creation
                            </h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Images are uploaded to our global CDN for fast delivery</li>
                                    <li>Supported formats: JPG, PNG, WebP (max 10MB)</li>
                                    <li>Creating a product is free - AI processing costs 1 credit</li>
                                    <li>You can edit the product name and replace the image later</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 