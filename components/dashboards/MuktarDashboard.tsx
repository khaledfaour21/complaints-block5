import React, { useEffect, useMemo, useState } from 'react';
import { 
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, 
  flexRender, createColumnHelper 
} from '@tanstack/react-table';
import { Complaint, ComplaintStatus, Urgency } from '../../types';
import { api } from '../../services/api';
import { useLangStore, useAuthStore, useToastStore } from '../../store';
import { EyeIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const MuktarDashboard: React.FC = () => {
  const { t } = useLangStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<ComplaintStatus>(ComplaintStatus.UNREAD);
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(user) {
        api.getComplaints(user.role as any).then(res => {
            setData(res);
            setLoading(false);
        });
    }
  }, [user]);

  const filteredData = useMemo(() => {
    if (activeTab === ComplaintStatus.IN_PROGRESS) return data.filter(d => d.status === ComplaintStatus.IN_PROGRESS);
    if (activeTab === ComplaintStatus.COMPLETED) return data.filter(d => d.status === ComplaintStatus.COMPLETED);
    return data.filter(d => d.status === ComplaintStatus.UNREAD);
  }, [data, activeTab]);

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    try {
        await api.updateComplaintStatus(id, status);
        // Optimistic update
        setData(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        
        if (status === ComplaintStatus.IN_PROGRESS) addToast('Complaint Accepted', 'success');
        else if (status === ComplaintStatus.REJECTED) addToast('Complaint Rejected', 'warning');
        else if (status === ComplaintStatus.COMPLETED) addToast('Complaint Completed', 'success');
        
    } catch (e) {
        addToast('Failed to update status', 'error');
    }
  };

  // Table Config
  const columnHelper = createColumnHelper<Complaint>();
  const columns = useMemo(() => [
    columnHelper.accessor('trackingNumber', { header: 'ID', cell: info => <span className="font-mono text-xs font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('category', { header: 'Category' }),
    columnHelper.accessor('title', { header: 'Title', cell: info => <span className="font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('urgency', { 
        header: 'Urgency', 
        cell: info => (
            <span className={`badge ${info.getValue() === Urgency.CRITICAL ? 'badge-error text-white' : info.getValue() === Urgency.URGENT ? 'badge-warning' : 'badge-ghost'}`}>
                {info.getValue()}
            </span>
        )
    }),
    columnHelper.accessor('createdAt', { header: 'Date' }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
            <div className="flex gap-2">
                {activeTab === ComplaintStatus.UNREAD && (
                    <>
                        <button onClick={() => handleStatusChange(info.row.original.id, ComplaintStatus.IN_PROGRESS)} className="btn btn-xs btn-success text-white" title="Accept">
                            <CheckIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleStatusChange(info.row.original.id, ComplaintStatus.REJECTED)} className="btn btn-xs btn-error text-white" title="Reject">
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

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed bg-base-200 p-2 rounded-xl">
            <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.UNREAD ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.UNREAD)}>
                {t('status.unread')} <div className="badge badge-sm ml-2 border-none">{data.filter(d => d.status === ComplaintStatus.UNREAD).length}</div>
            </a>
            <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.IN_PROGRESS ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.IN_PROGRESS)}>
                {t('status.inprogress')}
            </a>
            <a role="tab" className={`tab transition-all ${activeTab === ComplaintStatus.COMPLETED ? 'tab-active bg-white dark:bg-brand-primary dark:text-white shadow scale-105' : ''}`} onClick={() => setActiveTab(ComplaintStatus.COMPLETED)}>
                {t('status.completed')}
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
                        <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-400">No complaints found.</td></tr>
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
    </div>
  );
};