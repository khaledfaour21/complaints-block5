
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLangStore } from '../store';
import { Role } from '../types';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
  const { t } = useLangStore();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    
    // SIMULATED AUTH call
    // In production: fetch('/api/auth/login', { method: 'POST', body: ... }) 
    // Handle CSRF token fetching before this request
    
    setTimeout(() => {
      setLoading(false);
      
      // Mock Logic for demo roles
      let role = Role.CITIZEN;
      let name = 'User';
      if (data.email.includes('admin')) { role = Role.ADMIN; name = 'Admin User'; }
      else if (data.email.includes('manager')) { role = Role.MANAGER; name = 'General Manager'; }
      else if (data.email.includes('muktar')) { role = Role.MUKTAR; name = 'Muktar Ahmed'; }
      else {
        setError('Invalid mock credentials. Try admin@..., manager@..., or muktar@...');
        return;
      }

      login({
        id: '123',
        name,
        email: data.email,
        role,
        district: role === Role.MUKTAR ? 'District 1' : undefined
      });
      
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-white dark:bg-[#1e1e1e] shadow-2xl border border-brand-primary/5 animate-fade-in-up">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent text-2xl font-bold">
              <LockClosedIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-cairo text-brand-primary dark:text-brand-accent">{t('login.title')}</h2>
            <p className="text-sm text-gray-500">Secure Access for Authorized Personnel</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('login.email')}</span>
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input 
                  type="email" 
                  {...register('email')} 
                  className="input input-bordered w-full pl-10 rtl:pr-10 rtl:pl-4 bg-brand-lightBg dark:bg-[#2a2a2a]" 
                  placeholder="staff@fifthblock.sy"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('login.pass')}</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input 
                  type="password" 
                  {...register('password')} 
                  className="input input-bordered w-full pl-10 rtl:pr-10 rtl:pl-4 bg-brand-lightBg dark:bg-[#2a2a2a]" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <div className="alert alert-error text-sm py-2">{error}</div>}

            <div className="form-control mt-6">
              <button disabled={loading} className="btn btn-primary text-white text-lg">
                {loading ? <span className="loading loading-dots"></span> : t('login.btn')}
              </button>
            </div>
          </form>
          
          <div className="divider">DEMO HINT</div>
          <div className="text-xs text-center text-gray-400 space-y-1">
            <p>Manager: manager@test.com</p>
            <p>Admin: admin@test.com</p>
            <p>Muktar: muktar@test.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
