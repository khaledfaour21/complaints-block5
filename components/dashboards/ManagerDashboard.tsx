import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import {
  User,
  Role,
  Complaint,
  ComplaintStatus,
  Importance,
} from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  UserGroupIcon,
  ChartBarIcon,
  UserPlusIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { ImportanceBadge } from "../shared/ImportanceBadge";
import { StatusBadge } from "../shared/StatusBadge";
import { PinIcon } from "../shared/PinIcon";
import { EnhancedComplaintsView } from "../shared/EnhancedComplaintsView";
import { UnifiedContentManagement } from "../shared/UnifiedContentManagement";
import { DashboardAccessControl } from "../shared/AccessControl";
import { StandardizedDashboardLayout } from "../shared/StandardizedDashboardLayout";
import { useAuthStore, useLangStore } from "../../store";
import { useMemo } from "react";
import { ComplaintsCharts } from "../charts/ComplaintsCharts";
import { useComplaintsData } from "../../context/ComplaintsDataContext";
import { TableSkeleton } from "../shared/LoadingStates";

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const {
    complaints,
    loading: complaintsLoading,
    isUsingDemoData,
  } = useComplaintsData();
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [muktars, setMuktars] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedMuktar, setSelectedMuktar] = useState<User | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [systemComplaints, setSystemComplaints] = useState<Complaint[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.MUKTAR,
    district: "District 1",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Accept/Refuse Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [actionType, setActionType] = useState<"accept" | "refuse">("accept");
  const [actionText, setActionText] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Filter States for Manager Table
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

  useEffect(() => {
    const loadUsers = async () => {
      const muktarsData = await api.getMuktars();
      const adminsData = await api.getAdmins();
      setMuktars(muktarsData);
      setAdmins(adminsData);

      // Combine all users for selection
      const combinedUsers = [...muktarsData, ...adminsData];
      setAllUsers(combinedUsers);
    };

    const loadComplaints = async () => {
      try {
        const complaintsData = await api.getComplaints(Role.MANAGER);
        setSystemComplaints(complaintsData);

        // If no complaints from API, show demo data for development
        if (complaintsData.length === 0) {
          console.log(
            "No complaints from API, showing demo data for development"
          );
          const demoComplaints = [
            {
              id: "demo-1",
              trackingTag: "MGR-001",
              neighborhood: "District 1",
              complaint_type: "infrastructure",
              priority: "high",
              description:
                "Major pothole on Main Street causing traffic disruption",
              complaint_status: "pending",
              createdAt: new Date().toISOString(),
              contactNumber: "0912345678",
              submitterName: "John Doe",
              location: "Main Street & Oak Avenue",
              suggestedSolution: "Fill pothole with asphalt and resurface",
              solutionInfo: "",
              refusalReason: "",
              notes: "High priority - affects main traffic route",
              estimatedReviewTime: "2 days",
            },
            {
              id: "demo-2",
              trackingTag: "MGR-002",
              neighborhood: "District 2",
              complaint_type: "sanitation",
              priority: "high",
              description: "Overflowing garbage bins causing health hazard",
              complaint_status: "pending",
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              contactNumber: "0998765432",
              submitterName: "Jane Smith",
              location: "Central Market Area",
              suggestedSolution: "Increase collection frequency",
              solutionInfo: "",
              refusalReason: "",
              notes: "Urgent - health and sanitation concern",
              estimatedReviewTime: "1 day",
            },
            {
              id: "demo-3",
              trackingTag: "MGR-003",
              neighborhood: "District 3",
              complaint_type: "electricity",
              priority: "high",
              description: "Street lights not working in residential area",
              complaint_status: "accepted",
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              contactNumber: "0955566677",
              submitterName: "Ahmed Hassan",
              location: "Elm Street Residential Block",
              suggestedSolution: "Replace faulty bulbs and check wiring",
              solutionInfo: "Maintenance team dispatched, bulbs replaced",
              refusalReason: "",
              notes: "Resolved - safety issue addressed",
              estimatedReviewTime: "3 days",
            },
          ];

          // Map raw backend format to frontend Complaint format
          const mappedComplaints: Complaint[] = demoComplaints.map(
            (complaint) => ({
              id: complaint.id,
              trackingNumber: complaint.trackingTag,
              district: complaint.neighborhood,
              category: complaint.complaint_type,
              importance:
                complaint.priority === "high"
                  ? Importance.HIGH
                  : complaint.priority === "mid"
                  ? Importance.MEDIUM
                  : Importance.LOW,
              title: complaint.description.substring(0, 50) + "...",
              description: complaint.description,
              status:
                complaint.complaint_status === "pending"
                  ? ComplaintStatus.PENDING
                  : complaint.complaint_status === "accepted"
                  ? ComplaintStatus.COMPLETED
                  : complaint.complaint_status === "refused"
                  ? ComplaintStatus.CLOSED
                  : ComplaintStatus.IN_PROGRESS,
              createdAt: complaint.createdAt,
              phoneNumber: complaint.contactNumber,
              attachments: [],
              pinned: false,
              submitterName: complaint.submitterName,
              location: complaint.location,
              citizenHelp: complaint.suggestedSolution || "",
              solutionInfo: complaint.solutionInfo,
              refusalReason: complaint.refusalReason,
              notes: complaint.notes,
              estimatedReviewTime: complaint.estimatedReviewTime,
            })
          );
          setSystemComplaints(mappedComplaints);
        }
      } catch (error) {
        console.error("Failed to load complaints:", error);
        // Show demo data on API failure for development
        const demoComplaints = [
          {
            id: "demo-1",
            trackingTag: "MGR-001",
            neighborhood: "District 1",
            complaint_type: "infrastructure",
            priority: "high",
            description:
              "Major pothole on Main Street causing traffic disruption",
            complaint_status: "pending",
            createdAt: new Date().toISOString(),
            contactNumber: "0912345678",
            submitterName: "John Doe",
            location: "Main Street & Oak Avenue",
            suggestedSolution: "Fill pothole with asphalt and resurface",
            solutionInfo: "",
            refusalReason: "",
            notes: "High priority - affects main traffic route",
            estimatedReviewTime: "2 days",
          },
        ];

        // Map raw backend format to frontend Complaint format
        const mappedComplaints: Complaint[] = demoComplaints.map(
          (complaint) => ({
            id: complaint.id,
            trackingNumber: complaint.trackingTag,
            district: complaint.neighborhood,
            category: complaint.complaint_type,
            importance:
              complaint.priority === "high"
                ? Importance.HIGH
                : complaint.priority === "mid"
                ? Importance.MEDIUM
                : Importance.LOW,
            title: complaint.description.substring(0, 50) + "...",
            description: complaint.description,
            status:
              complaint.complaint_status === "pending"
                ? ComplaintStatus.PENDING
                : complaint.complaint_status === "accepted"
                ? ComplaintStatus.COMPLETED
                : complaint.complaint_status === "refused"
                ? ComplaintStatus.CLOSED
                : ComplaintStatus.IN_PROGRESS,
            createdAt: complaint.createdAt,
            phoneNumber: complaint.contactNumber,
            attachments: [],
            pinned: false,
            submitterName: complaint.submitterName,
            location: complaint.location,
            citizenHelp: complaint.suggestedSolution || "",
            solutionInfo: complaint.solutionInfo,
            refusalReason: complaint.refusalReason,
            notes: complaint.notes,
            estimatedReviewTime: complaint.estimatedReviewTime,
          })
        );
        setSystemComplaints(mappedComplaints);
      }
    };

    loadUsers();
    loadComplaints();

    // Use data from context, but also set local state for backward compatibility
    setData(complaints);
    setLoading(complaintsLoading);
  }, [complaints, complaintsLoading]);

  const filteredData = useMemo(() => {
    return systemComplaints.filter((item) => {
      const statusMatch = statusFilter ? item.status === statusFilter : true;
      const districtMatch = districtFilter
        ? item.district === districtFilter
        : true;
      return (
        statusMatch && districtMatch && item.importance === Importance.HIGH
      );
    });
  }, [systemComplaints, statusFilter, districtFilter]);

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

  // Enhanced Chart Data
  const performanceData = React.useMemo(
    () => [
      {
        name: "الأسبوع 1",
        nameEn: "Week 1",
        resolved: Math.floor(Math.random() * 25) + 10,
        pending: Math.floor(Math.random() * 10) + 2,
      },
      {
        name: "الأسبوع 2",
        nameEn: "Week 2",
        resolved: Math.floor(Math.random() * 25) + 10,
        pending: Math.floor(Math.random() * 10) + 2,
      },
      {
        name: "الأسبوع 3",
        nameEn: "Week 3",
        resolved: Math.floor(Math.random() * 25) + 10,
        pending: Math.floor(Math.random() * 10) + 2,
      },
      {
        name: "الأسبوع 4",
        nameEn: "Week 4",
        resolved: Math.floor(Math.random() * 25) + 10,
        pending: Math.floor(Math.random() * 10) + 2,
      },
    ],
    []
  );

  const systemStats = React.useMemo(() => {
    const resolved = systemComplaints.filter(
      (c) => c.status === ComplaintStatus.COMPLETED
    ).length;
    const pending = systemComplaints.filter(
      (c) =>
        c.status === ComplaintStatus.IN_PROGRESS ||
        c.status === ComplaintStatus.PENDING ||
        c.status === ComplaintStatus.UNDER_REVIEW
    ).length;
    const highImportance = systemComplaints.filter(
      (c) => c.importance === Importance.HIGH
    ).length;
    const mediumImportance = systemComplaints.filter(
      (c) => c.importance === Importance.MEDIUM
    ).length;
    const lowImportance = systemComplaints.filter(
      (c) => c.importance === Importance.LOW
    ).length;
    const inProgress = systemComplaints.filter(
      (c) => c.status === ComplaintStatus.IN_PROGRESS
    ).length;

    return {
      total: systemComplaints.length,
      completed: resolved,
      pending,
      inProgress,
      highImportance,
      mediumImportance,
      lowImportance,
      resolutionRate:
        systemComplaints.length > 0
          ? Math.round((resolved / systemComplaints.length) * 100)
          : 0,
    };
  }, [systemComplaints]);

  const statusData = React.useMemo(
    () => [
      {
        name: "محلولة",
        nameEn: "Resolved",
        value: systemStats.completed,
        color: "#10b981",
        gradient: "from-green-400 to-green-600",
      },
      {
        name: "معلقة",
        nameEn: "Pending",
        value: systemStats.pending,
        color: "#f59e0b",
        gradient: "from-yellow-400 to-yellow-600",
      },
    ],
    [systemStats]
  );

  const handleCreateUser = async (role: Role) => {
    setUserFormData((prev) => ({ ...prev, role }));
    setShowCreateUserModal(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const newUser = await api.createUser(userFormData);

      // Add to local state for UI updates
      if (userFormData.role === Role.MUKTAR) {
        setMuktars((prev) => [...prev, newUser]);
      } else if (userFormData.role === Role.ADMIN) {
        setAdmins((prev) => [...prev, newUser]);
      }

      setShowCreateUserModal(false);
      setUserFormData({
        name: "",
        email: "",
        password: "",
        role: Role.MUKTAR,
        district: "District 1",
      });
      // Show success message
      alert(`${userFormData.role} created successfully!`);
    } catch (error) {
      console.error("Failed to create user:", error);
      // For development/demo purposes, create a mock user if backend fails
      const mockUser: User = {
        id: `mock-${Date.now()}`,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        district: userFormData.district,
        joinedAt: new Date().toISOString().split("T")[0],
      };

      // Add to local state for demo purposes
      if (userFormData.role === Role.MUKTAR) {
        setMuktars((prev) => [...prev, mockUser]);
      } else if (userFormData.role === Role.ADMIN) {
        setAdmins((prev) => [...prev, mockUser]);
      }

      setShowCreateUserModal(false);
      setUserFormData({
        name: "",
        email: "",
        password: "",
        role: Role.MUKTAR,
        district: "District 1",
      });

      alert(`${userFormData.role} created successfully (Demo Mode)!`);
    } finally {
      setCreatingUser(false);
    }
  };

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
        setSystemComplaints((prev) =>
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
        setSystemComplaints((prev) =>
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

  // Wrap with access control
  return (
    <DashboardAccessControl dashboardType="manager">
      <StandardizedDashboardLayout
        title={t("nav.manager_dashboard")}
        subtitle={`${t("dashboard.welcome_back")}${user?.name}. ${t(
          "dashboard.oversee_operations"
        )}`}
        stats={systemStats}
        userRole={Role.MANAGER}
        showContentManagement={true}
      >
        {/* Enhanced System Chart */}
        <div className="card bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 shadow-2xl border border-gray-200 dark:border-gray-700"></div>

        {/* Recent Complaints Table */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo mb-2">
              Manager's High Priority Complaints
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High priority complaints requiring manager attention
              {isUsingDemoData && (
                <span className="ml-2 badge badge-warning badge-sm">
                  Demo Data
                </span>
              )}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
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
        </div>

        {/* Charts Section - Part 5 Requirements */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo mb-2">
              Analytics & Charts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time complaints data visualization
              {isUsingDemoData && (
                <span className="ml-2 badge badge-warning badge-sm">
                  Demo Data
                </span>
              )}
            </p>
          </div>
          <ComplaintsCharts
            complaints={filteredData}
            showManagerCharts={true}
            autoRefresh={true}
            refreshInterval={30000}
            showTimelineChart={false}
          />
        </div>

        {/* User Management Section */}
        <div className="card bg-gradient-to-r from-brand-lightBg to-white dark:from-[#1a1a1a] dark:to-[#2a2a2a] shadow-xl">
          <div className="card-body">
            <h2 className="card-title font-cairo text-brand-primary mb-4">
              User Management
            </h2>

            {/* Top Actions */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="stats shadow w-full md:w-auto">
                <div className="stat place-items-center">
                  <div className="stat-title">Total Muktars</div>
                  <div className="stat-value">{muktars.length}</div>
                  <div className="stat-desc">Across 3 Districts</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">Total Admins</div>
                  <div className="stat-value">{admins.length}</div>
                  <div className="stat-desc">System Administrators</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">Avg Response</div>
                  <div className="stat-value text-secondary">2.5h</div>
                  <div className="stat-desc text-secondary">↗︎ 10% faster</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary text-white gap-2"
                  onClick={() => handleCreateUser(Role.MUKTAR)}
                >
                  <UserPlusIcon className="w-5 h-5" /> Create Muktar
                </button>
                <button
                  className="btn btn-neutral text-white gap-2"
                  onClick={() => handleCreateUser(Role.ADMIN)}
                >
                  <UserPlusIcon className="w-5 h-5" /> Create Admin
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Lists Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* List of Muktars */}
                <div className="card bg-base-100 shadow-xl h-fit">
                  <div className="card-body">
                    <h3 className="card-title flex items-center gap-2">
                      <UserGroupIcon className="w-6 h-6 text-brand-primary" />{" "}
                      Muktar List
                    </h3>
                    <div className="overflow-y-auto max-h-[300px]">
                      <ul className="menu bg-base-200 w-full rounded-box">
                        {muktars.map((m) => (
                          <li
                            key={m.id}
                            onClick={() => {
                              setSelectedMuktar(m);
                              setSelectedAdmin(null);
                            }}
                          >
                            <a
                              className={`flex justify-between ${
                                selectedMuktar?.id === m.id ? "active" : ""
                              }`}
                            >
                              <div>
                                <div className="font-bold">{m.name}</div>
                                <div className="text-xs opacity-70">
                                  {m.district}
                                </div>
                              </div>
                              <div className="badge badge-sm">Active</div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* List of Admins */}
                <div className="card bg-base-100 shadow-xl h-fit">
                  <div className="card-body">
                    <h3 className="card-title flex items-center gap-2">
                      <ShieldCheckIcon className="w-6 h-6 text-brand-primary" />{" "}
                      Admin List
                    </h3>
                    <div className="overflow-y-auto max-h-[300px]">
                      <ul className="menu bg-base-200 w-full rounded-box">
                        {admins.map((a) => (
                          <li
                            key={a.id}
                            onClick={() => {
                              setSelectedAdmin(a);
                              setSelectedMuktar(null);
                            }}
                          >
                            <a
                              className={`flex justify-between ${
                                selectedAdmin?.id === a.id ? "active" : ""
                              }`}
                            >
                              <div>
                                <div className="font-bold">{a.name}</div>
                                <div className="text-xs opacity-70">
                                  {a.email}
                                </div>
                              </div>
                              <div className="badge badge-sm">Active</div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail View */}
              <div className="lg:col-span-2 space-y-6">
                {selectedMuktar || selectedAdmin ? (
                  <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 font-cairo">
                      {selectedMuktar ? "Performance:" : "Admin Details:"}{" "}
                      <span className="text-brand-accent">
                        {selectedMuktar
                          ? selectedMuktar.name
                          : selectedAdmin?.name}
                      </span>
                    </h3>

                    {selectedMuktar ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="card bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-4 shadow-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                              <ChartBarIcon className="w-5 h-5" />
                              Resolution Trend
                            </h4>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={performanceData}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="resolvedGradient"
                                      x1="0"
                                      y1="0"
                                      x2="1"
                                      y2="0"
                                    >
                                      <stop
                                        offset="0%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#1d4ed8"
                                        stopOpacity={0.6}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                    opacity={0.3}
                                  />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    axisLine={{ stroke: "#d1d5db" }}
                                  />
                                  <YAxis
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
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
                                            <p className="text-sm text-blue-600">
                                              Resolved:{" "}
                                              <span className="font-bold">
                                                {payload[0].value}
                                              </span>
                                            </p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="resolved"
                                    stroke="url(#resolvedGradient)"
                                    strokeWidth={4}
                                    dot={{
                                      fill: "#3b82f6",
                                      strokeWidth: 2,
                                      r: 6,
                                    }}
                                    activeDot={{
                                      r: 8,
                                      stroke: "#3b82f6",
                                      strokeWidth: 2,
                                      fill: "#ffffff",
                                    }}
                                    animationDuration={1500}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div className="card bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 p-4 shadow-xl border border-orange-200 dark:border-orange-800">
                            <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                              <ExclamationTriangleIcon className="w-5 h-5" />
                              Workload
                            </h4>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={performanceData}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="pendingGradient"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="0%"
                                        stopColor="#f59e0b"
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#d97706"
                                        stopOpacity={0.6}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                    opacity={0.3}
                                  />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    axisLine={{ stroke: "#d1d5db" }}
                                  />
                                  <YAxis
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
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
                                            <p className="text-sm text-orange-600">
                                              Pending:{" "}
                                              <span className="font-bold">
                                                {payload[0].value}
                                              </span>
                                            </p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar
                                    dataKey="pending"
                                    fill="url(#pendingGradient)"
                                    radius={[4, 4, 0, 0]}
                                    animationBegin={300}
                                    animationDuration={1200}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        <div className="alert alert-info bg-brand-lightBg border-brand-primary">
                          <ChartBarIcon className="w-6 h-6" />
                          <span>
                            This muktar has resolved 85% of assigned complaints
                            this month.
                          </span>
                        </div>
                      </>
                    ) : selectedAdmin ? (
                      <div className="space-y-6">
                        <div className="card bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 shadow-xl border border-green-200 dark:border-green-800">
                          <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5" />
                            Administrator Information
                          </h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                Full Name:
                              </span>
                              <span className="font-bold">
                                {selectedAdmin.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                Email:
                              </span>
                              <span className="font-bold">
                                {selectedAdmin.email}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                Role:
                              </span>
                              <span className="font-bold badge badge-primary">
                                {selectedAdmin.role}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                Joined:
                              </span>
                              <span className="font-bold">
                                {selectedAdmin.joinedAt || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="alert alert-success bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <ShieldCheckIcon className="w-6 h-6" />
                          <span>
                            This administrator oversees system operations and
                            user management.
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px] bg-base-100 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-400">
                      Select a Muktar or Admin to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
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

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Create New {userFormData.role}
            </h3>
            <form onSubmit={handleSubmitUser}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={userFormData.name}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={userFormData.password}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>
              {userFormData.role === Role.MUKTAR && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">District</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={userFormData.district}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                  >
                    <option value="District 1">District 1</option>
                    <option value="District 2">District 2</option>
                    <option value="District 3">District 3</option>
                  </select>
                </div>
              )}
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingUser}
                >
                  {creatingUser ? "Creating..." : `Create ${userFormData.role}`}
                </button>
              </div>
            </form>
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
