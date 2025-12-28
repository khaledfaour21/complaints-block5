import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLangStore } from "../../store";
import { api } from "../../services/api";
import {
  PhotoIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Simulating image compression
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // In a real app, use 'browser-image-compression'
    setTimeout(() => resolve(file), 200);
  });
};

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  district: z.string().min(1, "District is required"),
  location: z.string().min(3, "Location is required"),
  submitterName: z.string().min(2, "Full name is required"),
  submitterEmail: z.string().email("Valid email is required"),
  submitterPhone: z
    .string()
    .regex(/^09\d{8}$/, "Phone number must start with 09 and be 10 digits"),
  estimatedBudget: z.string().optional(),
  expectedImpact: z.string().optional(),
  timeline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const PublicInitiativeForm: React.FC = () => {
  const { t } = useLangStore();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const fileList = Array.from(e.target.files);
      const compressed = await Promise.all(fileList.map(compressImage));
      setFiles((prev) => [...prev, ...compressed]);
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setRateLimitError(null);
    try {
      const initiativeId = await api.submitInitiative({
        ...data,
        files,
      });
      setSubmittedId(initiativeId);
    } catch (error: any) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        setRateLimitError(
          "You've submitted too many initiatives recently. Please wait before submitting another one."
        );
      } else {
        console.error("Error submitting initiative:", error);
        setRateLimitError("Failed to submit initiative. Please try again.");
      }
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
            <h2 className="text-3xl font-cairo font-bold text-brand-primary mb-2">
              Initiative Submitted Successfully
            </h2>
            <p className="text-gray-500 mb-6">
              Your initiative has been submitted and will be reviewed by our
              team. We will notify you once it's approved or if we need more
              information.
            </p>

            <div className="bg-brand-lightBg p-6 rounded-xl border border-dashed border-brand-primary/30 w-full max-w-md">
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                Initiative ID
              </p>
              <div className="text-3xl font-mono font-bold text-brand-primary">
                {submittedId}
              </div>
            </div>

            <div className="mt-8 flex gap-4 flex-wrap justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-ghost"
              >
                Submit Another Initiative
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
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent font-cairo">
            Submit an Initiative
          </h1>
          <p className="text-gray-500 text-sm">
            Propose community improvement projects and initiatives.
          </p>
        </div>
      </div>

      {rateLimitError && (
        <div className="alert alert-error mb-6">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <span>{rateLimitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Title *</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="Brief title for your initiative"
            />
            {errors.title && (
              <span className="text-error text-sm mt-1">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Category *</span>
            </label>
            <select
              {...register("category")}
              className="select select-bordered select-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
            >
              <option value="">Select Category</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="culture">Culture & Arts</option>
              <option value="sports">Sports & Recreation</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <span className="text-error text-sm mt-1">
                {errors.category.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">Description *</span>
          </label>
          <textarea
            {...register("description")}
            className="textarea textarea-bordered h-32 text-base bg-brand-lightBg dark:bg-[#2a2a2a]"
            placeholder="Describe your initiative in detail..."
          ></textarea>
          {errors.description && (
            <span className="text-error text-sm mt-1">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">District *</span>
            </label>
            <select
              {...register("district")}
              className="select select-bordered select-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
            >
              <option value="">Select District</option>
              <option value="Al Olaya">Al Olaya</option>
              <option value="Al Malaz">Al Malaz</option>
              <option value="Al Rawdah">Al Rawdah</option>
              <option value="Al Sulimaniyah">Al Sulimaniyah</option>
              <option value="Al Faisaliyah">Al Faisaliyah</option>
            </select>
            {errors.district && (
              <span className="text-error text-sm mt-1">
                {errors.district.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Location *</span>
            </label>
            <input
              type="text"
              {...register("location")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="Specific location or area"
            />
            {errors.location && (
              <span className="text-error text-sm mt-1">
                {errors.location.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Full Name *</span>
            </label>
            <input
              type="text"
              {...register("submitterName")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="Your full name"
            />
            {errors.submitterName && (
              <span className="text-error text-sm mt-1">
                {errors.submitterName.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Email *</span>
            </label>
            <input
              type="email"
              {...register("submitterEmail")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="your.email@example.com"
            />
            {errors.submitterEmail && (
              <span className="text-error text-sm mt-1">
                {errors.submitterEmail.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Phone *</span>
            </label>
            <input
              type="tel"
              placeholder="09xxxxxxxx"
              {...register("submitterPhone")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
            />
            {errors.submitterPhone && (
              <span className="text-error text-sm mt-1">
                {errors.submitterPhone.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">
                Estimated Budget
              </span>
            </label>
            <input
              type="text"
              {...register("estimatedBudget")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="Optional: e.g., $50,000"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">
                Expected Impact
              </span>
            </label>
            <input
              type="text"
              {...register("expectedImpact")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="e.g., Benefits 500 residents"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-lg">Timeline</span>
            </label>
            <input
              type="text"
              {...register("timeline")}
              className="input input-bordered input-lg w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="e.g., 6-12 months"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold text-lg">
              Attachments (Optional)
            </span>
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-brand-lightBg transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-brand-primary">
              Click or Drag photos/videos here
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Images and videos will be compressed automatically.
            </p>
          </div>
          {files.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto py-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100"
                >
                  {f.name}
                  <button
                    type="button"
                    onClick={() =>
                      setFiles(files.filter((_, idx) => idx !== i))
                    }
                    className="btn btn-xs btn-ghost btn-circle"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
          {uploading && (
            <progress className="progress progress-primary w-full mt-2"></progress>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-lg w-full text-white shadow-xl hover:shadow-2xl transition-all text-xl font-cairo"
        >
          {isSubmitting ? (
            <span className="loading loading-dots"></span>
          ) : (
            "Submit Initiative"
          )}
        </button>
      </form>
    </div>
  );
};
