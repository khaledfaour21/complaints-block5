import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Complaint, Role, ComplaintStatus, Importance } from "../../types";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "./LoadingStates";
import { ImportanceBadge } from "./ImportanceBadge";
import { StatusBadge } from "./StatusBadge";
import { useAuthStore } from "../../store";

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [solutionInfo, setSolutionInfo] = useState("");
  const [refusalReason, setRefusalReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await api.getComplaintById(id);
        setComplaint(data);
      } catch (err) {
        console.error("Failed to fetch complaint:", err);
        setError("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-8 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>

        <div className="card bg-base-100 shadow-xl border border-red-200">
          <div className="card-body text-center py-16">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="card-title text-xl text-red-600 mb-2">
              Complaint Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The complaint you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.COMPLETED:
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case ComplaintStatus.CLOSED:
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case ComplaintStatus.IN_PROGRESS:
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    }
  };

  const handleAcceptComplaint = async () => {
    if (!complaint || !solutionInfo.trim()) return;

    try {
      setActionLoading(true);
      const updatedComplaint = await api.acceptComplaint(
        complaint.id,
        solutionInfo
      );
      setComplaint(mapBackendComplaintToFrontend(updatedComplaint));
      setShowAcceptModal(false);
      setSolutionInfo("");
    } catch (err) {
      console.error("Failed to accept complaint:", err);
      alert("Failed to accept complaint");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuseComplaint = async () => {
    if (!complaint || !refusalReason.trim()) return;

    try {
      setActionLoading(true);
      const updatedComplaint = await api.refuseComplaint(
        complaint.id,
        refusalReason
      );
      setComplaint(mapBackendComplaintToFrontend(updatedComplaint));
      setShowRefuseModal(false);
      setRefusalReason("");
    } catch (err) {
      console.error("Failed to refuse complaint:", err);
      alert("Failed to refuse complaint");
    } finally {
      setActionLoading(false);
    }
  };

  const canManageComplaint = () => {
    if (!currentUser || !complaint) return false;

    // Manager can manage all complaints
    if (currentUser.role === Role.MANAGER) return true;

    // Admin can manage mid priority complaints
    if (
      currentUser.role === Role.ADMIN &&
      complaint.importance === "Medium Importance"
    )
      return true;

    // Mukhtar can manage low priority complaints in their neighborhood
    if (
      currentUser.role === Role.MUKTAR &&
      complaint.importance === "Low Importance" &&
      complaint.district === currentUser.district
    )
      return true;

    return false;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
      >
        <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
      </button>

      {/* Complaint Header */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(complaint.status)}
                <span className="badge badge-white/20 text-white">
                  {complaint.trackingNumber}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-4">{complaint.title}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <ImportanceBadge importance={complaint.importance} size="sm" />
                <StatusBadge status={complaint.status} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Complaint Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>

          {/* Citizen Help/Solution */}
          {complaint.citizenHelp && (
            <div className="card bg-blue-50 border-blue-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 text-blue-800">
                  Suggested Solution
                </h2>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <p className="text-blue-900 leading-relaxed whitespace-pre-line">
                    {complaint.citizenHelp}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Response */}
          {(complaint.solutionInfo || complaint.refusalReason) && (
            <div
              className={`card shadow-xl ${
                complaint.solutionInfo
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="card-body">
                <h2
                  className={`card-title text-xl mb-4 ${
                    complaint.solutionInfo ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {complaint.solutionInfo
                    ? "Official Solution"
                    : "Refusal Reason"}
                </h2>
                <div
                  className={`bg-white p-4 rounded-lg border ${
                    complaint.solutionInfo
                      ? "border-green-100"
                      : "border-red-100"
                  }`}
                >
                  <p
                    className={`leading-relaxed whitespace-pre-line ${
                      complaint.solutionInfo ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {complaint.solutionInfo || complaint.refusalReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {complaint.notes && (
            <div className="card bg-yellow-50 border-yellow-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 text-yellow-800">
                  Internal Notes
                </h2>
                <div className="bg-white p-4 rounded-lg border border-yellow-100">
                  <p className="text-yellow-900 leading-relaxed whitespace-pre-line">
                    {complaint.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Attachments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment, index) => (
                    <div key={index} className="card bg-base-200">
                      <div className="card-body p-4">
                        <p className="text-sm font-medium truncate">
                          Attachment {index + 1}
                        </p>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => window.open(attachment, "_blank")}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Complaint Info */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Complaint Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Submitter
                    </p>
                    <p className="font-medium">{complaint.submitterName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Phone
                    </p>
                    <p className="font-medium font-mono">
                      {complaint.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Location
                    </p>
                    <p className="font-medium">{complaint.location}</p>
                    <p className="text-sm text-gray-600">
                      {complaint.district}
                    </p>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Category
                    </p>
                    <p className="font-medium">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Priority
                    </p>
                    <ImportanceBadge
                      importance={complaint.importance}
                      size="sm"
                    />
                  </div>
                </div>

                {complaint.estimatedReviewTime && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Est. Review Time
                    </p>
                    <p className="font-medium">
                      {complaint.estimatedReviewTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-xs text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {complaint.status !== ComplaintStatus.PENDING && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        complaint.status === ComplaintStatus.COMPLETED
                          ? "bg-green-500"
                          : complaint.status === ComplaintStatus.CLOSED
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {complaint.status.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500">Current status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Actions</h3>
              <div className="space-y-2">
                {complaint.status === ComplaintStatus.PENDING &&
                  canManageComplaint() && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAcceptModal(true)}
                        className="btn btn-success btn-sm flex-1 gap-2"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => setShowRefuseModal(true)}
                        className="btn btn-error btn-sm flex-1 gap-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Refuse
                      </button>
                    </div>
                  )}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-outline btn-block"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-ghost btn-block"
                >
                  Print Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Complaint Modal */}
      {showAcceptModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              Accept Complaint
            </h3>
            <p className="text-gray-600 mb-4">
              Provide a solution for this complaint. This will change the status
              to "Completed".
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Solution Information *
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="Describe the solution or action taken to resolve this complaint..."
                value={solutionInfo}
                onChange={(e) => setSolutionInfo(e.target.value)}
                required
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSolutionInfo("");
                }}
                className="btn"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptComplaint}
                className="btn btn-success"
                disabled={!solutionInfo.trim() || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Accept Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refuse Complaint Modal */}
      {showRefuseModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <XCircleIcon className="w-6 h-6 text-red-500" />
              Refuse Complaint
            </h3>
            <p className="text-gray-600 mb-4">
              Provide a reason for refusing this complaint. This will change the
              status to "Closed".
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Refusal Reason *</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="Explain why this complaint cannot be accepted..."
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                required
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowRefuseModal(false);
                  setRefusalReason("");
                }}
                className="btn"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRefuseComplaint}
                className="btn btn-error"
                disabled={!refusalReason.trim() || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Refusing...
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-4 h-4" />
                    Refuse Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
function mapBackendComplaintToFrontend(updatedComplaint: Complaint): React.SetStateAction<Complaint> {
  throw new Error("Function not implemented.");
}

