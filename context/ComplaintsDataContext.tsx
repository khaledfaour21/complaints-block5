import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Complaint, Role } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../store';

interface ComplaintsDataContextType {
  complaints: Complaint[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  getComplaintsByRole: (role: Role) => Complaint[];
}

const ComplaintsDataContext = createContext<ComplaintsDataContextType | undefined>(undefined);

export const ComplaintsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadComplaints = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await api.getComplaints(user.role);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadComplaints();
  }, [loadComplaints]);

  // Add new complaint
  const addComplaint = useCallback((newComplaint: Complaint) => {
    setComplaints(prev => [...prev, newComplaint]);
    
    // Trigger real-time updates for all connected components
    window.dispatchEvent(new CustomEvent('complaintAdded', { 
      detail: newComplaint 
    }));
  }, []);

  // Update existing complaint
  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id 
        ? { ...complaint, ...updates, updatedAt: new Date().toISOString() }
        : complaint
    ));

    // Trigger real-time updates for all connected components
    window.dispatchEvent(new CustomEvent('complaintUpdated', { 
      detail: { id, updates } 
    }));
  }, []);

  // Delete complaint
  const deleteComplaint = useCallback((id: string) => {
    setComplaints(prev => prev.filter(complaint => complaint.id !== id));
    
    // Trigger real-time updates for all connected components
    window.dispatchEvent(new CustomEvent('complaintDeleted', { 
      detail: id 
    }));
  }, []);

  // Get complaints filtered by role
  const getComplaintsByRole = useCallback((role: Role): Complaint[] => {
    let filtered = [...complaints];

    if (role === Role.MUKTAR) {
      // Mukhtar only sees LOW importance complaints
      filtered = filtered.filter(c => c.importance === 'Low Importance');
    } else if (role === Role.ADMIN) {
      // Admin sees MEDIUM + LOW importance complaints
      filtered = filtered.filter(c => 
        c.importance === 'Medium Importance' || c.importance === 'Low Importance'
      );
    }
    // Manager sees all data (no additional filtering)

    return filtered;
  }, [complaints]);

  const contextValue: ComplaintsDataContextType = {
    complaints: getComplaintsByRole(user?.role || Role.CITIZEN),
    loading,
    refreshData,
    addComplaint,
    updateComplaint,
    deleteComplaint,
    getComplaintsByRole,
  };

  return (
    <ComplaintsDataContext.Provider value={contextValue}>
      {children}
    </ComplaintsDataContext.Provider>
  );
};

export const useComplaintsData = (): ComplaintsDataContextType => {
  const context = useContext(ComplaintsDataContext);
  if (!context) {
    throw new Error('useComplaintsData must be used within a ComplaintsDataProvider');
  }
  return context;
};

// Real-time updates hook for components
export const useComplaintsUpdates = () => {
  const { refreshData } = useComplaintsData();
  
  useEffect(() => {
    const handleComplaintAdded = (event: CustomEvent) => {
      console.log('Real-time update: Complaint added', event.detail);
      refreshData(); // Refresh data when complaint is added
    };

    const handleComplaintUpdated = (event: CustomEvent) => {
      console.log('Real-time update: Complaint updated', event.detail);
      refreshData(); // Refresh data when complaint is updated
    };

    const handleComplaintDeleted = (event: CustomEvent) => {
      console.log('Real-time update: Complaint deleted', event.detail);
      refreshData(); // Refresh data when complaint is deleted
    };

    // Add event listeners
    window.addEventListener('complaintAdded', handleComplaintAdded as EventListener);
    window.addEventListener('complaintUpdated', handleComplaintUpdated as EventListener);
    window.addEventListener('complaintDeleted', handleComplaintDeleted as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('complaintAdded', handleComplaintAdded as EventListener);
      window.removeEventListener('complaintUpdated', handleComplaintUpdated as EventListener);
      window.removeEventListener('complaintDeleted', handleComplaintDeleted as EventListener);
    };
  }, [refreshData]);
};