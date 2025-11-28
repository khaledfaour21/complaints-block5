import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Complaint, Importance, ComplaintStatus, Role } from '../../types';
import { api } from '../../services/api';
import { useAuthStore } from '../../store';

interface ComplaintsChartsProps {
  complaints: Complaint[];
  showManagerCharts?: boolean;
  showAdminCharts?: boolean;
  showMuktarCharts?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Chart color schemes
const COLORS = {
  importance: {
    high: '#ef4444',
    medium: '#f59e0b', 
    low: '#10b981'
  },
  status: {
    pending: '#ef4444',
    under_review: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    closed: '#6b7280'
  },
  timeline: '#3b82f6'
};

// Importance Chart Component
export const ImportanceChart: React.FC<{ complaints: Complaint[]; title?: string }> = ({ 
  complaints, 
  title = "Complaints by Importance" 
}) => {
  const { user } = useAuthStore();
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // Apply role-based filtering
    let filtered = [...complaints];
    
    if (user?.role === Role.MUKTAR) {
      // Mukhtar only sees LOW importance complaints
      filtered = complaints.filter(c => c.importance === Importance.LOW);
    } else if (user?.role === Role.ADMIN) {
      // Admin sees MEDIUM + LOW importance complaints
      filtered = complaints.filter(c => 
        c.importance === Importance.MEDIUM || c.importance === Importance.LOW
      );
    }
    // Manager sees all data (no filtering)
    
    setFilteredComplaints(filtered);
  }, [complaints, user?.role]);

  const data = useMemo(() => {
    const counts = {
      high: filteredComplaints.filter(c => c.importance === Importance.HIGH).length,
      medium: filteredComplaints.filter(c => c.importance === Importance.MEDIUM).length,
      low: filteredComplaints.filter(c => c.importance === Importance.LOW).length,
    };

    return [
      {
        name: 'High',
        nameAr: 'عالية',
        value: counts.high,
        color: COLORS.importance.high,
        percentage: filteredComplaints.length > 0 ? ((counts.high / filteredComplaints.length) * 100).toFixed(1) : '0'
      },
      {
        name: 'Medium',
        nameAr: 'متوسطة',
        value: counts.medium,
        color: COLORS.importance.medium,
        percentage: filteredComplaints.length > 0 ? ((counts.medium / filteredComplaints.length) * 100).toFixed(1) : '0'
      },
      {
        name: 'Low',
        nameAr: 'منخفضة',
        value: counts.low,
        color: COLORS.importance.low,
        percentage: filteredComplaints.length > 0 ? ((counts.low / filteredComplaints.length) * 100).toFixed(1) : '0'
      }
    ];
  }, [filteredComplaints]);

  return (
    <div className="card bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        <h3 className="card-title font-cairo text-brand-primary flex items-center gap-2">
          <ExclamationTriangleIcon className="w-6 h-6" />
          {title}
          <div className="badge badge-sm badge-outline">
            {filteredComplaints.length} total
          </div>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`importance-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                    <stop offset="50%" stopColor={entry.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={entry.color} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
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
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                        <p className="font-semibold text-brand-primary mb-2">{label} Importance</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Count: <span className="font-bold" style={{ color: data.color }}>{data.value}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Percentage: {data.percentage}%
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {data.map((entry, index) => (
                <Bar
                  key={entry.name}
                  dataKey="value"
                  fill={`url(#importance-gradient-${index})`}
                  radius={[6, 6, 0, 0]}
                  animationBegin={index * 200}
                  animationDuration={1000}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.map((item, index) => (
            item.value > 0 && (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500">({item.value})</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

// Status Chart Component
export const StatusChart: React.FC<{ complaints: Complaint[]; title?: string }> = ({ 
  complaints, 
  title = "Complaints by Status" 
}) => {
  const data = useMemo(() => {
    const counts = {
      pending: complaints.filter(c => c.status === ComplaintStatus.PENDING).length,
      under_review: complaints.filter(c => c.status === ComplaintStatus.UNDER_REVIEW).length,
      in_progress: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
      completed: complaints.filter(c => c.status === ComplaintStatus.COMPLETED).length,
      closed: complaints.filter(c => c.status === ComplaintStatus.CLOSED).length,
    };

    return [
      {
        name: 'Pending',
        nameAr: 'معلق',
        value: counts.pending,
        color: COLORS.status.pending
      },
      {
        name: 'Under Review',
        nameAr: 'قيد المراجعة',
        value: counts.under_review,
        color: COLORS.status.under_review
      },
      {
        name: 'In Progress',
        nameAr: 'قيد المعالجة',
        value: counts.in_progress,
        color: COLORS.status.in_progress
      },
      {
        name: 'Completed',
        nameAr: 'مكتمل',
        value: counts.completed,
        color: COLORS.status.completed
      },
      {
        name: 'Closed',
        nameAr: 'مغلق',
        value: counts.closed,
        color: COLORS.status.closed
      }
    ];
  }, [complaints]);

  return (
    <div className="card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        <h3 className="card-title font-cairo text-brand-primary flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" />
          {title}
          <div className="badge badge-sm badge-outline">
            {complaints.length} total
          </div>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
                label={({ name, percent, value }) =>
                  value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={3}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                        <p className="font-semibold text-brand-primary mb-2">{data.name}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Count: <span className="font-bold" style={{ color: data.color }}>{data.value}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Percentage: {complaints.length > 0 ? ((data.value / complaints.length) * 100).toFixed(1) : '0'}%
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {data.map((item, index) => (
            item.value > 0 && (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500">({item.value})</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

// Timeline Chart Component
export const TimelineChart: React.FC<{ complaints: Complaint[]; title?: string }> = ({ 
  complaints, 
  title = "Complaints Timeline" 
}) => {
  const data = useMemo(() => {
    // Group complaints by month
    const monthlyData = complaints.reduce((acc, complaint) => {
      const date = new Date(complaint.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthName,
          nameAr: monthName,
          count: 0,
          month: monthKey
        };
      }
      acc[monthKey].count++;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    );
  }, [complaints]);

  return (
    <div className="card bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        <h3 className="card-title font-cairo text-brand-primary flex items-center gap-2">
          <ClockIcon className="w-6 h-6" />
          {title}
          <div className="badge badge-sm badge-outline">
            {complaints.length} total
          </div>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.timeline} stopOpacity={0.8}/>
                  <stop offset="50%" stopColor={COLORS.timeline} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={COLORS.timeline} stopOpacity={0.1}/>
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
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                        <p className="font-semibold text-brand-primary mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Complaints: <span className="font-bold text-blue-600">{payload[0].value}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.timeline}
                strokeWidth={3}
                fill="url(#timelineGradient)"
                animationBegin={0}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Timeline Period</span>
          <span className="font-semibold text-green-600">
            Peak: {data.reduce((max, item) => item.count > max.count ? item : max, { count: 0 }).count} complaints
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Charts Container Component
export const ComplaintsCharts: React.FC<ComplaintsChartsProps> = ({
  complaints,
  showManagerCharts = false,
  showAdminCharts = false,
  showMuktarCharts = false,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const { user } = useAuthStore();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In a real application, this would trigger a data refresh
      console.log('Auto-refreshing chart data...');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const shouldShowCharts = useMemo(() => {
    if (showManagerCharts && user?.role === Role.MANAGER) return true;
    if (showAdminCharts && user?.role === Role.ADMIN) return true;
    if (showMuktarCharts && user?.role === Role.MUKTAR) return true;
    return false;
  }, [user?.role, showManagerCharts, showAdminCharts, showMuktarCharts]);

  if (!shouldShowCharts) {
    return (
      <div className="alert alert-warning">
        <ExclamationTriangleIcon className="w-6 h-6" />
        <span>You don't have permission to view charts for this data level.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImportanceChart 
          complaints={complaints} 
          title={
            user?.role === Role.MANAGER ? "All Complaints by Importance" :
            user?.role === Role.ADMIN ? "Medium + Low Importance Complaints" :
            "Low Importance Complaints"
          } 
        />
        <StatusChart 
          complaints={complaints} 
          title={
            user?.role === Role.MANAGER ? "All Complaints by Status" :
            user?.role === Role.ADMIN ? "Medium + Low Complaints by Status" :
            "Low Importance Complaints by Status"
          } 
        />
      </div>

      {/* Timeline Chart - Full Width */}
      <div className="lg:col-span-2">
        <TimelineChart 
          complaints={complaints} 
          title={
            user?.role === Role.MANAGER ? "All Complaints Timeline" :
            user?.role === Role.ADMIN ? "Medium + Low Complaints Timeline" :
            "Low Importance Complaints Timeline"
          } 
        />
      </div>
    </div>
  );
};

export default ComplaintsCharts;