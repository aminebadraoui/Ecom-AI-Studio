'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import Image from 'next/image'

export interface UploadedFile {
    file: File
    preview: string
    id: string
}

interface ImageUploadProps {
    onFilesSelected: (files: UploadedFile[]) => void
    maxFiles?: number
    maxSize?: number // in bytes
    accept?: Record<string, string[]>
    className?: string
    multiple?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onFilesSelected,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB default
    accept = {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    className = '',
    multiple = true
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setErrors([])

        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const newErrors: string[] = []
            rejectedFiles.forEach((rejection) => {
                rejection.errors.forEach((error) => {
                    if (error.code === 'file-too-large') {
                        newErrors.push(`File ${rejection.file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
                    } else if (error.code === 'file-invalid-type') {
                        newErrors.push(`File ${rejection.file.name} is not a supported image format`)
                    } else {
                        newErrors.push(`Error with ${rejection.file.name}: ${error.message}`)
                    }
                })
            })
            setErrors(newErrors)
        }

        // Handle accepted files
        if (acceptedFiles.length > 0) {
            setIsUploading(true)

            const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
                id: Math.random().toString(36).substring(7)
            }))

            const updatedFiles = multiple
                ? [...uploadedFiles, ...newFiles].slice(0, maxFiles)
                : newFiles.slice(0, 1)

            setUploadedFiles(updatedFiles)
            onFilesSelected(updatedFiles)
            setIsUploading(false)
        }
    }, [uploadedFiles, maxFiles, maxSize, multiple, onFilesSelected])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
        maxFiles
    })

    const removeFile = (id: string) => {
        const updatedFiles = uploadedFiles.filter((file) => {
            if (file.id === id) {
                URL.revokeObjectURL(file.preview)
                return false
            }
            return true
        })
        setUploadedFiles(updatedFiles)
        onFilesSelected(updatedFiles)
    }

    const clearAll = () => {
        uploadedFiles.forEach((file) => {
            URL.revokeObjectURL(file.preview)
        })
        setUploadedFiles([])
        onFilesSelected([])
        setErrors([])
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Drop Zone - Hidden when single file mode and file is selected */}
            {!(uploadedFiles.length > 0 && !multiple) && (
                <div
                    {...getRootProps()}
                    className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${isDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Upload Icon */}
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>

                        {/* Upload Text */}
                        <div>
                            {isDragActive ? (
                                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                    Drop your images here
                                </p>
                            ) : (
                                <div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Drag & drop images here, or click to select
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {multiple ? `Up to ${maxFiles} files` : 'Single file only'} •
                                        Max {maxSize / (1024 * 1024)}MB each •
                                        JPG, PNG, WebP, GIF
                                    </p>
                                </div>
                            )}
                        </div>

                        {isUploading && (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Processing...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Upload errors:
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview - Single file mode with larger preview */}
            {uploadedFiles.length > 0 && !multiple && (
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start space-x-4">
                            {/* Image Preview */}
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Image
                                        src={uploadedFiles[0].preview}
                                        alt={uploadedFiles[0].file.name}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {uploadedFiles[0].file.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {(uploadedFiles[0].file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {uploadedFiles[0].file.type}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex space-x-2">
                                {/* Change Image Button */}
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFile(uploadedFiles[0].id)}
                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 shadow-sm text-xs font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Grid - Multiple files mode */}
            {uploadedFiles.length > 0 && multiple && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Uploaded Images ({uploadedFiles.length})
                        </h3>
                        <button
                            onClick={clearAll}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {uploadedFiles.map((uploadedFile) => (
                            <div key={uploadedFile.id} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={uploadedFile.preview}
                                        alt={uploadedFile.file.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFile(uploadedFile.id)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* File Info */}
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={uploadedFile.file.name}>
                                        {uploadedFile.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ImageUpload 