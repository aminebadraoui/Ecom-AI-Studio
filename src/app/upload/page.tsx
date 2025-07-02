'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload, { UploadedFile } from '@/components/ImageUpload'

export default function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedProduct, setUploadedProduct] = useState<any | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFileSelected = (files: UploadedFile[]) => {
        // Since we're in single mode, take the first file
        setSelectedFile(files.length > 0 ? files[0] : null)
        setUploadedProduct(null) // Reset uploaded product when new file is selected
        setUploadError(null) // Reset any previous errors
        console.log('Selected file:', files[0])
    }

    const handleUploadToServer = async () => {
        if (!selectedFile) {
            alert('Please select a product image first')
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            // Create FormData for upload
            const formData = new FormData()
            formData.append('file', selectedFile.file)

            // Upload to API
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            // Success!
            setUploadedProduct(result)
            console.log('Upload successful:', result)

            // Show success message
            alert(`Successfully uploaded "${selectedFile.file.name}"! Your image is now stored in our CDN and ready for AI processing.`)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            setUploadError(errorMessage)
            console.error('Upload error:', error)
            alert(`Upload failed: ${errorMessage}`)
        } finally {
            setIsUploading(false)
        }
    }

    const handleClearFile = () => {
        setSelectedFile(null)
        setUploadedProduct(null)
        setUploadError(null)
        console.log('Cleared selected file')
    }

    return (
        <DashboardLayout
            title="Upload Product Photo"
            breadcrumbs={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Upload' }
            ]}
        >
            {/* Upload Component */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Product Image Upload
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a single product image for AI-powered enhancement and background editing.
                    </p>
                </div>

                <ImageUpload
                    onFilesSelected={handleFileSelected}
                    multiple={false}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024} // 10MB
                    className="mb-6"
                />

                {/* Upload Status */}
                {selectedFile && !uploadedProduct && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Image ready for upload
                                </h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <p>
                                        "{selectedFile.file.name}" •
                                        Size: {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Success */}
                {uploadedProduct && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                    ✅ Successfully uploaded to CDN
                                </h3>
                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    <p>
                                        Product ID: {uploadedProduct.productId} •
                                        CDN URL: <a href={uploadedProduct.imageUrl} target="_blank" rel="noopener noreferrer" className="underline">View Image</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Upload failed
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>{uploadError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleUploadToServer}
                        disabled={!selectedFile || isUploading || !!uploadedProduct}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {uploadedProduct ? 'Uploaded to CDN' : 'Upload to CDN'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleClearFile}
                        disabled={isUploading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                        {uploadedProduct ? 'Upload Another' : 'Clear'}
                    </button>
                </div>
            </div>

            {/* Image Preview */}
            {(selectedFile || uploadedProduct) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Image Preview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                {uploadedProduct ? 'CDN Optimized Image' : 'Original Image'}
                            </h4>
                            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square">
                                <img
                                    src={uploadedProduct ? uploadedProduct.imageUrl : selectedFile?.preview}
                                    alt={uploadedProduct ? `Product ${uploadedProduct.productId}` : selectedFile?.file.name}
                                    className="w-full h-full object-cover"
                                />
                                {uploadedProduct && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        CDN
                                    </div>
                                )}
                            </div>
                            {uploadedProduct && (
                                <div className="mt-2">
                                    <a
                                        href={uploadedProduct.thumbnailUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        View 400x400 thumbnail
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                {uploadedProduct ? 'Product Details' : 'File Details'}
                            </h4>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                {uploadedProduct ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Product ID:</span>
                                            <span className="truncate ml-2">{uploadedProduct.productId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">CDN URL:</span>
                                            <a
                                                href={uploadedProduct.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline truncate ml-2"
                                            >
                                                View full image
                                            </a>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Filename:</span>
                                            <span className="truncate ml-2">{uploadedProduct.fileName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">File Size:</span>
                                            <span>{(uploadedProduct.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">File Type:</span>
                                            <span>{uploadedProduct.fileType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Dimensions:</span>
                                            <span>{uploadedProduct.dimensions.width} × {uploadedProduct.dimensions.height} px</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Cloudinary ID:</span>
                                            <span className="truncate ml-2 text-xs">{uploadedProduct.cloudinaryPublicId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Status:</span>
                                            <span className="text-green-600 dark:text-green-400">✅ Uploaded to CDN</span>
                                        </div>
                                    </>
                                ) : selectedFile && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Filename:</span>
                                            <span className="truncate ml-2">{selectedFile.file.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Size:</span>
                                            <span>{(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Type:</span>
                                            <span>{selectedFile.file.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Dimensions:</span>
                                            <span>Will be detected after upload</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Status:</span>
                                            <span className="text-blue-600 dark:text-blue-400">Ready to upload</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    AI Enhancement Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                            ✨ Available Enhancements
                        </h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Background removal & replacement
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Color correction & enhancement
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Professional lighting adjustment
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Shadow & reflection generation
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Multiple format exports
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                            📋 Best Practices
                        </h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                <span>Use high-resolution images (minimum 1000px)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                <span>Ensure good lighting on the product</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                <span>Product should be the main focus</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                <span>JPG or PNG formats work best</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                <span>Image upload is free - AI processing costs 1 credit</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 