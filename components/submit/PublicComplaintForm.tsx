import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLangStore } from '../../store';
import { api } from '../../services/api';
import { PhotoIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ComplaintStatus, Importance } from '../../types';

// Simulating image compression
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
        // In a real app, use 'browser-image-compression'
        setTimeout(() => resolve(file), 200); 
    });
};

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().regex(/^09\d{8}$/, "Phone number must start with 09 and be 10 digits"),
  location: z.string().min(3, "Location is required"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
});

type FormData = z.infer<typeof schema>;

export const PublicComplaintForm: React.FC = () => {
  const { t } = useLangStore();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

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
        // Create complaint with automatic assignments as per Part 6 requirements
        const complaintData = {
          ...data,
          // Automatic assignments for normal user complaints
          status: ComplaintStatus.PENDING, // Status = Pending
          importance: Importance.LOW, // Importance = Low by default
          assignedRole: 'Mukhtar', // Assigned Role = Mukhtar by default
          attachments: [] // Will be populated with file URLs after upload
        };

        // Submit complaint to API
        const trackId = await api.submitComplaint({ 
          ...complaintData, 
          files 
        });
        
        setSubmittedId(trackId);
    } catch (error) {
        console.error('Error submitting complaint:', error);
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
            <h2 className="text-3xl font-cairo font-bold text-brand-primary mb-2">Complaint Submitted Successfully</h2>
            <p className="text-gray-500 mb-6">
              Your complaint has been registered and forwarded to our team. 
              We will assign it to the appropriate Mukhtar for handling.
            </p>
            
            <div className="bg-brand-lightBg p-6 rounded-xl border border-dashed border-brand-primary/30 w-full max-w-md">
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Tracking Number</p>
              <div className="text-5xl font-mono font-bold text-brand-primary">{submittedId}</div>
            </div>

            <div className="mt-8 flex gap-4 flex-wrap justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-ghost"
                >
                  Submit Another Complaint
                </button>
                <button 
                  onClick={() => window.location.hash = '#/track'} 
                  className="btn btn-primary text-white px-8"
                >
                  Track Your Complaint
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl p-6 md:p-12 border border-brand-primary/5 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-gray-100 dark:border-gray-700">
         <div className="p-3 bg-brand-primary text-brand-accent rounded-xl">
             <PaperAirplaneIcon className="w-8 h-8" />
         </div>
         <div>
             <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent font-cairo">
               Submit a Complaint
             </h1>
             <p className="text-gray-500 text-sm">
               No login required. We will respond within 24 hours.
             </p>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Full Name Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Full Name *</span>
          </label>
          <input 
            type="text" 
            {...register('fullName')} 
            className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
            placeholder="Enter your full name"
          />
          {errors.fullName && <span className="text-error text-sm mt-1">{errors.fullName.message}</span>}
        </div>

        {/* Phone Number Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Phone Number *</span>
          </label>
          <input 
            type="tel" 
            placeholder="09xxxxxxxx" 
            {...register('phoneNumber')} 
            className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
          />
          <label className="label">
            <span className="label-text-alt text-gray-400">
              For verification and follow-up purposes only
            </span>
          </label>
          {errors.phoneNumber && <span className="text-error text-sm mt-1">{errors.phoneNumber.message}</span>}
        </div>

        {/* Location Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Location *</span>
          </label>
          <input 
            type="text" 
            {...register('location')} 
            className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]" 
            placeholder="Street name, building number, or landmark"
          />
          {errors.location && <span className="text-error text-sm mt-1">{errors.location.message}</span>}
        </div>

        {/* Description Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Description *</span>
          </label>
          <textarea 
            {...register('description')} 
            className="textarea textarea-bordered h-40 text-base bg-brand-lightBg dark:bg-[#2a2a2a]" 
            placeholder="Please describe the issue in detail..."
          ></textarea>
          {errors.description && <span className="text-error text-sm mt-1">{errors.description.message}</span>}
        </div>

        {/* Optional Image Upload */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Upload Image (Optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-brand-lightBg transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="font-semibold text-brand-primary">Click or Drag photos here</p>
              <p className="text-xs text-gray-400 mt-2">Images will be compressed automatically.</p>
          </div>
          {files.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                  {files.map((f, i) => (
                      <div key={i} className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100">
                          {f.name}
                          <button 
                            type="button" 
                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))} 
                            className="btn btn-xs btn-ghost btn-circle"
                          >
                            x
                          </button>
                      </div>
                  ))}
              </div>
          )}
          {uploading && <progress className="progress progress-primary w-full mt-2"></progress>}
        </div>

        {/* Information Note */}
        <div className="bg-brand-accent/5 rounded-xl p-4 border border-brand-accent/10">
          <h3 className="font-bold text-brand-primary mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your complaint status will be set to <strong>Pending</strong></li>
            <li>• It will be assigned <strong>Low Importance</strong> by default</li>
            <li>• A Mukhtar will be assigned to handle your complaint</li>
            <li>• You can track your complaint using the tracking number</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn btn-primary btn-lg w-full text-white shadow-xl hover:shadow-2xl transition-all text-xl font-cairo"
        >
          {isSubmitting ? (
            <span className="loading loading-dots"></span>
          ) : (
            'Submit Complaint'
          )}
        </button>
      </form>
    </div>
  );
};