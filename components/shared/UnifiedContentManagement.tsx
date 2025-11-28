import React, { useState } from 'react';
import { useAuthStore } from '../../store';
import { Role } from '../../types';
import { EnhancedAchievementsView } from './EnhancedAchievementsView';
import { EnhancedAnnouncementsView } from './EnhancedAnnouncementsView';
import { TrophyIcon, MegaphoneIcon, PlusIcon } from '@heroicons/react/24/outline';

interface UnifiedContentManagementProps {
    className?: string;
}

export const UnifiedContentManagement: React.FC<UnifiedContentManagementProps> = ({ className = '' }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'achievements' | 'announcements'>('announcements');

    // Check if user can edit (Manager or Admin)
    const canEdit = user && (user.role === Role.MANAGER || user.role === Role.ADMIN);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Tab Navigation */}
            <div className="tabs tabs-boxed bg-base-200 p-1">
                <a 
                    className={`tab tab-lg flex-1 ${activeTab === 'announcements' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    <MegaphoneIcon className="w-5 h-5 mr-2" />
                    Announcements
                </a>
                <a 
                    className={`tab tab-lg flex-1 ${activeTab === 'achievements' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    <TrophyIcon className="w-5 h-5 mr-2" />
                    Achievements
                </a>
            </div>

            {/* Welcome Message for Authorized Users */}
            {canEdit && (
                <div className="alert alert-info bg-brand-lightBg border-brand-primary">
                    <div>
                        <h3 className="font-bold text-brand-primary">Content Management</h3>
                        <div className="text-xs">
                            You have management privileges. Hover over any item to see edit controls, or use the "Add" buttons to create new content.
                        </div>
                    </div>
                </div>
            )}

            {/* Content Based on Active Tab */}
            <div className="transition-all duration-300">
                {activeTab === 'announcements' ? (
                    <EnhancedAnnouncementsView />
                ) : (
                    <EnhancedAchievementsView />
                )}
            </div>

            {/* Quick Stats for Managers/Admins */}
            {canEdit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="card-title text-blue-700 dark:text-blue-300">Announcements</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Manage community news and updates</p>
                                </div>
                                <MegaphoneIcon className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="card-actions justify-end">
                                <button 
                                    className="btn btn-sm btn-outline btn-primary"
                                    onClick={() => setActiveTab('announcements')}
                                >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Add New
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="card-title text-green-700 dark:text-green-300">Achievements</h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">Showcase community successes</p>
                                </div>
                                <TrophyIcon className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="card-actions justify-end">
                                <button 
                                    className="btn btn-sm btn-outline btn-success"
                                    onClick={() => setActiveTab('achievements')}
                                >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Add New
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Information */}
            <div className="card bg-base-100 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="card-body">
                    <h3 className="card-title text-brand-primary mb-4">Features & Capabilities</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Management Features */}
                        <div>
                            <h4 className="font-semibold mb-3 text-brand-accent flex items-center gap-2">
                                <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                                Management Features
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Direct editing from public display</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Hover-based management controls</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Modal-based add/edit interface</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Role-based access control</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Confirmation dialogs for deletion</span>
                                </li>
                            </ul>
                        </div>

                        {/* Content Features */}
                        <div>
                            <h4 className="font-semibold mb-3 text-brand-accent flex items-center gap-2">
                                <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                                Content Features
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">📝</span>
                                    <span>Title, Description, Date fields</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">🖼️</span>
                                    <span>Image & video media support</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">📌</span>
                                    <span>Pin announcements to top</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">📂</span>
                                    <span>Category organization</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">📱</span>
                                    <span>Responsive mobile design</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Role Permissions */}
                    <div className="mt-6 p-4 bg-brand-lightBg rounded-lg">
                        <h4 className="font-semibold mb-3 text-brand-primary">Role Permissions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-green-600">Manager & Admin:</span>
                                <ul className="mt-1 space-y-1 text-gray-600">
                                    <li>• Add new content</li>
                                    <li>• Edit existing content</li>
                                    <li>• Delete content</li>
                                    <li>• Pin announcements</li>
                                </ul>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Mukhtar & Normal User:</span>
                                <ul className="mt-1 space-y-1 text-gray-600">
                                    <li>• View all content</li>
                                    <li>• No management controls</li>
                                    <li>• Read-only access</li>
                                    <li>• Clean interface</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};