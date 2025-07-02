'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload, { UploadedFile } from '@/components/ImageUpload'

interface Product {
    id: string
    name: string
    tag: string
    image_url: string
    dimensions: {
        width: number
        height: number
        unit: string
    }
    physical_dimensions?: {
        width: number
        length: number
        depth: number
        unit: string
    }
    created_at: string
    metadata?: any
}

interface ProductDetailPageProps {
    params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [productName, setProductName] = useState('')
    const [physicalDimensions, setPhysicalDimensions] = useState({
        width: 0,
        length: 0,
        depth: 0,
        unit: 'cm'
    })
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [productId, setProductId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const resolvedParams = await params
                const id = resolvedParams.id
                setProductId(id)

                const response = await fetch(`/api/products/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setProduct(data.product)
                    setProductName(data.product.name)
                    if (data.product.physical_dimensions) {
                        setPhysicalDimensions(data.product.physical_dimensions)
                    }
                } else {
                    setError('Product not found')
                }
            } catch (err) {
                setError('Failed to load product')
                console.error('Error fetching product:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [params])

    const handleFileSelected = (files: UploadedFile[]) => {
        setSelectedFile(files.length > 0 ? files[0] : null)
        setError(null)
    }

    const handleSaveChanges = async () => {
        if (!product) return

        if (!productName.trim()) {
            setError('Product name is required')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            // If image was changed, upload new image first
            if (selectedFile) {
                const formData = new FormData()
                formData.append('file', selectedFile.file)
                formData.append('productName', productName.trim())
                formData.append('productId', product.id)

                const response = await fetch('/api/products/update-image', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error('Failed to update image')
                }

                const result = await response.json()
                setProduct(result.product)
                setSelectedFile(null)
            } else {
                // Just update the name and physical dimensions
                const response = await fetch(`/api/products/${product.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: productName.trim(),
                        physical_dimensions: physicalDimensions
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to update product')
                }

                const result = await response.json()
                setProduct(result.product)
            }

            setIsEditMode(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)

        } catch (error) {
            console.error('Save error:', error)
            setError('Failed to save changes. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        setSelectedFile(null)
        setProductName(product?.name || '')
        if (product?.physical_dimensions) {
            setPhysicalDimensions(product.physical_dimensions)
        }
        setError(null)
    }

    const handleDeleteProduct = async () => {
        if (!product) return

        if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        setError(null)

        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                // Redirect to products page after successful deletion
                router.push('/products')
            } else {
                setError('Failed to delete product')
            }
        } catch (err) {
            console.error('Delete error:', err)
            setError('Failed to delete product')
        } finally {
            setIsDeleting(false)
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

    const formatDimensions = (dimensions: any) => {
        if (!dimensions) return 'Unknown'
        return `${dimensions.width} × ${dimensions.height} ${dimensions.unit || 'px'}`
    }

    if (isLoading) {
        return (
            <DashboardLayout
                title="Loading..."
                breadcrumbs={[
                    { name: 'Products', href: '/products' },
                    { name: 'Loading...' }
                ]}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading product...</span>
                </div>
            </DashboardLayout>
        )
    }

    if (error && !product) {
        return (
            <DashboardLayout
                title="Error"
                breadcrumbs={[
                    { name: 'Products', href: '/products' },
                    { name: 'Error' }
                ]}
            >
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Product Not Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                        Back to Products
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            title={product?.name || 'Product Details'}
            breadcrumbs={[
                { name: 'Products', href: '/products' },
                { name: product?.name || 'Product Details' }
            ]}
        >
            <div className="max-w-4xl mx-auto">
                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Changes saved successfully!
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {isEditMode ? (
                                <div className="space-y-4">
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
                                            disabled={isSaving}
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
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
                                                >
                                                    <option value="cm">cm</option>
                                                    <option value="in">in</option>
                                                    <option value="mm">mm</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {product?.name}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Created {product && formatDate(product.created_at)}
                                    </p>
                                    {/* Physical Dimensions Display */}
                                    {product?.physical_dimensions && (
                                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Dimensions:</span> {product.physical_dimensions.width} × {product.physical_dimensions.length} × {product.physical_dimensions.depth} {product.physical_dimensions.unit}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="ml-4 flex space-x-2">
                            {!isEditMode ? (
                                <>
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        disabled={isDeleting}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Product
                                    </button>
                                    <button
                                        onClick={handleDeleteProduct}
                                        disabled={isDeleting}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm font-medium rounded-lg text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Product
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving || !productName.trim()}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Image Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Product Image
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Image */}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                {isEditMode && selectedFile ? 'Preview (New Image)' : 'Current Image'}
                            </h4>
                            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square">
                                <img
                                    src={isEditMode && selectedFile ? selectedFile.preview : product?.image_url}
                                    alt={product?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Image Details & Upload */}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                Image Details
                            </h4>
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {product && formatDimensions(product.dimensions)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">CDN URL:</span>
                                    <a
                                        href={product?.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline max-w-xs truncate"
                                    >
                                        View Original
                                    </a>
                                </div>
                            </div>

                            {/* Upload New Image (only in edit mode) */}
                            {isEditMode && (
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        {selectedFile ? 'Change Image Again' : 'Replace Image'}
                                    </h4>
                                    <ImageUpload
                                        onFilesSelected={handleFileSelected}
                                        multiple={false}
                                    />
                                    {selectedFile && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                            New image selected. Save changes to apply.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
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
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
} 