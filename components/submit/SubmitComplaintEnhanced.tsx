
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Urgency } from '../../types';
import { useLangStore } from '../../store';
import { api } from '../../services/api';
import { PhotoIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { FormSkeleton } from '../shared/LoadingStates';

// Simulating image compression
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
        // In a real app, use 'browser-image-compression'
        setTimeout(() => resolve(file), 200); 
    });
};

const schema = z.object({
  district: z.string().min(1, "District is required"),
  category: z.string().min(1, "Category is required"),
  urgency: z.nativeEnum(Urgency),
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Please provide more details"),
  phoneNumber: z.string().regex(/^09\d{8}$/, "Phone number must start with 09 and be 10 digits"),
  canHelp: z.boolean(),
  helpDescription: z.string().optional(),
}).refine((data) => !data.canHelp || (data.canHelp && data.helpDescription && data.helpDescription.length > 0), {
    message: "Please describe how you can help",
    path: ["helpDescription"]
});

type FormData = z.infer<typeof schema>;

export const SubmitComplaintEnhanced: React.FC = () => {
  const { t } = useLangStore();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedMuktar, setAssignedMuktar] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: Urgency.NORMAL, canHelp: false }
  });

  const district = watch('district');
  const canHelp = watch('canHelp');

  // Auto-assign Muktar based on district
  useEffect(() => {
      if (district) {
          // Mock logic: fetch muktar for this district
          api.getMuktars().then(muktars => {
              const match = muktars.find(m => m.district === district);
              setAssignedMuktar(match ? match.name : 'General Office');
          });
      } else {
          setAssignedMuktar(null);
      }
  }, [district]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setUploading(true);
          const fileList = Array.from(e.target.files);
          const compressed = await Promise.all(fileList.map(compressImage));
          setFiles(prev => [...prev, ...compressed]);
          setUploading(false);
      }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
        // 1. Upload files (Mock)
        // 2. Submit data to API
        const trackId = await api.submitComplaint({ ...data, files });
        setSubmittedId(trackId);
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-2xl border-t-8 border-green-500 animate-fade-in-up">
          <div className="card-body items-center text-center p-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-cairo font-bold text-brand-primary mb-2">{t('form.success')}</h2>
            <p className="text-gray-500 mb-6">Your complaint has been registered and forwarded to <span className="font-bold text-brand-secondary">{assignedMuktar}</span>.</p>
            
            <div className="bg-brand-lightBg p-6 rounded-xl border border-dashed border-brand-primary/30 w-full max-w-md">
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">{t('form.tracking')}</p>
              <div className="text-5xl font-mono font-bold text-brand-primary">{submittedId}</div>
            </div>
            
            <div className="mt-8 flex gap-4 flex-wrap justify-center">
                <button onClick={() => window.location.reload()} className="btn btn-ghost">Submit Another</button>
                <button onClick={() => window.location.hash = '#/track'} className="btn btn-primary text-white px-8">
                  {t('track.btn')}
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl p-6 md:p-12 border border-brand-primary/5 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-gray-100 dark:border-gray-700">
         <div className="p-3 bg-brand-primary text-brand-accent rounded-xl">
             <PaperAirplaneIcon className="w-8 h-8" />
         </div>
         <div>
             <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent font-cairo">{t('form.title')}</h1>
             <p className="text-gray-500 text-sm">We usually respond within 24 hours.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-lg">{t('form.district')}</span></label>
            <select {...register('district')} className="select select-bordered select-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]">
              <option value="">Select District</option>
              <option value="District 1">Al-Zahra (District 1)</option>
              <option value="District 2">Al-Mogambo (District 2)</option>
              <option value="District 3">Al-Furqan (District 3)</option>
            </select>
            {assignedMuktar && <div className="text-xs mt-2 text-brand-primary flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Routing to: {assignedMuktar}</div>}
            {errors.district && <span className="text-error text-sm mt-1">{errors.district.message}</span>}
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-lg">{t('form.category')}</span></label>
            <select {...register('category')} className="select select-bordered select-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]">
              <option value="">Select Category</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Roads">Roads</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
          </div>
        </div>

        <div className="form-control">
           <label className="label"><span className="label-text font-bold text-lg">{t('form.urgency')}</span></label>
           <div className="flex gap-4 flex-wrap">
              {Object.values(Urgency).map((u) => (
                <label key={u} className={`flex-1 cursor-pointer flex items-center justify-center gap-2 border p-4 rounded-xl transition-all ${u === Urgency.CRITICAL ? 'hover:bg-red-50 border-red-200' : 'hover:bg-brand-lightBg'}`}>
                  <input type="radio" value={u} {...register('urgency')} className={`radio ${u === Urgency.CRITICAL ? 'radio-error' : 'radio-primary'}`} />
                  <span className={`font-bold ${u === Urgency.CRITICAL ? 'text-red-600' : ''}`}>{u}</span>
                </label>
              ))}
           </div>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold text-lg">{t('form.title_input')}</span></label>
          <input type="text" {...register('title')} className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]" placeholder="Brief summary of the issue" />
          {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold text-lg">{t('form.desc')}</span></label>
          <textarea {...register('description')} className="textarea textarea-bordered h-40 text-base bg-brand-lightBg dark:bg-[#2a2a2a]" placeholder="Please describe the issue in detail..."></textarea>
          {errors.description && <span className="text-error text-sm mt-1">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="form-control">
                <label className="label"><span className="label-text font-bold text-lg">{t('form.phone')}</span></label>
                <input type="tel" placeholder="09xxxxxxxx" {...register('phoneNumber')} className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]" />
                <label className="label"><span className="label-text-alt text-gray-400">For verification purposes only</span></label>
                {errors.phoneNumber && <span className="text-error text-sm mt-1">{errors.phoneNumber.message}</span>}
            </div>
            
            <div className="form-control p-6 bg-brand-accent/5 rounded-xl border border-brand-accent/10">
                <label className="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" {...register('canHelp')} className="checkbox checkbox-primary" />
                    <span className="label-text font-bold text-lg">{t('form.help')}</span>
                </label>
                {canHelp && (
                    <div className="mt-4 animate-fade-in-down">
                        <textarea {...register('helpDescription')} className="textarea textarea-bordered w-full bg-white dark:bg-[#1e1e1e]" placeholder={t('form.help_desc')}></textarea>
                        {errors.helpDescription && <span className="text-error text-sm mt-1">{errors.helpDescription.message}</span>}
                    </div>
                )}
            </div>
        </div>

        <div className="form-control">
            <label className="label"><span className="label-text font-bold text-lg">Attachments</span></label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-brand-lightBg transition-colors cursor-pointer relative">
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="font-semibold text-brand-primary">Click or Drag photos here</p>
                <p className="text-xs text-gray-400 mt-2">Images will be compressed automatically.</p>
            </div>
            {files.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {files.map((f, i) => (
                        <div key={i} className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100">
                            {f.name}
                            <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="btn btn-xs btn-ghost btn-circle">x</button>
                        </div>
                    ))}
                </div>
            )}
            {uploading && <progress className="progress progress-primary w-full mt-2"></progress>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full text-white shadow-xl hover:shadow-2xl transition-all text-xl font-cairo">
          {isSubmitting ? <span className="loading loading-dots"></span> : t('form.submit')}
        </button>
      </form>
    </div>
  );
};
