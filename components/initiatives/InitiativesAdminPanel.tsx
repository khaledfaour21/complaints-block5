import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { api } from "../../services/api";
import { Initiative, InitiativeStatus, Role } from "../../types";
import { useAuthStore, useLangStore } from "../../store";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export const InitiativesAdminPanel: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(
    null
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadInitiatives();
  }, []);

  const loadInitiatives = async () => {
    try {
      const data = await api.getInitiatives();
      setInitiatives(data);
    } catch (error) {
      console.error("Failed to load initiatives:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveInitiative(id);
      setInitiatives((prev) =>
        prev.map((initiative) =>
          initiative.id === id
            ? {
                ...initiative,
                status: InitiativeStatus.APPROVED,
                approvedBy: user?.name,
                approvedAt: new Date().toISOString(),
              }
            : initiative
        )
      );
    } catch (error) {
      console.error("Failed to approve initiative:", error);
    }
  };

  const handleReject = async () => {
    if (!editingInitiative) return;

    try {
      await api.rejectInitiative(editingInitiative.id, rejectReason);
      setInitiatives((prev) =>
        prev.map((initiative) =>
          initiative.id === editingInitiative.id
            ? {
                ...initiative,
                status: InitiativeStatus.REJECTED,
                rejectionReason: rejectReason,
              }
            : initiative
        )
      );
      setShowRejectModal(false);
      setRejectReason("");
      setEditingInitiative(null);
    } catch (error) {
      console.error("Failed to reject initiative:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this initiative?"))
      return;

    try {
      await api.deleteInitiative(id);
      setInitiatives((prev) =>
        prev.filter((initiative) => initiative.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete initiative:", error);
    }
  };

  const handleEdit = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setShowEditModal(true);
  };

  const handleUpdate = async (updates: Partial<Initiative>) => {
    if (!editingInitiative) return;

    try {
      await api.updateInitiative(editingInitiative.id, updates);
      setInitiatives((prev) =>
        prev.map((initiative) =>
          initiative.id === editingInitiative.id
            ? { ...initiative, ...updates, updatedAt: new Date().toISOString() }
            : initiative
        )
      );
      setShowEditModal(false);
      setEditingInitiative(null);
    } catch (error) {
      console.error("Failed to update initiative:", error);
    }
  };

  const columnHelper = createColumnHelper<Initiative>();
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <div className="max-w-xs">
          <div className="font-bold text-sm">{info.getValue()}</div>
          <div className="text-xs text-gray-500 truncate">
            {info.row.original.description}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="badge badge-outline badge-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("district", { header: "District" }),
    columnHelper.accessor("submitterName", {
      header: "Submitter",
      cell: (info) => (
        <div className="text-sm">
          <div>{info.getValue()}</div>
          <div className="text-xs text-gray-500">
            {info.row.original.submitterEmail}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colorClass =
          status === InitiativeStatus.APPROVED
            ? "badge-success"
            : status === InitiativeStatus.REJECTED
            ? "badge-error"
            : "badge-warning";
        return <span className={`badge ${colorClass} badge-sm`}>{status}</span>;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const initiative = info.row.original;
        return (
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedAttachments(initiative.attachments)}
              className="btn btn-xs btn-ghost"
              title="View Attachments"
              disabled={initiative.attachments.length === 0}
            >
              <EyeIcon className="w-3 h-3" />
            </button>
            {initiative.status === InitiativeStatus.PENDING && (
              <>
                <button
                  onClick={() => handleApprove(initiative.id)}
                  className="btn btn-xs btn-success text-white"
                  title="Approve"
                >
                  <CheckIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setEditingInitiative(initiative);
                    setShowRejectModal(true);
                  }}
                  className="btn btn-xs btn-error text-white"
                  title="Reject"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              onClick={() => handleEdit(initiative)}
              className="btn btn-xs btn-warning text-white"
              title="Edit"
            >
              <PencilIcon className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDelete(initiative.id)}
              className="btn btn-xs btn-error text-white"
              title="Delete"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: initiatives,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <div className="text-center py-8">Loading initiatives...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-cairo text-brand-primary">
          Initiatives Management
        </h2>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total</div>
            <div className="stat-value text-lg">{initiatives.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-lg text-warning">
              {
                initiatives.filter((i) => i.status === InitiativeStatus.PENDING)
                  .length
              }
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Approved</div>
            <div className="stat-value text-lg text-success">
              {
                initiatives.filter(
                  (i) => i.status === InitiativeStatus.APPROVED
                ).length
              }
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <table className="table table-zebra w-full">
          <thead className="bg-brand-primary text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="uppercase text-xs font-bold">
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
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-400"
                >
                  No initiatives found.
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
            Showing {table.getRowModel().rows.length} of {initiatives.length}{" "}
            initiatives
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

      {/* Edit Modal */}
      {showEditModal && editingInitiative && (
        <EditInitiativeModal
          initiative={editingInitiative}
          onSave={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setEditingInitiative(null);
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && editingInitiative && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Reject Initiative</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Title:</strong> {editingInitiative.title}
              </p>
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Rejection Reason</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                required
                rows={4}
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setEditingInitiative(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject Initiative
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Modal Component
const EditInitiativeModal: React.FC<{
  initiative: Initiative;
  onSave: (updates: Partial<Initiative>) => void;
  onClose: () => void;
}> = ({ initiative, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: initiative.title,
    description: initiative.description,
    category: initiative.category,
    district: initiative.district,
    location: initiative.location,
    estimatedBudget: initiative.estimatedBudget || "",
    expectedImpact: initiative.expectedImpact || "",
    timeline: initiative.timeline || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Edit Initiative</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="environment">Environment</option>
                <option value="culture">Culture & Arts</option>
                <option value="sports">Sports & Recreation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">District</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.district}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, district: e.target.value }))
                }
              >
                <option value="Al Olaya">Al Olaya</option>
                <option value="Al Malaz">Al Malaz</option>
                <option value="Al Rawdah">Al Rawdah</option>
                <option value="Al Sulimaniyah">Al Sulimaniyah</option>
                <option value="Al Faisaliyah">Al Faisaliyah</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Estimated Budget</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.estimatedBudget}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedBudget: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Expected Impact</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.expectedImpact}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expectedImpact: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Timeline</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.timeline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, timeline: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
