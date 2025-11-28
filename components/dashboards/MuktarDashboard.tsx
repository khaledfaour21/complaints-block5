import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  flexRender, createColumnHelper
} from '@tanstack/react-table';
import { Complaint, ComplaintStatus, Importance, User, Role } from '../../types';
import { api } from '../../services/api';
import { useLangStore, useAuthStore, useToastStore } from '../../store';
import { EyeIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon, FunnelIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DashboardAccessControl } from '../shared/AccessControl';
import { StandardizedDashboardLayout } from '../shared/StandardizedDashboardLayout';
import { ComplaintsCharts } from '../charts/ComplaintsCharts';
import { useComplaintsData } from '../../context/ComplaintsDataContext';

export const MuktarDashboard: React.FC = () => {
  const { t } = useLangStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { complaints, loading: complaintsLoading } = useComplaintsData();
  const [activeTab, setActiveTab] = useState<ComplaintStatus>(ComplaintStatus.PENDING);
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [muktars, setMuktars] = useState<User[]>([]);
  const [selectedMuktar, setSelectedMuktar] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Use data from context
      setData(complaints);
      setLoading(complaintsLoading);

      // Load muktars if user is MANAGER
      if (user?.role === Role.MANAGER) {
        const muktarsData = await api.getMuktars();
        setMuktars(muktarsData);
        // Set first mukhtar as selected by default
        if (muktarsData.length > 0 && !selectedMuktar) {
          setSelectedMuktar(muktarsData[0]);
        }
      }
    };

    loadData();
  }, [complaints, complaintsLoading, user]);

  const filteredData = useMemo(() => {
    let filtered = complaints;

    // Filter by selected mukhtar or user role
    if (user?.role === Role.MANAGER && selectedMuktar) {
      filtered = filtered.filter(item => item.assignedMuktarId === selectedMuktar.id);
    } else if (user?.role === Role.MUKTAR) {
      filtered = filtered.filter(item => item.assignedMuktarId === user.id);
    }
    // For ADMIN, show all complaints assigned to muktars (no additional filter)

    // Then filter by active tab
    if (activeTab === ComplaintStatus.IN_PROGRESS) return filtered.filter(d => d.status === ComplaintStatus.IN_PROGRESS);
    if (activeTab === ComplaintStatus.COMPLETED) return filtered.filter(d => d.status === ComplaintStatus.COMPLETED);
    return filtered.filter(d => d.status === ComplaintStatus.PENDING);
  }, [complaints, activeTab, user, selectedMuktar]);

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    try {
        await api.updateComplaintStatus(id, status);
        // Optimistic update
        setData(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        
        if (status === ComplaintStatus.IN_PROGRESS) addToast('Complaint Accepted', 'success');
        else if (status === ComplaintStatus.CLOSED) addToast('Complaint Rejected', 'warning');
        else if (status === ComplaintStatus.COMPLETED) addToast('Complaint Completed', 'success');
        
    } catch (e) {
        addToast('Failed to update status', 'error');
    }
  };

  // Table Config
  const columnHelper = createColumnHelper<Complaint>();
  const columns = useMemo(() => [
    columnHelper.accessor('trackingNumber', { header: 'ID', cell: info => <span className="font-mono text-xs font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('district', { header: 'District' }),
    columnHelper.accessor('location', { header: 'Location', cell: info => <span className="text-sm text-gray-600">{info.getValue()}</span> }),
    columnHelper.accessor('category', { header: 'Category' }),
    columnHelper.accessor('importance', {
        header: 'Importance',
        cell: info => (
            <select
                className="select select-bordered select-xs w-full"
                value={info.getValue()}
                onChange={(e) => {
                    const newImportance = e.target.value as Importance;
                    api.updateComplaintImportance(info.row.original.id, newImportance);
                    setData(prev => prev.map(p => p.id === info.row.original.id ? { ...p, importance: newImportance } : p));
                }}
            >
                {Object.values(Importance).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
        )
    }),
    columnHelper.accessor('title', { header: 'Title', cell: info => <span className="font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('description', { header: 'Description', cell: info => <span className="text-sm text-gray-600 truncate max-w-xs block">{info.getValue()}</span> }),
    columnHelper.accessor('phoneNumber', { header: 'Phone', cell: info => <span className="font-mono text-sm">{info.getValue()}</span> }),
    columnHelper.accessor('citizenHelp', { header: 'Citizen Help', cell: info => <span className="text-sm">{info.getValue() || 'N/A'}</span> }),
    columnHelper.accessor('attachments', {
        header: 'Attachments',
        cell: info => (
            info.getValue().length > 0 ? (
                <button
                    onClick={() => setSelectedAttachments(info.getValue())}
                    className="btn btn-xs btn-ghost gap-1"
                    title="View Attachments"
                >
                    <PhotoIcon className="w-3 h-3" />
                    {info.getValue().length}
                </button>
            ) : (
                <span className="text-gray-400">None</span>
            )
        )
    }),
    columnHelper.accessor('createdAt', { header: 'Date' }),
    columnHelper.accessor('pinned', {
        header: 'Pinned',
        cell: info => (
            <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={info.getValue() || false}
                onChange={(e) => {
                    api.updateComplaintPinned(info.row.original.id, e.target.checked);
                    setData(prev => prev.map(p => p.id === info.row.original.id ? { ...p, pinned: e.target.checked } : p));
                }}
            />
        )
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
            <div className="flex gap-2">
                {activeTab === ComplaintStatus.PENDING && (
                    <>
                        <button onClick={() => handleStatusChange(info.row.original.id, ComplaintStatus.IN_PROGRESS)} className="btn btn-xs btn-success text-white" title="Accept">
                            <CheckIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleStatusChange(info.row.original.id, ComplaintStatus.CLOSED)} className="btn btn-xs btn-error text-white" title="Reject">
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </>
                )}
                {activeTab === ComplaintStatus.IN_PROGRESS && (
                    <button onClick={() => handleStatusChange(info.row.original.id, ComplaintStatus.COMPLETED)} className="btn btn-xs btn-primary text-white">
                        Mark Complete
                    </button>
                )}
                <button className="btn btn-xs btn-ghost border border-gray-300 dark:border-gray-600"><EyeIcon className="w-3 h-3" /></button>
            </div>
        )
    })
  ], [activeTab]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const stats = useMemo(() => {
    const relevantComplaints = user?.role === Role.MANAGER && selectedMuktar
      ? complaints.filter(c => c.assignedMuktarId === selectedMuktar.id)
      : user?.role === Role.MUKTAR
      ? complaints.filter(c => c.assignedMuktarId === user.id)
      : complaints; // For ADMIN, show all

    const completed = relevantComplaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
    return {
      total: relevantComplaints.length,
      pending: relevantComplaints.filter(c => c.status === ComplaintStatus.PENDING).length,
      underReview: relevantComplaints.filter(c => c.status === ComplaintStatus.UNDER_REVIEW).length,
      inProgress: relevantComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
      completed,
      closed: relevantComplaints.filter(c => c.status === ComplaintStatus.CLOSED).length,
      resolutionRate: relevantComplaints.length > 0 ? Math.round((completed / relevantComplaints.length) * 100) : 0,
    };
  }, [complaints, user, selectedMuktar]);

  const weeklyData = useMemo(() => {
    const days = [
      { name: 'Mon', nameAr: 'الاثنين', handled: Math.floor(Math.random() * 15) + 5 },
      { name: 'Tue', nameAr: 'الثلاثاء', handled: Math.floor(Math.random() * 15) + 5 },
      { name: 'Wed', nameAr: 'الأربعاء', handled: Math.floor(Math.random() * 15) + 5 },
      { name: 'Thu', nameAr: 'الخميس', handled: Math.floor(Math.random() * 15) + 5 },
      { name: 'Fri', nameAr: 'الجمعة', handled: Math.floor(Math.random() * 15) + 5 },
      { name: 'Sat', nameAr: 'السبت', handled: Math.floor(Math.random() * 10) + 2 },
      { name: 'Sun', nameAr: 'الأحد', handled: Math.floor(Math.random() * 10) + 2 },
    ];
    return days;
  }, []);

  // Prepare stats for StandardizedDashboardLayout
  const dashboardStats = useMemo(() => {
    const relevantComplaints = user?.role === Role.MANAGER && selectedMuktar
      ? complaints.filter(c => c.assignedMuktarId === selectedMuktar.id)
      : user?.role === Role.MUKTAR
      ? complaints.filter(c => c.assignedMuktarId === user.id)
      : complaints; // For ADMIN, show all

    return {
      total: stats.total,
      pending: stats.pending,
      inProgress: stats.inProgress,
      completed: stats.completed,
      highImportance: relevantComplaints.filter(c => c.importance === Importance.HIGH).length,
      mediumImportance: relevantComplaints.filter(c => c.importance === Importance.MEDIUM).length,
      lowImportance: relevantComplaints.filter(c => c.importance === Importance.LOW).length,
    };
  }, [complaints, stats, user, selectedMuktar]);

  return (
    <DashboardAccessControl dashboardType="muktar">
      <StandardizedDashboardLayout
        title="Mukhtar Dashboard"
        subtitle={user?.role === Role.MANAGER ? `Select a Mukhtar to view their dashboard` : `Manage complaints for ${user?.district} efficiently`}
        stats={dashboardStats}
        userRole={Role.MUKTAR}
        showContentManagement={false}
      >
        {/* Mukhtar Selection Section for Managers */}
        {user?.role === Role.MANAGER && (
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-white mb-4">
                  <UserGroupIcon className="w-6 h-6" />
                  Select Mukhtar Dashboard
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="form-control w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text text-white">Choose Mukhtar to View Dashboard</span>
                    </label>
                    <select
                      className="select select-bordered w-full text-base"
                      value={selectedMuktar?.id || ''}
                      onChange={(e) => {
                        const mukhtarId = e.target.value;
                        const mukhtar = muktars.find(m => m.id === mukhtarId);
                        setSelectedMuktar(mukhtar || null);
                      }}
                    >
                      <option value="">Select a mukhtar...</option>
                      {muktars.map(mukhtar => (
                        <option key={mukhtar.id} value={mukhtar.id}>
                          {mukhtar.name} - {mukhtar.district}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedMuktar && (
                    <div className="stats bg-white/20 backdrop-blur-sm">
                      <div className="stat place-items-center">
                        <div className="stat-title text-white">Selected Mukhtar</div>
                        <div className="stat-value text-white text-lg">{selectedMuktar.name}</div>
                        <div className="stat-desc text-white/80">
                          {selectedMuktar.district}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Performance Chart */}
        <div className="card bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="card-body">
            <h2 className="card-title font-cairo text-brand-primary flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6" />
              Weekly Performance
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#059669" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const day = weeklyData.find(d => d.name === label);
                        return (
                          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                            <p className="font-semibold text-brand-primary mb-2">
                              {day?.nameAr || label}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Handled:</span>
                                <span className="font-bold text-green-600 ml-2">{payload[0].value}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Day: {label}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="handled"
                    fill="url(#performanceGradient)"
                    radius={[6, 6, 0, 0]}
                    animationBegin={0}
                    animationDuration={1200}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span className="font-semibold text-green-600">
                Total: {weeklyData.reduce((sum, day) => sum + day.handled, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section - Part 5 Requirements */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo mb-2">Analytics & Charts</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time complaints data visualization</p>
          </div>
          <ComplaintsCharts 
            complaints={complaints}
            showMuktarCharts={true}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed bg-base-200 p-2 rounded-xl">
          <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.PENDING ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.PENDING)}>
            Pending <div className="badge badge-sm ml-2 border-none">{data.filter(d => d.status === ComplaintStatus.PENDING).length}</div>
          </a>
          <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.IN_PROGRESS ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.IN_PROGRESS)}>
            In Progress
          </a>
          <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.COMPLETED ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.COMPLETED)}>
            Completed
          </a>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-end">
          <button className="btn btn-sm btn-outline gap-2" onClick={() => addToast('Exporting data...', 'info')}>
            <ArrowDownTrayIcon className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="table table-zebra w-full">
            <thead className="bg-brand-lightBg dark:bg-[#1a1a1a]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="uppercase text-xs font-bold text-gray-500">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} className="text-center py-10">Loading...</td></tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">No complaints found.</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="join">
            <button className="join-item btn btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
            <button className="join-item btn btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
          </div>
        </div>
      </StandardizedDashboardLayout>

      {/* Attachments Modal */}
      {selectedAttachments.length > 0 && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAttachments.map((url, index) => (
                <div key={index} className="card bg-base-100 shadow">
                  <div className="card-body p-4">
                    {url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') ? (
                      <video controls className="w-full h-48 object-cover rounded">
                        <source src={url} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-48 object-cover rounded" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedAttachments([])}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardAccessControl>
  );
};