import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { User, Complaint } from "../../types";
import {
  ArrowLeftIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";
import { EnhancedComplaintTable } from "../shared/EnhancedComplaintTable";

export const UserComplaints: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserComplaints = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [userData, complaintsData] = await Promise.all([
          api.getUserById(id),
          api.getUserComplaints(id),
        ]);
        setUser(userData);
        setComplaints(complaintsData);
      } catch (err) {
        console.error("Failed to fetch user complaints:", err);
        setError("Failed to load user complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchUserComplaints();
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

  if (error || !user) {
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
              User Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The user you're looking for doesn't exist or has been removed."}
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

  const handleUpdateComplaint = (
    complaintId: string,
    updates: Partial<Complaint>
  ) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === complaintId ? { ...complaint, ...updates } : complaint
      )
    );
  };

  const handleDeleteComplaint = (complaintId: string) => {
    setComplaints((prev) =>
      prev.filter((complaint) => complaint.id !== complaintId)
    );
  };

  const handleViewDetails = (complaint: Complaint) => {
    navigate(`/complaint/${complaint.id}`);
  };

  // Calculate statistics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "Completed"
  ).length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === "Pending"
  ).length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;
  const closedComplaints = complaints.filter(
    (c) => c.status === "Closed"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
      >
        <ArrowLeftIcon className="w-5 h-5" /> Back
      </button>

      {/* User Header */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <UserIcon className="w-8 h-8" />
                <span className="badge badge-white/20 text-white">
                  {user.role}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {user.name}'s Complaints
              </h1>
              <p className="text-white/80 mb-4">
                All complaints assigned to and handled by {user.name}
              </p>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>{totalComplaints} Total Complaints</span>
                </div>
                {user.district && (
                  <div className="flex items-center gap-2">
                    <span>District: {user.district}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <ChartBarIcon className="w-8 h-8 text-brand-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-primary">
              {totalComplaints}
            </div>
            <div className="text-sm text-gray-600">Total Complaints</div>
          </div>
        </div>

        <div className="card bg-green-50 shadow-xl border-green-200">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {resolvedComplaints}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
            <div className="text-xs text-green-500">
              {totalComplaints > 0
                ? Math.round((resolvedComplaints / totalComplaints) * 100)
                : 0}
              % success rate
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 shadow-xl border-blue-200">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600">
              {inProgressComplaints}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>

        <div className="card bg-red-50 shadow-xl border-red-200">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-red-600">
              {closedComplaints}
            </div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Complaints History</h2>

          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Complaints Found
              </h3>
              <p className="text-gray-500">
                {user.name} hasn't been assigned any complaints yet.
              </p>
            </div>
          ) : (
            <EnhancedComplaintTable
              complaints={complaints}
              onUpdateComplaint={handleUpdateComplaint}
              onDeleteComplaint={handleDeleteComplaint}
              onViewDetails={handleViewDetails}
              showAssignedRole={false}
              isManagerView={false}
              isAdminView={false}
              isMuktarView={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};
