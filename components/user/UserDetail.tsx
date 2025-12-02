import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { User, Role, Complaint } from "../../types";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userData = await api.getUserById(id);
        setUser(userData);

        // Fetch user's complaints if they are a mukhtar
        if (userData.role === Role.MUKTAR) {
          const complaints = await api.getUserComplaints(id);
          setUserComplaints(complaints);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case Role.MANAGER:
        return "badge-primary";
      case Role.ADMIN:
        return "badge-secondary";
      case Role.MUKTAR:
        return "badge-accent";
      default:
        return "badge-ghost";
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.MANAGER:
        return <ShieldCheckIcon className="w-5 h-5" />;
      case Role.ADMIN:
        return <ShieldCheckIcon className="w-5 h-5" />;
      case Role.MUKTAR:
        return <UserIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

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
                {getRoleIcon(user.role)}
                <span className={`badge badge-white/20 text-white gap-1`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{user.name}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>{user.email}</span>
                </div>
                {user.district && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{user.district}</span>
                  </div>
                )}
                {user.joinedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>
                      Joined {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Statistics (for Mukhtar) */}
          {user.role === Role.MUKTAR && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Performance Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">Total Complaints</div>
                    <div className="stat-value text-2xl text-brand-primary">
                      {userComplaints.length}
                    </div>
                    <div className="stat-desc">Assigned to handle</div>
                  </div>
                  <div className="stat bg-green-50 rounded-lg p-4">
                    <div className="stat-title">Resolved</div>
                    <div className="stat-value text-2xl text-green-600">
                      {
                        userComplaints.filter((c) => c.status === "Completed")
                          .length
                      }
                    </div>
                    <div className="stat-desc">Successfully resolved</div>
                  </div>
                  <div className="stat bg-blue-50 rounded-lg p-4">
                    <div className="stat-title">In Progress</div>
                    <div className="stat-value text-2xl text-blue-600">
                      {
                        userComplaints.filter((c) => c.status === "In Progress")
                          .length
                      }
                    </div>
                    <div className="stat-desc">Currently working on</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Complaints (for Mukhtar) */}
          {user.role === Role.MUKTAR && userComplaints.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  Recent Complaints
                </h2>
                <div className="space-y-3">
                  {userComplaints.slice(0, 5).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{complaint.title}</p>
                        <p className="text-xs text-gray-600">
                          {complaint.trackingNumber} • {complaint.district}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge badge-sm ${
                            complaint.status === "Completed"
                              ? "badge-success"
                              : complaint.status === "In Progress"
                              ? "badge-info"
                              : complaint.status === "Closed"
                              ? "badge-error"
                              : "badge-warning"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {userComplaints.length > 5 && (
                  <div className="text-center mt-4">
                    <button className="btn btn-outline btn-sm">
                      View All {userComplaints.length} Complaints
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">User Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Full Name
                    </p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Email
                    </p>
                    <p className="font-medium font-mono text-sm">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Role
                    </p>
                    <span
                      className={`badge ${getRoleBadgeClass(user.role)} gap-1`}
                    >
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </div>
                </div>

                {user.district && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        District
                      </p>
                      <p className="font-medium">{user.district}</p>
                    </div>
                  </div>
                )}

                {user.joinedAt && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Member Since
                      </p>
                      <p className="font-medium">
                        {new Date(user.joinedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
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
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-outline btn-block"
                >
                  Back to Dashboard
                </button>
                {user.role === Role.MUKTAR && (
                  <button
                    onClick={() => navigate(`/user/${user.id}/complaints`)}
                    className="btn btn-primary btn-block"
                  >
                    View All Complaints
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
