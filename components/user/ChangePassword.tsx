import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLangStore, useToastStore } from '../../store';
import { KeyIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  oldPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(6, "Min 6 chars"),
  confirmPassword: z.string().min(6, "Min 6 chars"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const ChangePassword: React.FC = () => {
  const { t } = useLangStore();
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    // Mock API call
    setTimeout(() => {
        addToast('Password changed successfully', 'success');
        reset();
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent flex items-center gap-2">
        <KeyIcon className="w-8 h-8" /> {t('user.change_pass')}
      </h1>

      <div className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="form-control">
                <label className="label font-bold">{t('user.old_pass')}</label>
                <input type="password" {...register('oldPassword')} className="input input-bordered" />
                {errors.oldPassword && <span className="text-error text-sm">{errors.oldPassword.message as string}</span>}
             </div>
             <div className="form-control">
                <label className="label font-bold">{t('user.new_pass')}</label>
                <input type="password" {...register('newPassword')} className="input input-bordered" />
                {errors.newPassword && <span className="text-error text-sm">{errors.newPassword.message as string}</span>}
             </div>
             <div className="form-control">
                <label className="label font-bold">{t('user.confirm_pass')}</label>
                <input type="password" {...register('confirmPassword')} className="input input-bordered" />
                {errors.confirmPassword && <span className="text-error text-sm">{errors.confirmPassword.message as string}</span>}
             </div>
             <div className="form-control mt-6">
                <button className="btn btn-primary text-white">{t('common.save')}</button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};