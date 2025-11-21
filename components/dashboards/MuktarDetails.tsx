
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { User, MuktarStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeftIcon, UserCircleIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CardSkeleton } from '../shared/LoadingStates';

export const MuktarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [muktar, setMuktar] = useState<User | null>(null);
  const [stats, setStats] = useState<MuktarStats | null>(null);

  useEffect(() => {
    if (id) {
        api.getMuktarById(id).then(setMuktar);
        api.getMuktarStats(id).then(setStats);
    }
  }, [id]);

  if (!muktar || !stats) return <div className="p-8"><CardSkeleton /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary">
            <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
        </button>

        {/* Header Profile */}
        <div className="card lg:card-side bg-base-100 shadow-xl border border-brand-primary/10">
            <div className="p-8 flex items-center justify-center bg-brand-lightBg dark:bg-base-300 lg:w-1/4">
                <div className="text-center">
                    <div className="avatar placeholder mb-4">
                        <div className="bg-brand-primary text-brand-accent rounded-full w-24 text-3xl font-bold flex items-center justify-center">
                            {muktar.name.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">{muktar.name}</h2>
                    <div className="badge badge-primary badge-outline mt-2">Muktar</div>
                </div>
            </div>
            <div className="card-body lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-base-200 rounded-lg"><EnvelopeIcon className="w-6 h-6"/></div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Email</div>
                            <div className="font-semibold">{muktar.email}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-base-200 rounded-lg"><MapPinIcon className="w-6 h-6"/></div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">District</div>
                            <div className="font-semibold">{muktar.district}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-base-200 rounded-lg"><UserCircleIcon className="w-6 h-6"/></div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Joined</div>
                            <div className="font-semibold">{muktar.joinedAt}</div>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="stats shadow w-full bg-base-200">
                    <div className="stat place-items-center">
                        <div className="stat-title">Performance Score</div>
                        <div className="stat-value text-brand-primary">{stats.performance}%</div>
                        <div className="stat-desc">Based on resolution time</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">Total Complaints</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">Avg Time</div>
                        <div className="stat-value text-secondary">{stats.avgResolutionTime}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card bg-base-100 shadow-xl p-6">
                <h3 className="font-bold text-lg mb-6">Monthly Activity</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.complaintsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#002623" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <h3 className="font-bold text-lg mb-6">Resolution Ratio</h3>
                <div className="flex items-center justify-center h-80 relative">
                    <div className="radial-progress text-brand-accent" style={{ "--value": (stats.resolved / stats.total) * 100, "--size": "12rem", "--thickness": "1rem" } as any}>
                        <span className="text-brand-primary font-bold text-xl">{Math.round((stats.resolved / stats.total) * 100)}%</span>
                    </div>
                    <div className="absolute bottom-4 text-center text-sm text-gray-500">
                        {stats.resolved} Resolved / {stats.total} Total
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
