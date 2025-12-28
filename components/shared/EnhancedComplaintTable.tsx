import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  Complaint,
  Importance,
  ComplaintStatus,
  Role,
  User,
} from "../../types";
import { ImportanceBadge } from "./ImportanceBadge";
import { StatusBadge } from "./StatusBadge";
import { PinIcon } from "./PinIcon";
import { api } from "../../services/api";

interface EnhancedComplaintTableProps {
  complaints: Complaint[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
  onDeleteComplaint: (id: string) => void;
  onViewDetails?: (complaint: Complaint) => void;
  showAssignedRole?: boolean;
  isManagerView?: boolean;
  isAdminView?: boolean;
  isMuktarView?: boolean;
  currentUser?: User | null;
}

const columnHelper = createColumnHelper<Complaint>();

export const EnhancedComplaintTable: React.FC<EnhancedComplaintTableProps> = ({
  complaints,
  onUpdateComplaint,
  onDeleteComplaint,
  onViewDetails,
  showAssignedRole = true,
  isManagerView = false,
  isAdminView = false,
  isMuktarView = false,
  currentUser,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    trackingNumber: true,
    title: true,
    description: true,
    submissionDate: true,
    estimatedReviewTime: true,
    importance: true,
    status: true,
    assignedRole: true,
    working_on: true,
    actions: true,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  // Sort complaints to show pinned ones first
  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [complaints]);

  const handleUpdateImportance = async (
    complaintId: string,
    newImportance: Importance
  ) => {
    const priority =
      newImportance === Importance.HIGH
        ? "high"
        : newImportance === Importance.MEDIUM
        ? "mid"
        : "low";
    const estimatedReviewTime =
      newImportance === Importance.HIGH
        ? "1 day"
        : newImportance === Importance.MEDIUM
        ? "3 days"
        : "1 week";

    try {
      await api.updatePriority(complaintId, priority);
      onUpdateComplaint(complaintId, {
        importance: newImportance,
        estimatedReviewTime,
      });
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  const handleUpdateStatus = (
    complaintId: string,
    newStatus: ComplaintStatus
  ) => {
    api.updateComplaintStatus(complaintId, newStatus);
    onUpdateComplaint(complaintId, { status: newStatus });
  };

  const handleTogglePin = (complaintId: string, isPinned: boolean) => {
    api.updateComplaintPinned(complaintId, isPinned);
    onUpdateComplaint(complaintId, { pinned: isPinned });
  };

  const handleToggleWorkingOn = async (complaintId: string) => {
    try {
      const updatedComplaint = await api.toggleWorkingOn(complaintId);
      onUpdateComplaint(complaintId, {
        isWorkingOn: updatedComplaint.isWorkingOn,
        workingOnBy: updatedComplaint.workingOnBy,
      });
    } catch (error) {
      console.error("Failed to toggle working on status:", error);
    }
  };

  const handleDelete = (complaint: Complaint) => {
    const isManager = currentUser?.role === Role.MANAGER;
    const deleteType = isManager ? "permanently delete" : "soft delete";
    const deleteMessage = isManager
      ? "This action cannot be undone and will permanently remove the complaint from the system."
      : "This will mark the complaint as deleted but it can be recovered by administrators.";

    if (
      window.confirm(
        `Are you sure you want to ${deleteType} complaint "${complaint.title}"?\n\n${deleteMessage}`
      )
    ) {
      api.deleteComplaint(complaint.id, isManager);
      onDeleteComplaint(complaint.id);
    }
  };

  const getAssignedRoleText = (complaint: Complaint): string => {
    if (complaint.assignedManagerId) return "Manager";
    if (complaint.assignedAdminId) return "Admin";
    if (complaint.assignedMuktarId) return "Mukhtar";
    return "Unassigned";
  };

  const getAssignedRoleBadgeClass = (complaint: Complaint): string => {
    if (complaint.assignedManagerId) return "badge-primary";
    if (complaint.assignedAdminId) return "badge-secondary";
    if (complaint.assignedMuktarId) return "badge-accent";
    return "badge-ghost";
  };

  const columns = useMemo(
    () => [
      // Tracking Number with Pin
      columnHelper.accessor("trackingNumber", {
        header: "ID",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[100px]">
            <PinIcon isPinned={row.original.pinned} size="sm" />
            <span className="font-mono font-bold text-sm text-brand-primary">
              {row.original.trackingNumber}
            </span>
          </div>
        ),
        size: 120,
      }),

      // Title with Importance and Status
      columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
          <div className="space-y-2 min-w-[200px]">
            <span className="font-semibold text-sm leading-tight block">
              {row.original.title}
            </span>
            <div className="flex flex-wrap gap-1">
              <ImportanceBadge
                importance={row.original.importance}
                size="lg"
                className="transform scale-110"
              />
              <StatusBadge
                status={row.original.status}
                size="lg"
                className="transform scale-110"
              />
            </div>
          </div>
        ),
        size: 300,
      }),

      // Description with Location
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ row }) => (
          <div className="space-y-1 max-w-[200px]">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {row.original.description}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {row.original.location}
            </p>
          </div>
        ),
        size: 220,
      }),

      // Submission Date
      columnHelper.accessor("createdAt", {
        header: "Submission Date",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">
            {new Date(getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
        size: 140,
      }),

      // Estimated Review Time
      columnHelper.accessor("estimatedReviewTime", {
        header: "Review Time",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">{getValue() || "N/A"}</span>
        ),
        size: 120,
      }),

      // Category
      columnHelper.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => (
          <span className="badge badge-outline badge-sm">{getValue()}</span>
        ),
        size: 120,
      }),

      // District
      columnHelper.accessor("district", {
        header: "District",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">{getValue()}</span>
        ),
        size: 100,
      }),

      // Assigned Role (if enabled and user has permission)
      ...(showAssignedRole && (isManagerView || isAdminView)
        ? [
            columnHelper.accessor("assignedMuktarId", {
              header: "Assigned Role",
              cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                  <span
                    className={`badge ${getAssignedRoleBadgeClass(
                      row.original
                    )} badge-sm`}
                  >
                    {getAssignedRoleText(row.original)}
                  </span>
                  {row.original.phoneNumber && (
                    <span className="text-xs text-gray-500 font-mono">
                      {row.original.phoneNumber}
                    </span>
                  )}
                </div>
              ),
              size: 140,
            }),
          ]
        : []),

      // Edit Importance
      columnHelper.display({
        id: "edit_importance",
        header: "Edit Importance",
        cell: ({ row }) => (
          <div className="w-full">
            <select
              className="select select-bordered select-xs w-full"
              value={row.original.importance}
              onChange={(e) =>
                handleUpdateImportance(
                  row.original.id,
                  e.target.value as Importance
                )
              }
            >
              {Object.values(Importance).map((imp) => (
                <option key={imp} value={imp}>
                  {imp}
                </option>
              ))}
            </select>
          </div>
        ),
        size: 150,
      }),

      // Edit Status
      columnHelper.display({
        id: "edit_status",
        header: "Edit Status",
        cell: ({ row }) => (
          <div className="w-full">
            <select
              className="select select-bordered select-xs w-full"
              value={row.original.status}
              onChange={(e) =>
                handleUpdateStatus(
                  row.original.id,
                  e.target.value as ComplaintStatus
                )
              }
            >
              {Object.values(ComplaintStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ),
        size: 150,
      }),

      // Pin Toggle
      columnHelper.display({
        id: "pin_toggle",
        header: "Pin",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={row.original.pinned || false}
              onChange={(e) =>
                handleTogglePin(row.original.id, e.target.checked)
              }
            />
          </div>
        ),
        size: 80,
      }),

      // Working On Toggle (Admin only)
      ...(isAdminView
        ? [
            columnHelper.display({
              id: "working_on",
              header: "Working On",
              cell: ({ row }) => (
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleToggleWorkingOn(row.original.id)}
                    className={`btn btn-xs ${
                      row.original.isWorkingOn ? "btn-error" : "btn-success"
                    } text-white`}
                  >
                    {row.original.isWorkingOn
                      ? "Stop Working"
                      : "Start Working"}
                  </button>
                  {row.original.isWorkingOn && row.original.workingOnBy && (
                    <span className="text-xs text-gray-500 text-center">
                      {row.original.workingOnBy}
                    </span>
                  )}
                </div>
              ),
              size: 120,
            }),
          ]
        : []),

      // Actions
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(row.original)}
                className="btn btn-xs btn-ghost p-1"
                title="View Details"
              >
                <EyeIcon className="w-3 h-3" />
              </button>
            )}

            {(isManagerView || isAdminView || isMuktarView) && (
              <button
                onClick={() => handleDelete(row.original)}
                className="btn btn-xs btn-error text-white p-1"
                title={`${
                  currentUser?.role === Role.MANAGER
                    ? "Permanently Delete"
                    : "Soft Delete"
                } Complaint`}
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        ),
        size: 100,
      }),
    ],
    [
      showAssignedRole,
      isManagerView,
      isAdminView,
      onUpdateComplaint,
      onDeleteComplaint,
      onViewDetails,
    ]
  );

  const table = useReactTable({
    data: sortedComplaints,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-brand-primary" />
          <span className="text-sm font-medium">Filter & Sort</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search complaints..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input input-bordered input-sm w-full sm:w-64"
          />

          <select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("status")
                ?.setFilterValue(e.target.value || undefined)
            }
            className="select select-bordered select-sm"
          >
            <option value="">All Status</option>
            {Object.values(ComplaintStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={
              (table.getColumn("importance")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("importance")
                ?.setFilterValue(e.target.value || undefined)
            }
            className="select select-bordered select-sm"
          >
            <option value="">All Importance</option>
            {Object.values(Importance).map((importance) => (
              <option key={importance} value={importance}>
                {importance}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gradient-to-r from-brand-primary to-brand-accent text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="uppercase text-xs font-bold px-2 py-3 cursor-pointer hover:bg-white/10 transition-colors"
                        style={{ width: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ChevronUpIcon className="w-3 h-3" />,
                            desc: <ChevronDownIcon className="w-3 h-3" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-10 text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FunnelIcon className="w-8 h-8" />
                        <span>No complaints found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-brand-lightBg/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-2">
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Showing {table.getRowModel().rows.length} of {complaints.length}{" "}
              complaints
            </span>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {"<"}
              </button>
              <span className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <button
                className="btn btn-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {">"}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
