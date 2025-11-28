import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Announcement } from '../../types';
import { useLangStore, useAuthStore, useToastStore } from '../../store';
import { MegaphoneIcon, MapPinIcon, PencilIcon, TrashIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from './LoadingStates';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { Role } from '../../types';

interface EnhancedAnnouncementsViewProps {
    className?: string;
}

export const EnhancedAnnouncementsView: React.FC<EnhancedAnnouncementsViewProps> = ({ className = '' }) => {
    const { t } = useLangStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Check if user can edit (Manager or Admin)
    const canEdit = user && (user.role === Role.MANAGER || user.role === Role.ADMIN);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = () => {
        setLoading(true);
        api.getAnnouncements().then(res => {
            // Sort sticky first, then by date (newest first)
            const sorted = res.sort((a, b) => {
                if (a.isSticky && !b.isSticky) return -1;
                if (!a.isSticky && b.isSticky) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setAnnouncements(sorted);
            setLoading(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const val = (name: string) => (form.elements.namedItem(name) as any).value;
        
        try {
            const item: Announcement = {
                id: editing ? editing.id : Date.now().toString(),
                title: val('title'),
                description: val('description'),
                category: val('category'),
                date: editing?.date || new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
                isSticky: (form.elements.namedItem('isSticky') as HTMLInputElement)?.checked || false
            };
            
            await api.saveAnnouncement(item);
            addToast(editing ? 'Announcement updated successfully' : 'Announcement posted successfully', 'success');
            setModalOpen(false);
            setEditing(null);
            loadAnnouncements();
        } catch (e) {
            addToast('Error saving announcement', 'error');
        }
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await api.deleteAnnouncement(deleteId);
                addToast('Announcement deleted successfully', 'info');
                setDeleteId(null);
                loadAnnouncements();
            } catch (e) {
                addToast('Error deleting announcement', 'error');
            }
        }
    };

    const openEdit = (item: Announcement) => {
        setEditing(item);
        setModalOpen(true);
    };

    const openNew = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'urgent': return 'badge-error';
            case 'maintenance': return 'badge-warning';
            case 'event': return 'badge-info';
            case 'general': return 'badge-neutral';
            default: return 'badge-ghost';
        }
    };

    return (
        <div className={`space-y-8 animate-fade-in pb-10 ${className}`}>
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto py-8">
                <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MegaphoneIcon className="w-8 h-8" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-left flex-1">
                        <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-accent font-cairo mb-2">Community Announcements</h1>
                        <p className="text-gray-500">Stay updated with the latest news and important information.</p>
                    </div>
                    {canEdit && (
                        <button 
                            onClick={openNew}
                            className="btn btn-primary text-white gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Announcement
                        </button>
                    )}
                </div>
            </div>

            {/* Announcements List */}
            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                    {announcements.map(ann => (
                        <div 
                            key={ann.id} 
                            className={`card bg-base-100 shadow-lg transition-all hover:translate-x-2 group relative ${
                                ann.isSticky 
                                    ? 'border-l-4 border-brand-accent bg-brand-accent/5' 
                                    : 'border border-gray-100 dark:border-gray-700 hover:shadow-xl'
                            }`}
                        >
                            {/* Management Controls - Show on Hover for Authorized Users */}
                            {canEdit && (
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                    <button
                                        onClick={() => openEdit(ann)}
                                        className="btn btn-xs btn-square btn-ghost bg-white/90 hover:bg-white shadow-lg"
                                        title="Edit Announcement"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(ann.id)}
                                        className="btn btn-xs btn-square btn-ghost bg-white/90 hover:bg-red-100 text-red-600 shadow-lg"
                                        title="Delete Announcement"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            <div className="card-body">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div className="flex-1">
                                        {/* Sticky Badge */}
                                        {ann.isSticky && (
                                            <div className="badge badge-accent text-white gap-1 mb-3 uppercase font-bold text-xs w-fit">
                                                <MapPinIcon className="w-3 h-3" />
                                                Pinned
                                            </div>
                                        )}
                                        
                                        {/* Title */}
                                        <h2 className="card-title text-xl font-bold text-brand-primary dark:text-white mb-2">
                                            {ann.title}
                                        </h2>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {ann.description}
                                        </p>
                                    </div>
                                    
                                    {/* Meta Information */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-3 min-w-[120px]">
                                        {/* Category Badge */}
                                        <div className={`badge ${getCategoryColor(ann.category)} gap-1`}>
                                            {ann.category}
                                        </div>
                                        
                                        {/* Date */}
                                        <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                            <CalendarIcon className="w-3 h-3" />
                                            {formatDate(ann.date)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Empty State */}
                    {announcements.length === 0 && (
                        <div className="text-center py-16">
                            <MegaphoneIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-500 mb-2">No announcements yet</h3>
                            <p className="text-gray-400">
                                {canEdit 
                                    ? "Click 'Add Announcement' to create your first announcement."
                                    : "Check back later for important updates."
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }} 
                title={editing ? 'Edit Announcement' : 'Add New Announcement'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label font-bold">Title</label>
                        <input 
                            name="title" 
                            defaultValue={editing?.title} 
                            className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            placeholder="Announcement Title" 
                            required 
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label font-bold">Category</label>
                        <select 
                            name="category" 
                            defaultValue={editing?.category || 'General'} 
                            className="select select-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
                        >
                            <option value="General">General</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Event">Event</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                    
                    <div className="form-control">
                        <label className="label font-bold">Description</label>
                        <textarea 
                            name="description" 
                            defaultValue={editing?.description} 
                            className="textarea textarea-bordered w-full h-32 bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            placeholder="Announcement details..." 
                            required
                        ></textarea>
                    </div>
                    
                    <div className="form-control">
                        <label className="label font-bold">Date</label>
                        <input 
                            name="date" 
                            type="date" 
                            defaultValue={editing?.date || new Date().toISOString().split('T')[0]} 
                            className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            required 
                        />
                    </div>
                    
                    {/* Sticky/Pin Option */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3 border border-gray-200 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <input 
                                name="isSticky" 
                                type="checkbox" 
                                defaultChecked={editing?.isSticky || false} 
                                className="checkbox checkbox-primary" 
                            />
                            <span className="label-text font-bold">Pin to Homepage</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-3">
                            Pinned announcements appear at the top and stay visible longer
                        </p>
                    </div>
                    
                    <div className="modal-action">
                        <button 
                            type="button" 
                            onClick={() => {
                                setModalOpen(false);
                                setEditing(null);
                            }} 
                            className="btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary text-white px-8">
                            {editing ? 'Update Announcement' : 'Post Announcement'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? This will remove it from the public board."
            />
        </div>
    );
};