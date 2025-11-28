import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint, Role, User } from '../../types';
import { EnhancedComplaintTable } from '../shared/EnhancedComplaintTable';
import { useAuthStore } from '../../store';

interface EnhancedComplaintsViewProps {
  userRole?: Role;
  showAssignedRole?: boolean;
  title?: string;
  className?: string;
}

export const EnhancedComplaintsView: React.FC<EnhancedComplaintsViewProps> = ({
  userRole = Role.MANAGER,
  showAssignedRole = true,
  title = "Complaints Management",
  className = ""
}) => {
  const { user: currentUser } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const fetchedComplaints = await api.getComplaints(userRole);
        setComplaints(fetchedComplaints);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userRole]);

  const handleUpdateComplaint = (id: string, updates: Partial<Complaint>) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id ? { ...complaint, ...updates } : complaint
    ));
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(complaint => complaint.id !== id));
  };

  const handleViewDetails = (complaint: Complaint) => {
    // You can implement a modal or navigate to a detail page here
    console.log('View complaint details:', complaint);
    alert(`Viewing details for: ${complaint.title}`);
  };

  // Determine view type based on user role
  const isManagerView = currentUser?.role === Role.MANAGER;
  const isAdminView = currentUser?.role === Role.ADMIN;
  const isMuktarView = currentUser?.role === Role.MUKTAR;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg text-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title text-2xl font-bold">{title}</h2>
              <p className="opacity-90">
                Manage and track complaint status with enhanced visual controls
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{complaints.length}</div>
              <div className="text-sm opacity-90">Total Complaints</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Complaint Table */}
      <EnhancedComplaintTable
        complaints={complaints}
        onUpdateComplaint={handleUpdateComplaint}
        onDeleteComplaint={handleDeleteComplaint}
        onViewDetails={handleViewDetails}
        showAssignedRole={showAssignedRole}
        isManagerView={isManagerView}
        isAdminView={isAdminView}
        isMuktarView={isMuktarView}
        currentUser={currentUser}
      />

      {/* Legend */}
      <div className="card bg-base-100 shadow-lg border border-gray-200">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">Visual Guide</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Importance Colors */}
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">Importance Levels</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ff4d4d' }}></div>
                  <span className="text-sm">High Importance (Red)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ff9933' }}></div>
                  <span className="text-sm">Medium Importance (Orange)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#32cd32' }}></div>
                  <span className="text-sm">Low Importance (Green)</span>
                </div>
              </div>
            </div>

            {/* Status Colors */}
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">Status Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#808080' }}></div>
                  <span className="text-sm">Pending (Gray)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1e90ff' }}></div>
                  <span className="text-sm">Under Review (Blue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ffd700' }}></div>
                  <span className="text-sm">In Progress (Yellow)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#32cd32' }}></div>
                  <span className="text-sm">Completed (Green)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <span className="text-sm">Closed (Black)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-6 p-4 bg-brand-lightBg rounded-lg">
            <h4 className="font-semibold mb-2 text-brand-primary">Table Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Large, bold importance and status badges</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Pinned complaints appear at the top</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Inline editing for importance and status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Responsive design for all screen sizes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Sorting and filtering capabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Clear action buttons for management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export variants for different user roles
export const ManagerComplaintsView = () => (
  <EnhancedComplaintsView 
    userRole={Role.MANAGER} 
    showAssignedRole={true}
    title="Manager Complaints Dashboard"
  />
);

export const AdminComplaintsView = () => (
  <EnhancedComplaintsView 
    userRole={Role.ADMIN} 
    showAssignedRole={true}
    title="Admin Complaints Overview"
  />
);

export const MuktarComplaintsView = () => (
  <EnhancedComplaintsView 
    userRole={Role.MUKTAR} 
    showAssignedRole={false}
    title="My Assigned Complaints"
  />
);