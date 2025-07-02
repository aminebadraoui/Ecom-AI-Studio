'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EcomPhotoStudio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Product
            <span className="text-indigo-600"> Photography</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your ecommerce business with professional product photos. Upload your products,
            choose models, and let our AI create stunning photoshoots in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Start Free Trial
            </Link>
            <Link
              href="/signin"
              className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 mb-16">
            🎉 Get 5 free credits when you sign up - No credit card required!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-lg p-6 mb-4">
              <div className="text-3xl mb-2">📸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Products</h3>
              <p className="text-gray-600">
                Simply upload your product images and let our AI analyze and describe them automatically.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-6 mb-4">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Models</h3>
              <p className="text-gray-600">
                Create custom models or let AI generate them based on your specifications.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-6 mb-4">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Photos</h3>
              <p className="text-gray-600">
                Professional or UGC style photoshoots with customizable scenes and settings.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple Credit-Based Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-4">$9.99</div>
              <p className="text-gray-600 mb-4">10 credits</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Product uploads</li>
                <li>• AI descriptions</li>
                <li>• Basic photoshoots</li>
              </ul>
            </div>

            <div className="bg-indigo-50 rounded-lg shadow-lg p-6 border-2 border-indigo-500">
              <div className="text-sm bg-indigo-500 text-white px-3 py-1 rounded-full inline-block mb-2">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-4">$39.99</div>
              <p className="text-gray-600 mb-4">50 credits</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Everything in Starter</li>
                <li>• AI model generation</li>
                <li>• Professional photoshoots</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-4">$149.99</div>
              <p className="text-gray-600 mb-4">200 credits</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Everything included</li>
                <li>• Priority support</li>
                <li>• Bulk operations</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">EcomPhotoStudio</h3>
            <p className="text-gray-400 mb-6">
              Revolutionizing product photography with AI technology
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/signup" className="text-gray-400 hover:text-white">
                Get Started
              </Link>
              <Link href="/signin" className="text-gray-400 hover:text-white">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
