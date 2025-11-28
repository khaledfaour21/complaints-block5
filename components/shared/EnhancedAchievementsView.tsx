import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Achievement } from '../../types';
import { useLangStore, useAuthStore, useToastStore } from '../../store';
import { TrophyIcon, CalendarIcon, PhotoIcon, VideoCameraIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CardSkeleton } from './LoadingStates';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { Role } from '../../types';

// Simulating image compression
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
        // In a real app, use 'browser-image-compression'
        setTimeout(() => resolve(file), 200);
    });
};

interface EnhancedAchievementsViewProps {
    className?: string;
}

export const EnhancedAchievementsView: React.FC<EnhancedAchievementsViewProps> = ({ className = '' }) => {
    const { t } = useLangStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Achievement | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Check if user can edit (Manager or Admin)
    const canEdit = user && (user.role === Role.MANAGER || user.role === Role.ADMIN);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = () => {
        setLoading(true);
        api.getAchievements().then(data => {
            setAchievements(data);
            setLoading(false);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploading(true);
            const fileList = Array.from(e.target.files);
            const compressed = await Promise.all(fileList.map(compressImage));
            setFiles(prev => [...prev, ...compressed]);
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const form = e.target as HTMLFormElement;
            const data: Achievement = {
                id: editing ? editing.id : Date.now().toString(),
                title: (form.elements.namedItem('title') as HTMLInputElement).value,
                description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                date: (form.elements.namedItem('date') as HTMLInputElement).value,
                media: editing && editing.media.length > 0 && files.length === 0 
                    ? editing.media // Keep existing media when editing and no new files
                    : files.map(file => ({
                        url: URL.createObjectURL(file), // In real app, upload to server
                        type: file.type.startsWith('video/') ? 'video' : 'image'
                    }))
            };
            
            await api.saveAchievement(data);
            addToast(editing ? 'Achievement updated successfully' : 'Achievement created successfully', 'success');
            setModalOpen(false);
            setEditing(null);
            setFiles([]);
            loadAchievements();
        } catch (error) {
            addToast('Failed to save achievement', 'error');
        }
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await api.deleteAchievement(deleteId);
                addToast('Achievement deleted successfully', 'success');
                setDeleteId(null);
                loadAchievements();
            } catch (error) {
                addToast('Failed to delete achievement', 'error');
            }
        }
    };

    const openEdit = (item: Achievement) => {
        setEditing(item);
        setFiles([]); // Clear files when editing existing item
        setModalOpen(true);
    };

    const openNew = () => {
        setEditing(null);
        setFiles([]);
        setModalOpen(true);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div className={`space-y-8 animate-fade-in pb-10 ${className}`}>
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto py-10">
                <div className="w-16 h-16 bg-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrophyIcon className="w-8 h-8" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-left flex-1">
                        <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-accent font-cairo mb-4">Community Achievements</h1>
                        <p className="text-gray-500">Celebrating the progress and success stories of our community in the Fifth Block.</p>
                    </div>
                    {canEdit && (
                        <button 
                            onClick={openNew}
                            className="btn btn-primary text-white gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Achievement
                        </button>
                    )}
                </div>
            </div>

            {/* Achievements Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievements.map(ach => (
                        <div 
                            key={ach.id} 
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
                        >
                            {/* Management Controls - Show on Hover for Authorized Users */}
                            {canEdit && (
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                    <button
                                        onClick={() => openEdit(ach)}
                                        className="btn btn-xs btn-square btn-ghost bg-white/90 hover:bg-white shadow-lg"
                                        title="Edit Achievement"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(ach.id)}
                                        className="btn btn-xs btn-square btn-ghost bg-white/90 hover:bg-red-100 text-red-600 shadow-lg"
                                        title="Delete Achievement"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Image/Media Section */}
                            <figure className="relative h-56">
                                {ach.media.length === 0 ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <PhotoIcon className="w-12 h-12" />
                                    </div>
                                ) : ach.media.length === 1 ? (
                                    ach.media[0].type === 'video' ? (
                                        <video
                                            src={ach.media[0].url}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={ach.media[0].url}
                                            alt={ach.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    )
                                ) : (
                                    <div className="grid grid-cols-2 gap-1 h-full">
                                        {ach.media.slice(0, 4).map((media, index) => (
                                            <div key={index} className="relative overflow-hidden">
                                                {media.type === 'video' ? (
                                                    <video
                                                        src={media.url}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        muted
                                                    />
                                                ) : (
                                                    <img
                                                        src={media.url}
                                                        alt={`${ach.title} ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                )}
                                                {index === 3 && ach.media.length > 4 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="text-white font-bold text-lg">+{ach.media.length - 4}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </figure>

                            {/* Content Section */}
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <h2 className="card-title font-cairo text-xl font-bold text-brand-primary dark:text-white">
                                        {ach.title}
                                    </h2>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-xs text-brand-accent font-bold uppercase tracking-wider">
                                            <CalendarIcon className="w-4 h-4" /> 
                                            {ach.date}
                                        </div>
                                        {ach.media.length > 0 && (
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                                {ach.media.filter(m => m.type === 'image').length > 0 && <PhotoIcon className="w-3 h-3" />}
                                                {ach.media.filter(m => m.type === 'video').length > 0 && <VideoCameraIcon className="w-3 h-3" />}
                                                {ach.media.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{ach.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                    setFiles([]);
                }} 
                title={editing ? 'Edit Achievement' : 'Add New Achievement'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="form-control">
                        <label className="label font-bold">Title</label>
                        <input 
                            name="title" 
                            defaultValue={editing?.title} 
                            className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            required 
                        />
                    </div>
                    <div className="form-control">
                        <label className="label font-bold">Date</label>
                        <input 
                            name="date" 
                            type="date" 
                            defaultValue={editing?.date} 
                            className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            required 
                        />
                    </div>
                    <div className="form-control">
                        <label className="label font-bold">Description</label>
                        <textarea 
                            name="description" 
                            defaultValue={editing?.description} 
                            className="textarea textarea-bordered h-32 bg-brand-lightBg dark:bg-[#2a2a2a]" 
                            required
                        ></textarea>
                    </div>
                    
                    {/* Media Upload */}
                    <div className="form-control">
                        <label className="label font-bold">Media (Photos & Videos)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-brand-lightBg transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="font-semibold text-brand-primary">Click or Drag photos/videos here</p>
                            <p className="text-xs text-gray-400 mt-2">Images and videos will be compressed automatically.</p>
                        </div>
                        
                        {/* Show existing media when editing */}
                        {editing && editing.media.length > 0 && files.length === 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Current Media:</p>
                                <div className="flex gap-2 flex-wrap">
                                    {editing.media.map((media, index) => (
                                        <div key={index} className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100">
                                            {media.type === 'video' ? <VideoCameraIcon className="w-3 h-3" /> : <PhotoIcon className="w-3 h-3" />}
                                            Media {index + 1}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Upload new files to replace existing media</p>
                            </div>
                        )}
                        
                        {/* Show newly selected files */}
                        {files.length > 0 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                                {files.map((f, i) => (
                                    <div key={i} className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100">
                                        {f.type.startsWith('video/') ? <VideoCameraIcon className="w-3 h-3" /> : <PhotoIcon className="w-3 h-3" />}
                                        {f.name}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="btn btn-xs btn-ghost btn-circle"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {uploading && <progress className="progress progress-primary w-full mt-2"></progress>}
                    </div>
                    
                    <div className="modal-action">
                        <button 
                            type="button" 
                            onClick={() => {
                                setModalOpen(false);
                                setEditing(null);
                                setFiles([]);
                            }} 
                            className="btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary text-white px-8">
                            {editing ? 'Update Achievement' : 'Create Achievement'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="Delete Achievement"
                message="Are you sure you want to delete this achievement? This action cannot be undone."
            />
        </div>
    );
};