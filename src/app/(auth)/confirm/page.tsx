'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConfirmPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                const token_hash = searchParams.get('token_hash')
                const type = searchParams.get('type')

                if (token_hash && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash,
                        type: type as any,
                    })

                    if (error) {
                        setError(error.message)
                    } else {
                        setSuccess(true)
                        // Redirect to dashboard after successful confirmation
                        setTimeout(() => {
                            router.push('/dashboard')
                        }, 3000)
                    }
                } else {
                    setError('Invalid confirmation link')
                }
            } catch (error) {
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        handleEmailConfirmation()
    }, [searchParams, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Confirming your email...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {success ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Email Confirmed!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully confirmed. You'll be redirected to your dashboard shortly.
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                You now have 5 free credits to get started!
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go to Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Confirmation Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || 'Unable to confirm your email. The link may be expired or invalid.'}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/signup"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Try Signing Up Again
                                </Link>
                                <Link
                                    href="/signin"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
} 