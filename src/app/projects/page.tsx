'use client'

import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

export default function ProjectsPage() {
    // Mock data for demonstration
    const projects = [
        {
            id: 1,
            name: 'Product Catalog Q4',
            description: 'Winter collection product photos',
            imageCount: 24,
            status: 'completed',
            createdAt: '2024-01-15',
            thumbnail: '/api/placeholder/300/200'
        },
        {
            id: 2,
            name: 'Summer Collection',
            description: 'Beach and summer product line',
            imageCount: 18,
            status: 'in-progress',
            createdAt: '2024-01-10',
            thumbnail: '/api/placeholder/300/200'
        },
        {
            id: 3,
            name: 'Electronics Showcase',
            description: 'Tech product photography',
            imageCount: 12,
            status: 'completed',
            createdAt: '2024-01-05',
            thumbnail: '/api/placeholder/300/200'
        }
    ]

    const stats = [
        { name: 'Total Projects', value: projects.length, icon: '📁' },
        { name: 'Images Processed', value: projects.reduce((sum, p) => sum + p.imageCount, 0), icon: '🖼️' },
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: '✅' },
        { name: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, icon: '⏳' }
    ]

    return (
        <DashboardLayout
            title="My Projects"
            breadcrumbs={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Projects' }
            ]}
        >
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Project Gallery
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage and organize your photo editing projects
                    </p>
                </div>
                <Link
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="text-2xl mr-3">{stat.icon}</div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {stat.name}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                            {/* Project Thumbnail */}
                            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Project Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {project.description}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <span>{project.imageCount} images</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                                        View →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No projects yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start by creating your first project with photo uploads.
                    </p>
                    <Link
                        href="/upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Project
                    </Link>
                </div>
            )}
        </DashboardLayout>
    )
} 