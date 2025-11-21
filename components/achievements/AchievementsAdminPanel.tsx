import React, { useEffect, useState } from 'react';
import { useLangStore, useToastStore } from '../../store';
import { api } from '../../services/api';
import { Achievement } from '../../types';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from '../shared/LoadingStates';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { Modal } from '../shared/Modal';

export const AchievementsAdminPanel: React.FC = () => {
  const { t } = useLangStore();
  const { addToast } = useToastStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = () => {
      setLoading(true);
      api.getAchievements().then(data => {
          setAchievements(data);
          setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const form = e.target as HTMLFormElement;
        const data: Achievement = {
            id: editing ? editing.id : Date.now().toString(),
            title: (form.elements.namedItem('title') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
            date: (form.elements.namedItem('date') as HTMLInputElement).value,
            images: editing ? editing.images : ['https://picsum.photos/400/250?random=' + Date.now()]
        };
        await api.saveAchievement(data);
        addToast(editing ? 'Achievement updated successfully' : 'Achievement created successfully', 'success');
        setModalOpen(false);
        setEditing(null);
        loadData();
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
            loadData();
          } catch (error) {
            addToast('Failed to delete achievement', 'error');
          }
      }
  };

  const openEdit = (item: Achievement) => {
      setEditing(item);
      setModalOpen(true);
  };

  const openNew = () => {
      setEditing(null);
      setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-cairo text-brand-primary dark:text-brand-accent">{t('achieve.manage')}</h2>
            <button onClick={openNew} className="btn btn-primary text-white gap-2 shadow-lg">
                <PlusIcon className="w-5 h-5" /> {t('achieve.add')}
            </button>
        </div>

        {loading ? <TableSkeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map(ach => (
                    <div key={ach.id} className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700 group hover:shadow-2xl transition-all">
                        <figure className="h-48 w-full bg-gray-100 relative overflow-hidden">
                            {ach.images[0] && <img src={ach.images[0]} alt="Achievement" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </figure>
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <h3 className="card-title font-cairo text-lg">{ach.title}</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{ach.date}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{ach.description}</p>
                            <div className="card-actions justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button onClick={() => openEdit(ach)} className="btn btn-sm btn-ghost gap-1 hover:bg-brand-lightBg"><PencilIcon className="w-4 h-4"/> Edit</button>
                                <button onClick={() => setDeleteId(ach.id)} className="btn btn-sm btn-ghost text-error gap-1 hover:bg-red-50"><TrashIcon className="w-4 h-4"/> Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            title={editing ? t('common.edit') : t('achieve.add')}
        >
            <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                    <label className="label font-bold">Title</label>
                    <input name="title" defaultValue={editing?.title} className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" required />
                </div>
                <div className="form-control">
                    <label className="label font-bold">Date</label>
                    <input name="date" type="date" defaultValue={editing?.date} className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" required />
                </div>
                <div className="form-control">
                    <label className="label font-bold">Description</label>
                    <textarea name="description" defaultValue={editing?.description} className="textarea textarea-bordered h-32 bg-brand-lightBg dark:bg-[#2a2a2a]" required></textarea>
                </div>
                <div className="modal-action">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn">{t('common.cancel')}</button>
                    <button type="submit" className="btn btn-primary text-white px-8">{t('common.save')}</button>
                </div>
            </form>
        </Modal>

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