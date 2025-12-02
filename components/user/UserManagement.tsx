import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { User, Role } from "../../types";
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";
import { useAuthStore } from "../../store";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  neighborhood?: string;
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: Role.MUKTAR,
    neighborhood: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Note: These endpoints don't exist yet, so we'll show an error
      // In a real implementation, we'd call: const usersData = await api.getUsers();
      setError("User management endpoints not implemented in backend");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.createUser(formData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      alert("Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updates: any = {
        name: formData.name,
        email: formData.email,
        neighborhood: formData.neighborhood,
      };

      // Only managers can update passwords
      if (currentUser?.role === Role.MANAGER && formData.password) {
        updates.password = formData.password;
      }

      await api.updateUser(selectedUser.id, updates);
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await api.deactivateUser(userId);
      fetchUsers();
    } catch (err) {
      console.error("Failed to deactivate user:", err);
      alert("Failed to deactivate user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: Role.MUKTAR,
      neighborhood: "",
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      neighborhood: user.district || "",
    });
    setShowEditModal(true);
  };

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
        return <ShieldCheckIcon className="w-4 h-4" />;
      case Role.ADMIN:
        return <ShieldCheckIcon className="w-4 h-4" />;
      case Role.MUKTAR:
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="card bg-base-100 shadow-xl border border-red-200">
          <div className="card-body text-center py-16">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="card-title text-xl text-red-600 mb-2">
              User Management Unavailable
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-white/80">
                Manage system users, roles, and permissions
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{users.length}</div>
              <div className="text-sm opacity-90">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Users</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gradient-to-r from-brand-primary to-brand-accent text-white">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No Users Found
                      </h3>
                      <p className="text-gray-500">
                        Start by adding your first user.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-brand-lightBg/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                              <UserIcon className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${getRoleBadgeClass(
                            user.role
                          )} gap-1`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.district || "-"}</td>
                      <td className="px-6 py-4">
                        {user.joinedAt
                          ? new Date(user.joinedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/user/${user.id}`)}
                            className="btn btn-sm btn-ghost"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-sm btn-ghost"
                            title="Edit User"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className="btn btn-sm btn-warning"
                            title="Deactivate User"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                          {currentUser?.role === Role.MANAGER && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn btn-sm btn-error"
                              title="Delete User"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as Role })
                  }
                >
                  <option value={Role.MUKTAR}>Mukhtar</option>
                  <option value={Role.ADMIN}>Admin</option>
                  {currentUser?.role === Role.MANAGER && (
                    <option value={Role.MANAGER}>Manager</option>
                  )}
                </select>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">District/Neighborhood</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="btn"
              >
                Cancel
              </button>
              <button onClick={handleCreateUser} className="btn btn-primary">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {currentUser?.role === Role.MANAGER && (
                <div>
                  <label className="label">
                    <span className="label-text">
                      New Password (leave empty to keep current)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label className="label">
                  <span className="label-text">District/Neighborhood</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                className="btn"
              >
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="btn btn-primary">
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
