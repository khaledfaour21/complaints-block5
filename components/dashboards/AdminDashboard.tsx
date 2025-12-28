import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { api } from "../../services/api";
import {
  Complaint,
  ComplaintStatus,
  Role,
  Importance,
  User,
} from "../../types";
import { useLangStore, useAuthStore } from "../../store";
import { TableSkeleton } from "../shared/LoadingStates";
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  PrinterIcon,
  ChartBarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
  CogIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { DashboardAccessControl } from "../shared/AccessControl";
import { StandardizedDashboardLayout } from "../shared/StandardizedDashboardLayout";
import { StatusBadge } from "../shared/StatusBadge";
import { ComplaintsCharts } from "../charts/ComplaintsCharts";
import { useComplaintsData } from "../../context/ComplaintsDataContext";

export const AdminDashboard: React.FC = () => {
  const { t } = useLangStore();
  const { user } = useAuthStore();
  const { complaints, loading: complaintsLoading } = useComplaintsData();
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  // Accept/Refuse Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [actionType, setActionType] = useState<"accept" | "refuse">("accept");
  const [actionText, setActionText] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [importanceFilter, setImportanceFilter] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      // Use data from context, but also set local state for backward compatibility
      setData(complaints);
      setLoading(complaintsLoading);

      // Load admins if user is MANAGER
      if (user?.role === Role.MANAGER) {
        const adminsData = await api.getAdmins();
        setAdmins(adminsData);
        // Set first admin as selected by default
        if (adminsData.length > 0 && !selectedAdmin) {
          setSelectedAdmin(adminsData[0]);
        }
      }
    };

    loadData();
  }, [complaints, complaintsLoading, user]);

  const filteredData = useMemo(() => {
    let filtered = complaints;

    // Filter by priority: Admin dashboard shows urgent (high priority) complaints
    filtered = filtered.filter((item) => item.importance === Importance.MEDIUM);

    // Filter by selected admin or user role (for managers viewing specific admins)
    if (user?.role === Role.MANAGER && selectedAdmin) {
      filtered = filtered.filter(
        (item) => item.assignedAdminId === selectedAdmin.id
      );
    }

    return filtered.filter((item) => {
      const statusMatch = statusFilter ? item.status === statusFilter : true;
      const districtMatch = districtFilter
        ? item.district === districtFilter
        : true;
      const importanceMatch = importanceFilter
        ? item.importance === importanceFilter
        : true;
      return statusMatch && districtMatch && importanceMatch;
    });
  }, [
    complaints,
    user,
    selectedAdmin,
    statusFilter,
    districtFilter,
    importanceFilter,
  ]);

  const columnHelper = createColumnHelper<Complaint>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("trackingNumber", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono font-bold">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("district", { header: "District" }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => (
          <span className="text-sm text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("category", { header: "Category" }),
      columnHelper.accessor("importance", {
        header: "Importance",
        cell: (info) => (
          <select
            className="select select-bordered select-xs w-full"
            value={info.getValue()}
            onChange={(e) => {
              const newImportance = e.target.value as Importance;
              api.updateComplaintImportance(
                info.row.original.id,
                newImportance
              );
              setData((prev) =>
                prev.map((p) =>
                  p.id === info.row.original.id
                    ? { ...p, importance: newImportance }
                    : p
                )
              );
            }}
          >
            {Object.values(Importance).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => <span className="font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="text-sm text-gray-600 truncate max-w-xs block">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone",
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("citizenHelp", {
        header: "Citizen Help",
        cell: (info) => (
          <span className="text-sm">{info.getValue() || "N/A"}</span>
        ),
      }),
      columnHelper.accessor("attachments", {
        header: "Attachments",
        cell: (info) =>
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
          ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} size="sm" />,
      }),
      columnHelper.accessor("createdAt", { header: "Date" }),
      columnHelper.accessor("pinned", {
        header: "Pinned",
        cell: (info) => (
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={info.getValue() || false}
            onChange={(e) => {
              api.updateComplaintPinned(info.row.original.id, e.target.checked);
              setData((prev) =>
                prev.map((p) =>
                  p.id === info.row.original.id
                    ? { ...p, pinned: e.target.checked }
                    : p
                )
              );
            }}
          />
        ),
      }),

      // Working On Toggle (Admin only)
      columnHelper.display({
        id: "working_on",
        header: "Working On",
        cell: (info) => {
          const complaint = info.row.original;
          return (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={async () => {
                  try {
                    const updatedComplaint = await api.toggleWorkingOn(
                      complaint.id
                    );
                    setData((prev) =>
                      prev.map((c) =>
                        c.id === complaint.id
                          ? {
                              ...c,
                              isWorkingOn: updatedComplaint.isWorkingOn,
                              workingOnBy: updatedComplaint.workingOnBy,
                            }
                          : c
                      )
                    );
                  } catch (error) {
                    console.error("Failed to toggle working on status:", error);
                  }
                }}
                className={`btn btn-xs ${
                  complaint.isWorkingOn ? "btn-error" : "btn-success"
                } text-white`}
              >
                {complaint.isWorkingOn ? "Stop Working" : "Start Working"}
              </button>
              {complaint.isWorkingOn && complaint.workingOnBy && (
                <span className="text-xs text-gray-500 text-center">
                  {complaint.workingOnBy}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const complaint = info.row.original;
          const canAccept =
            complaint.status === ComplaintStatus.PENDING ||
            complaint.status === ComplaintStatus.IN_PROGRESS;
          const canRefuse =
            complaint.status === ComplaintStatus.PENDING ||
            complaint.status === ComplaintStatus.IN_PROGRESS;

          return (
            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-success text-white"
                onClick={() => handleActionClick(complaint, "accept")}
                disabled={!canAccept}
                title="Accept complaint"
              >
                ✓ Accept
              </button>
              <button
                className="btn btn-xs btn-error text-white"
                onClick={() => handleActionClick(complaint, "refuse")}
                disabled={!canRefuse}
                title="Refuse complaint"
              >
                ✗ Refuse
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const stats = useMemo(() => {
    const relevantComplaints =
      user?.role === Role.MANAGER && selectedAdmin
        ? complaints.filter((c) => c.assignedAdminId === selectedAdmin.id)
        : user?.role === Role.ADMIN
        ? complaints.filter((c) => c.assignedAdminId === user.id)
        : complaints; // For other roles, show all

    return {
      total: relevantComplaints.length,
      pending: relevantComplaints.filter(
        (c) => c.status === ComplaintStatus.PENDING
      ).length,
      underReview: relevantComplaints.filter(
        (c) => c.status === ComplaintStatus.UNDER_REVIEW
      ).length,
      inProgress: relevantComplaints.filter(
        (c) => c.status === ComplaintStatus.IN_PROGRESS
      ).length,
      completed: relevantComplaints.filter(
        (c) => c.status === ComplaintStatus.COMPLETED
      ).length,
      closed: relevantComplaints.filter(
        (c) => c.status === ComplaintStatus.CLOSED
      ).length,
    };
  }, [complaints, user, selectedAdmin]);

  const statusData = useMemo(
    () => [
      {
        name: "Pending",
        nameEn: "Pending",
        nameAr: "معلق",
        value: stats.pending,
        color: "#ef4444",
        gradient: "from-red-400 to-red-600",
      },
      {
        name: "Under Review",
        nameEn: "Under Review",
        nameAr: "قيد المراجعة",
        value: stats.underReview,
        color: "#f59e0b",
        gradient: "from-yellow-400 to-yellow-600",
      },
      {
        name: "In Progress",
        nameEn: "In Progress",
        nameAr: "قيد المعالجة",
        value: stats.inProgress,
        color: "#3b82f6",
        gradient: "from-blue-400 to-blue-600",
      },
      {
        name: "Completed",
        nameEn: "Completed",
        nameAr: "مكتملة",
        value: stats.completed,
        color: "#10b981",
        gradient: "from-green-400 to-green-600",
      },
      {
        name: "Closed",
        nameEn: "Closed",
        nameAr: "مغلقة",
        value: stats.closed,
        color: "#6b7280",
        gradient: "from-gray-400 to-gray-600",
      },
    ],
    [stats]
  );

  const districtData = useMemo(() => {
    const relevantComplaints =
      user?.role === Role.MANAGER && selectedAdmin
        ? complaints.filter((c) => c.assignedAdminId === selectedAdmin.id)
        : user?.role === Role.ADMIN
        ? complaints.filter((c) => c.assignedAdminId === user.id)
        : complaints; // For other roles, show all

    const districts = [
      { name: "District 1", nameAr: "الحي الأول", color: "#3b82f6" },
      { name: "District 2", nameAr: "الحي الثاني", color: "#8b5cf6" },
      { name: "District 3", nameAr: "الحي الثالث", color: "#06b6d4" },
    ];
    return districts.map((d) => ({
      name: d.name,
      nameAr: d.nameAr,
      complaints: relevantComplaints.filter((c) => c.district === d.name)
        .length,
      color: d.color,
      fill: d.color,
    }));
  }, [complaints, user, selectedAdmin]);

  // Prepare stats for StandardizedDashboardLayout
  const dashboardStats = useMemo(() => {
    const relevantComplaints =
      user?.role === Role.MANAGER && selectedAdmin
        ? complaints.filter((c) => c.assignedAdminId === selectedAdmin.id)
        : user?.role === Role.ADMIN
        ? complaints.filter((c) => c.assignedAdminId === user.id)
        : complaints; // For other roles, show all

    return {
      total: stats.total,
      pending: stats.pending,
      inProgress: stats.inProgress,
      completed: stats.completed,
      highImportance: relevantComplaints.filter(
        (c) => c.importance === Importance.HIGH
      ).length,
      mediumImportance: relevantComplaints.filter(
        (c) => c.importance === Importance.MEDIUM
      ).length,
      lowImportance: relevantComplaints.filter(
        (c) => c.importance === Importance.LOW
      ).length,
    };
  }, [complaints, stats, user, selectedAdmin]);

  const handleActionClick = (
    complaint: Complaint,
    action: "accept" | "refuse"
  ) => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setActionText("");
    setShowActionModal(true);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setProcessingAction(true);
    try {
      if (actionType === "accept") {
        await api.acceptComplaint(selectedComplaint.id, actionText);
        // Update local state
        setData((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: ComplaintStatus.COMPLETED,
                  solutionInfo: actionText,
                }
              : c
          )
        );
      } else {
        await api.refuseComplaint(selectedComplaint.id, actionText);
        // Update local state
        setData((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: ComplaintStatus.CLOSED,
                  refusalReason: actionText,
                }
              : c
          )
        );
      }
      setShowActionModal(false);
      setSelectedComplaint(null);
      // Show success message
      alert(`Complaint ${actionType}ed successfully!`);
    } catch (error) {
      alert(`Failed to ${actionType} complaint`);
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <DashboardAccessControl dashboardType="admin">
      <StandardizedDashboardLayout
        title={t("nav.admin_dashboard")}
        subtitle={
          user?.role === Role.MANAGER
            ? t("dashboard.select_admin")
            : t("dashboard.monitor_system")
        }
        stats={dashboardStats}
        userRole={Role.ADMIN}
        showContentManagement={true}
      >
        {/* Admin Selection Section for Managers */}
        {user?.role === Role.MANAGER && (
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-white mb-4">
                  <ShieldCheckIcon className="w-6 h-6" />
                  Select Admin Dashboard
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="form-control w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text text-white">
                        Choose Admin to View Dashboard
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full text-base"
                      value={selectedAdmin?.id || ""}
                      onChange={(e) => {
                        const adminId = e.target.value;
                        const admin = admins.find((a) => a.id === adminId);
                        setSelectedAdmin(admin || null);
                      }}
                    >
                      <option value="">Select an admin...</option>
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} - Admin
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedAdmin && (
                    <div className="stats bg-white/20 backdrop-blur-sm">
                      <div className="stat place-items-center">
                        <div className="stat-title text-white">
                          Selected Admin
                        </div>
                        <div className="stat-value text-white text-lg">
                          {selectedAdmin.name}
                        </div>
                        <div className="stat-desc text-white/80">Admin</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Charts Section - Part 5 Requirements */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo mb-2">
              Analytics & Charts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time complaints data visualization
            </p>
          </div>
          <ComplaintsCharts
            complaints={filteredData}
            showAdminCharts={true}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </div>

        {/* Original Charts Section - Keeping for reference but will be enhanced with new charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="card-body">
              <h2 className="card-title font-cairo text-brand-primary flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" />
                Complaint Status Overview
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      innerRadius={40}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                      label={({ name, percent, value }) =>
                        value > 0
                          ? `${name}: ${(percent * 100).toFixed(1)}%`
                          : ""
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={2}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                              <p className="font-semibold text-brand-primary">
                                {data.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Count:{" "}
                                <span className="font-bold">{data.value}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {((data.value / stats.total) * 100).toFixed(1)}%
                                of total
                              </p>
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
                {statusData.map(
                  (item, index) =>
                    item.value > 0 && (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500">({item.value})</span>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="card-body">
              <h2 className="card-title font-cairo text-brand-primary flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                District Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={districtData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      {districtData.map((entry, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={entry.color}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={entry.color}
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                              <p className="font-semibold text-brand-primary">
                                {label}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Complaints:{" "}
                                <span className="font-bold text-blue-600">
                                  {payload[0].value}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {districtData.map((entry, index) => (
                      <Bar
                        key={entry.name}
                        dataKey="complaints"
                        fill={`url(#gradient-${index})`}
                        radius={[4, 4, 0, 0]}
                        animationBegin={index * 200}
                        animationDuration={1000}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select
              className="select select-bordered select-sm"
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="">All Districts</option>
              <option value="District 1">District 1</option>
              <option value="District 2">District 2</option>
              <option value="District 3">District 3</option>
            </select>
            <select
              className="select select-bordered select-sm"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(ComplaintStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm"
              onChange={(e) => setImportanceFilter(e.target.value)}
            >
              <option value="">All Importances</option>
              {Object.values(Importance).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline gap-2"
              onClick={() => window.print()}
            >
              <PrinterIcon className="w-4 h-4" /> Print
            </button>
            <button className="btn btn-sm btn-primary text-white gap-2">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <table className="table table-zebra w-full">
              <thead className="bg-brand-primary text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="uppercase text-xs font-bold"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="text-center py-10 text-gray-400"
                    >
                      No records found matching filters.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                Showing {table.getRowModel().rows.length} of {data.length}{" "}
                entries
              </span>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  «
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
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
                    {url.includes(".mp4") ||
                    url.includes(".webm") ||
                    url.includes(".ogg") ? (
                      <video
                        controls
                        className="w-full h-48 object-cover rounded"
                      >
                        <source src={url} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setSelectedAttachments([])}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept/Refuse Action Modal */}
      {showActionModal && selectedComplaint && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {actionType === "accept" ? "Accept" : "Refuse"} Complaint
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Complaint ID:</strong>{" "}
                {selectedComplaint.trackingNumber}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Title:</strong> {selectedComplaint.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Category:</strong> {selectedComplaint.category}
              </p>
            </div>
            <form onSubmit={handleSubmitAction}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">
                    {actionType === "accept"
                      ? "Solution Information"
                      : "Refusal Reason"}
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder={
                    actionType === "accept"
                      ? "Enter the solution details..."
                      : "Enter the reason for refusal..."
                  }
                  required
                  rows={4}
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowActionModal(false)}
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${
                    actionType === "accept" ? "btn-success" : "btn-error"
                  } text-white`}
                  disabled={processingAction || !actionText.trim()}
                >
                  {processingAction
                    ? "Processing..."
                    : `${
                        actionType === "accept" ? "Accept" : "Refuse"
                      } Complaint`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardAccessControl>
  );
};
