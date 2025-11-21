
import React, { useMemo, useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, 
  getFilteredRowModel, flexRender, createColumnHelper 
} from '@tanstack/react-table';
import { api } from '../../services/api';
import { Complaint, ComplaintStatus, Role, Urgency } from '../../types';
import { useLangStore } from '../../store';
import { TableSkeleton } from '../shared/LoadingStates';
import { ArrowDownTrayIcon, FunnelIcon, PrinterIcon } from '@heroicons/react/24/outline';

export const AdminDashboard: React.FC = () => {
  const { t } = useLangStore();
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');

  useEffect(() => {
    // Fetch ALL complaints
    api.getComplaints(Role.ADMIN).then(res => {
        setData(res);
        setLoading(false);
    });
  }, []);

  const filteredData = useMemo(() => {
      return data.filter(item => {
          const statusMatch = statusFilter ? item.status === statusFilter : true;
          const districtMatch = districtFilter ? item.district === districtFilter : true;
          const urgencyMatch = urgencyFilter ? item.urgency === urgencyFilter : true;
          return statusMatch && districtMatch && urgencyMatch;
      });
  }, [data, statusFilter, districtFilter, urgencyFilter]);

  const columnHelper = createColumnHelper<Complaint>();
  const columns = useMemo(() => [
    columnHelper.accessor('trackingNumber', { header: 'ID', cell: info => <span className="font-mono font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('district', { header: 'District' }),
    columnHelper.accessor('category', { header: 'Category' }),
    columnHelper.accessor('urgency', { 
        header: 'Urgency', 
        cell: info => (
            <span className={`badge ${info.getValue() === Urgency.CRITICAL ? 'badge-error text-white' : info.getValue() === Urgency.URGENT ? 'badge-warning' : 'badge-ghost'}`}>
                {info.getValue()}
            </span>
        )
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => (
            <select 
                className="select select-bordered select-xs w-full max-w-[120px]" 
                value={info.getValue()} 
                onChange={(e) => {
                    const newStatus = e.target.value as ComplaintStatus;
                    api.updateComplaintStatus(info.row.original.id, newStatus);
                    setData(prev => prev.map(p => p.id === info.row.original.id ? { ...p, status: newStatus } : p));
                }}
            >
                {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        )
    }),
    columnHelper.accessor('createdAt', { header: 'Date' }),
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <select className="select select-bordered select-sm" onChange={e => setDistrictFilter(e.target.value)}>
                    <option value="">All Districts</option>
                    <option value="District 1">District 1</option>
                    <option value="District 2">District 2</option>
                    <option value="District 3">District 3</option>
                </select>
                <select className="select select-bordered select-sm" onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="select select-bordered select-sm" onChange={e => setUrgencyFilter(e.target.value)}>
                    <option value="">All Urgencies</option>
                    {Object.values(Urgency).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
            
            {/* Tools */}
            <div className="flex gap-2">
                <button className="btn btn-sm btn-outline gap-2" onClick={() => window.print()}>
                    <PrinterIcon className="w-4 h-4" /> Print
                </button>
                <button className="btn btn-sm btn-primary text-white gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" /> {t('admin.export')}
                </button>
            </div>
        </div>

        {/* Table */}
        {loading ? <TableSkeleton /> : (
            <div className="overflow-x-auto bg-base-100 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <table className="table table-zebra w-full">
                    <thead className="bg-brand-primary text-white">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="uppercase text-xs font-bold">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">No records found matching filters.</td></tr>
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
                
                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500">
                        Showing {table.getRowModel().rows.length} of {data.length} entries
                    </span>
                    <div className="join">
                        <button className="join-item btn btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
                        <button className="join-item btn btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
