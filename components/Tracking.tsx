
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLangStore } from '../store';
import { api } from '../services/api';
import { Complaint, ComplaintStatus } from '../types';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const Tracking: React.FC = () => {
  const { t } = useLangStore();
  const { register, handleSubmit } = useForm();
  const [result, setResult] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onTrack = async (data: any) => {
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const complaint = await api.getComplaintByTracking(data.trackingNumber);
      if (complaint) {
        setResult(complaint);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Status Steps Helper
  const getStepClass = (step: number, currentStatus: ComplaintStatus) => {
    const statusOrder = [ComplaintStatus.UNREAD, ComplaintStatus.IN_PROGRESS, ComplaintStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentStatus === ComplaintStatus.REJECTED) return 'step-error';
    if (currentIndex >= step) return 'step-primary';
    return '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Search Box */}
      <div className="card bg-base-100 shadow-xl border border-brand-primary/10">
        <div className="card-body">
          <h2 className="card-title text-2xl font-cairo mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-6 h-6 text-brand-primary" />
            {t('track.title')}
          </h2>
          <form onSubmit={handleSubmit(onTrack)} className="join w-full">
            <input 
              {...register('trackingNumber')}
              className="input input-bordered join-item w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
              placeholder={t('track.placeholder')}
              required 
            />
            <button className="btn join-item btn-primary text-white" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : t('track.btn')}
            </button>
          </form>
          {error && <p className="text-error mt-2 text-sm">{t('track.notFound')}</p>}
        </div>
      </div>

      {/* Result View */}
      {result && (
        <div className="card bg-base-100 shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`h-2 w-full ${
                result.status === ComplaintStatus.COMPLETED ? 'bg-green-500' : 
                result.status === ComplaintStatus.REJECTED ? 'bg-red-500' : 'bg-brand-accent'
            }`}></div>
            
            <div className="card-body">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                    <div>
                        <div className="badge badge-outline mb-2">{result.category}</div>
                        <h3 className="text-2xl font-bold">{result.title}</h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1 gap-4">
                            <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4"/> {result.district}</span>
                            <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {result.createdAt}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Tracking #</div>
                        <div className="font-mono text-xl font-bold text-brand-primary">{result.trackingNumber}</div>
                    </div>
                </div>

                {/* Timeline */}
                <ul className="steps steps-vertical lg:steps-horizontal w-full my-6">
                    <li className={`step ${getStepClass(0, result.status)}`}>{t('status.unread')}</li>
                    <li className={`step ${getStepClass(1, result.status)}`}>{t('status.inprogress')}</li>
                    <li className={`step ${getStepClass(2, result.status)}`}>{t('status.completed')}</li>
                </ul>

                {result.status === ComplaintStatus.REJECTED && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>This complaint was rejected. Contact support for details.</span>
                    </div>
                )}

                <div className="divider"></div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-brand-lightBg dark:bg-[#2a2a2a] p-4 rounded-lg">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-5 h-5" /> Description
                        </h4>
                        <p className="text-sm">{result.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                        {result.expectedCompletion && (
                            <div className="alert bg-brand-primary/10 border-brand-primary/20 p-3">
                                <div className="text-xs font-bold uppercase text-brand-primary opacity-70">{t('track.expected')}</div>
                                <div className="font-bold">{result.expectedCompletion}</div>
                            </div>
                        )}
                        {result.muktarNotes && (
                            <div className="alert bg-brand-accent/10 border-brand-accent/20 p-3">
                                <div className="text-xs font-bold uppercase text-brand-accent opacity-70">{t('track.notes')}</div>
                                <div className="italic">"{result.muktarNotes}"</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attachments */}
                {result.attachments.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-bold mb-3">Attachments</h4>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {result.attachments.map((url, idx) => (
                                <img key={idx} src={url} alt="Attachment" className="h-24 w-24 object-cover rounded-lg border hover:scale-105 transition-transform cursor-pointer" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
