import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint, ComplaintStatus } from '../../types';
import { useAuthStore, useLangStore } from '../../store';
import { PlusCircleIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getComplaints(user.role as any).then(res => {
        setComplaints(res);
        setLoading(false);
      });
    }
  }, [user]);

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === ComplaintStatus.COMPLETED).length,
    pending: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.UNREAD).length,
    rejected: complaints.filter(c => c.status === ComplaintStatus.REJECTED).length,
  };

  const pieData = [
    { name: 'Resolved', value: stats.resolved, color: '#002623' },
    { name: 'Pending', value: stats.pending, color: '#988561' },
    { name: 'Rejected', value: stats.rejected, color: '#6b1f2a' },
  ];

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-2xl p-8 shadow-2xl">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold font-cairo mb-4">Welcome back, {user?.name}!</h1>
            <p className="mb-6 opacity-90">Track your complaints and submit new ones easily.</p>
            <Link to="/submit" className="btn text-white hover:opacity-90 gap-2" style={{ backgroundColor: '#428177' }}>
              <PlusCircleIcon className="w-5 h-5" /> Submit New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-xl border-l-4 border-brand-primary">
          <div className="card-body items-center text-center">
            <DocumentMagnifyingGlassIcon className="w-12 h-12 text-brand-primary mb-2" />
            <div className="stat-value text-2xl text-brand-primary">{stats.total}</div>
            <div className="stat-title">Total Complaints</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border-l-4 border-green-500">
          <div className="card-body items-center text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mb-2" />
            <div className="stat-value text-2xl text-green-500">{stats.resolved}</div>
            <div className="stat-title">Resolved</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border-l-4 border-brand-accent">
          <div className="card-body items-center text-center">
            <ClockIcon className="w-12 h-12 text-brand-accent mb-2" />
            <div className="stat-value text-2xl text-brand-accent">{stats.pending}</div>
            <div className="stat-title">Pending</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border-l-4 border-red-500">
          <div className="card-body items-center text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-2" />
            <div className="stat-value text-2xl text-red-500">{stats.rejected}</div>
            <div className="stat-title">Rejected</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Overview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title font-cairo text-brand-primary">Complaint Status Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minHeight="200px">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title font-cairo text-brand-primary">Recent Complaints</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No complaints submitted yet.
                </div>
              ) : (
                recentComplaints.map(complaint => (
                  <div key={complaint.id} className="flex items-center justify-between p-4 bg-brand-lightBg dark:bg-[#1a1a1a] rounded-lg">
                    <div>
                      <h3 className="font-bold text-brand-primary">{complaint.title}</h3>
                      <p className="text-sm text-gray-500">{complaint.category} • {complaint.createdAt}</p>
                    </div>
                    <div className={`badge ${complaint.status === ComplaintStatus.COMPLETED ? 'badge-success' : complaint.status === ComplaintStatus.IN_PROGRESS ? 'badge-warning' : complaint.status === ComplaintStatus.REJECTED ? 'badge-error' : 'badge-ghost'}`}>
                      {complaint.status}
                    </div>
                  </div>
                ))
              )}
            </div>
            {complaints.length > 5 && (
              <div className="text-center mt-4">
                <Link to="/track" className="btn btn-sm btn-outline">View All Complaints</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-brand-lightBg to-white dark:from-[#1a1a1a] dark:to-[#2a2a2a] shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title font-cairo text-brand-primary justify-center mb-4">Quick Actions</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/submit" className="btn btn-primary text-white gap-2">
              <PlusCircleIcon className="w-5 h-5" /> New Complaint
            </Link>
            <Link to="/track" className="btn btn-outline gap-2">
              <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Track Complaints
            </Link>
            <Link to="/announcements" className="btn text-white hover:opacity-90 gap-2" style={{ backgroundColor: '#428177' }}>
              <ExclamationTriangleIcon className="w-5 h-5" /> View Announcements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};