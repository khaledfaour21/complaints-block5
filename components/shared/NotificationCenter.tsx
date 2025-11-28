import React, { useState, useEffect } from 'react';
import { useAuthStore, useToastStore } from '../../store';
import { Role } from '../../types';
import {
  BellIcon, XMarkIcon, ExclamationTriangleIcon,
  CheckCircleIcon, InformationCircleIcon, ClockIcon,
  PlusIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { toasts } = useToastStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type']
  });

  // Mock notifications - in real app, this would come from an API
  useEffect(() => {
    if (user) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New High Priority Complaint',
          message: 'A new high priority complaint has been submitted in your district.',
          type: 'warning',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false
        },
        {
          id: '2',
          title: 'System Update Complete',
          message: 'The system has been successfully updated with new features.',
          type: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        },
        {
          id: '3',
          title: 'Weekly Report Ready',
          message: 'Your weekly performance report is now available for review.',
          type: 'info',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true
        }
      ];

      // Filter notifications based on user role
      const roleSpecificNotifications = mockNotifications.filter(notification => {
        if (user.role === Role.MUKTAR) {
          return notification.type === 'warning' || notification.type === 'info';
        } else if (user.role === Role.ADMIN) {
          return true; // Admin sees all notifications
        } else if (user.role === Role.MANAGER) {
          return true; // Manager sees all notifications
        }
        return false;
      });

      setNotifications(roleSpecificNotifications);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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

  // Don't show notification center for citizens
  if (!user || user.role === Role.CITIZEN) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle relative"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 badge badge-xs badge-error rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 bg-base-100 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  {(user?.role === Role.ADMIN || user?.role === Role.MANAGER) && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn btn-xs btn-primary"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Add
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="btn btn-xs btn-ghost"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {(user?.role === Role.ADMIN || user?.role === Role.MANAGER) && (
                                <>
                                  <button
                                    onClick={() => startEdit(notification)}
                                    className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100"
                                  >
                                    <PencilIcon className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 text-red-500"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-ghost btn-sm w-full">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Notification Modal */}
      {showAddModal && (user?.role === Role.ADMIN || user?.role === Role.MANAGER) && (
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
    </div>
  );
};