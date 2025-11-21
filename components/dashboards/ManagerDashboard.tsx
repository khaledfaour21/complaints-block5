
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { UserGroupIcon, ChartBarIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export const ManagerDashboard: React.FC = () => {
  const [muktars, setMuktars] = useState<User[]>([]);
  const [selectedMuktar, setSelectedMuktar] = useState<User | null>(null);

  useEffect(() => {
    api.getMuktars().then(setMuktars);
  }, []);

  // Mock Chart Data
  const performanceData = [
    { name: 'W1', resolved: 10, pending: 5 },
    { name: 'W2', resolved: 15, pending: 3 },
    { name: 'W3', resolved: 8, pending: 8 },
    { name: 'W4', resolved: 20, pending: 2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Top Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="stats shadow w-full md:w-auto">
                <div className="stat place-items-center">
                    <div className="stat-title">Total Muktars</div>
                    <div className="stat-value">{muktars.length}</div>
                    <div className="stat-desc">Across 3 Districts</div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">Avg Response</div>
                    <div className="stat-value text-secondary">2.5h</div>
                    <div className="stat-desc text-secondary">↗︎ 10% faster</div>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="btn btn-primary text-white gap-2"><UserPlusIcon className="w-5 h-5" /> Create Muktar</button>
                <button className="btn btn-neutral text-white gap-2"><UserPlusIcon className="w-5 h-5" /> Create Admin</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Muktars */}
            <div className="card bg-base-100 shadow-xl h-fit">
                <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                        <UserGroupIcon className="w-6 h-6 text-brand-primary" /> Muktar List
                    </h2>
                    <div className="overflow-y-auto max-h-[400px]">
                        <ul className="menu bg-base-200 w-full rounded-box">
                            {muktars.map(m => (
                                <li key={m.id} onClick={() => setSelectedMuktar(m)}>
                                    <a className={`flex justify-between ${selectedMuktar?.id === m.id ? 'active' : ''}`}>
                                        <div>
                                            <div className="font-bold">{m.name}</div>
                                            <div className="text-xs opacity-70">{m.district}</div>
                                        </div>
                                        <div className="badge badge-sm">Active</div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 space-y-6">
                {selectedMuktar ? (
                    <div className="animate-fade-in">
                         <h2 className="text-2xl font-bold mb-4 font-cairo">Performance: <span className="text-brand-accent">{selectedMuktar.name}</span></h2>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="card bg-white dark:bg-[#1e1e1e] p-4 shadow rounded-lg">
                                <h3 className="font-bold text-gray-500 mb-2">Resolution Trend</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="resolved" stroke="#002623" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="card bg-white dark:bg-[#1e1e1e] p-4 shadow rounded-lg">
                                <h3 className="font-bold text-gray-500 mb-2">Workload</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="pending" fill="#988561" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                         </div>
                         
                         <div className="alert alert-info bg-brand-lightBg border-brand-primary">
                             <ChartBarIcon className="w-6 h-6" />
                             <span>This muktar has resolved 85% of assigned complaints this month.</span>
                         </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px] bg-base-100 rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-400">Select a Muktar to view details</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
