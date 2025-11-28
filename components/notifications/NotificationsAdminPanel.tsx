import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { Role } from '../../types';
import {
  BellIcon, PlusIcon, PencilIcon, TrashIcon,
  ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { DashboardAccessControl } from '../shared/AccessControl';
import { StandardizedDashboardLayout } from '../shared/StandardizedDashboardLayout';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NotificationsAdminPanel: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type']
  });

  // Mock notifications - in real app, this would come from an API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New High Priority Complaint',
        message: 'A new high priority complaint has been submitted in your district.',
        type: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: 'System Update Complete',
        message: 'The system has been successfully updated with new features.',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        title: 'Weekly Report Ready',
        message: 'Your weekly performance report is now available for review.',
        type: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const addNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationForm({ title: '', message: '', type: 'info' });
    setShowAddModal(false);
  };

  const editNotification = () => {
    if (editingNotification) {
      setNotifications(prev => prev.map(n =>
        n.id === editingNotification.id
          ? { ...n, title: notificationForm.title, message: notificationForm.message, type: notificationForm.type }
          : n
      ));
      setEditingNotification(null);
      setNotificationForm({ title: '', message: '', type: 'info' });
      setShowAddModal(false);
    }
  };

  const startEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type
    });
    setShowAddModal(true);
  };

  const cancelEdit = () => {
    setEditingNotification(null);
    setNotificationForm({ title: '', message: '', type: 'info' });
    setShowAddModal(false);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DashboardAccessControl dashboardType="admin">
      <StandardizedDashboardLayout
        title="Notifications Management"
        subtitle="Manage system notifications for all users"
        stats={{
          total: notifications.length,
          completed: notifications.filter(n => n.read).length,
          pending: notifications.filter(n => !n.read).length,
          inProgress: 0,
          highImportance: notifications.filter(n => n.type === 'warning' || n.type === 'error').length,
          mediumImportance: notifications.filter(n => n.type === 'success').length,
          lowImportance: notifications.filter(n => n.type === 'info').length
        }}
        userRole={Role.ADMIN}
        showContentManagement={false}
      >
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">All Notifications</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Notification
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <span className="capitalize">{notification.type}</span>
                        </div>
                      </td>
                      <td className="font-medium">{notification.title}</td>
                      <td className="max-w-xs truncate">{notification.message}</td>
                      <td>
                        <div className={`badge ${notification.read ? 'badge-success' : 'badge-warning'}`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(notification)}
                            className="btn btn-xs btn-ghost"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="btn btn-xs btn-ghost text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Notification Modal */}
        {showAddModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {editingNotification ? 'Edit Notification' : 'Add New Notification'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                editingNotification ? editNotification() : addNotification();
              }}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as Notification['type'] }))}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {editingNotification ? 'Update' : 'Add'} Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </StandardizedDashboardLayout>
    </DashboardAccessControl>
  );
};