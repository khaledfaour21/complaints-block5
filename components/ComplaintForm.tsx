import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Urgency } from '../types';
import { useLangStore } from '../store';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  district: z.string().min(1, "District is required"),
  category: z.string().min(1, "Category is required"),
  urgency: z.nativeEnum(Urgency),
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Please provide more details"),
  phoneNumber: z.string().regex(/^09\d{8}$/, "Must start with 09 and be 10 digits"),
  canHelp: z.boolean(),
  helpDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const ComplaintForm: React.FC = () => {
  const { t, lang } = useLangStore();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      urgency: Urgency.NORMAL,
      canHelp: false
    }
  });

  const canHelp = watch('canHelp');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Simulate API call and n8n trigger
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockTracking = `TRK-${Math.floor(Math.random() * 10000)}`;
    setSubmittedId(mockTracking);
    setIsSubmitting(false);
  };

  if (submittedId) {
    return (
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl border border-brand-primary/10 animate-fade-in">
        <div className="card-body items-center text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
          <h2 className="card-title text-2xl font-cairo font-bold text-brand-primary">{t('form.success')}</h2>
          <div className="py-4">
            <p className="text-gray-500">{t('form.tracking')}</p>
            <div className="text-4xl font-mono font-bold text-brand-accent mt-2 bg-brand-lightBg p-4 rounded-lg border border-dashed border-brand-accent">
              {submittedId}
            </div>
            <p className="text-sm mt-4 text-brand-secondary/70">
              A WhatsApp message has been sent to your number.
            </p>
          </div>
          <div className="card-actions">
            <button onClick={() => window.location.hash = '#/track'} className="btn btn-primary text-white">
              {t('track.btn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl p-6 md:p-10 border border-brand-primary/5">
      <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent mb-2 font-cairo">{t('form.title')}</h1>
      <p className="text-gray-500 mb-8">{t('hero.subtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* District & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">{t('form.district')}</span></label>
            <select {...register('district')} className="select select-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]">
              <option value="">Select District</option>
              <option value="District 1">Al-Zahra (District 1)</option>
              <option value="District 2">Al-Mogambo (District 2)</option>
              <option value="District 3">Al-Furqan (District 3)</option>
            </select>
            {errors.district && <span className="text-error text-sm mt-1">{errors.district.message}</span>}
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">{t('form.category')}</span></label>
            <select {...register('category')} className="select select-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]">
              <option value="">Select Category</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Roads">Roads</option>
              <option value="Sanitation">Sanitation</option>
            </select>
            {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
          </div>
        </div>

        {/* Urgency */}
        <div className="form-control">
           <label className="label"><span className="label-text font-bold">{t('form.urgency')}</span></label>
           <div className="flex gap-4">
              {Object.values(Urgency).map((u) => (
                <label key={u} className="cursor-pointer flex items-center gap-2 border p-3 rounded-lg hover:bg-brand-lightBg dark:hover:bg-[#2a2a2a] transition-colors">
                  <input type="radio" value={u} {...register('urgency')} className="radio radio-primary" />
                  <span className={`font-semibold ${u === Urgency.CRITICAL ? 'text-brand-alert' : ''}`}>{u}</span>
                </label>
              ))}
           </div>
        </div>

        {/* Title & Description */}
        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t('form.title_input')}</span></label>
          <input type="text" {...register('title')} className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" />
          {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t('form.desc')}</span></label>
          <textarea {...register('description')} className="textarea textarea-bordered h-32 bg-brand-lightBg dark:bg-[#2a2a2a]"></textarea>
          {errors.description && <span className="text-error text-sm mt-1">{errors.description.message}</span>}
        </div>

        {/* Phone & Help */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
                <label className="label"><span className="label-text font-bold">{t('form.phone')}</span></label>
                <input type="text" placeholder="09xxxxxxxx" {...register('phoneNumber')} className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]" />
                {errors.phoneNumber && <span className="text-error text-sm mt-1">{errors.phoneNumber.message}</span>}
            </div>
            
            <div className="form-control justify-center">
                <label className="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" {...register('canHelp')} className="checkbox checkbox-primary" />
                    <span className="label-text font-bold">{t('form.help')}</span>
                </label>
            </div>
        </div>

        {canHelp && (
            <div className="form-control animate-fade-in-down">
                <label className="label"><span className="label-text font-bold text-brand-accent">{t('form.help_desc')}</span></label>
                <textarea {...register('helpDescription')} className="textarea textarea-bordered bg-brand-lightBg dark:bg-[#2a2a2a] border-brand-accent" placeholder="I have tools/experience..."></textarea>
            </div>
        )}

        {/* File Upload (Native) */}
        <div className="form-control">
            <label className="label"><span className="label-text font-bold">Attachments (Images/Video)</span></label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                <PhotoIcon className="w-10 h-10 mx-auto text-gray-400" />
                <input type="file" multiple accept="image/*,video/*" className="file-input file-input-bordered file-input-sm w-full max-w-xs mt-4" />
                <p className="text-xs text-gray-400 mt-2">Max 5MB per file.</p>
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full text-white text-lg shadow-lg hover:shadow-xl transition-shadow">
          {isSubmitting ? <span className="loading loading-spinner"></span> : t('form.submit')}
        </button>
      </form>
    </div>
  );
};
