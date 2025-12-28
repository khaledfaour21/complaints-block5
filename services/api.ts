import {
  Complaint,
  ComplaintStatus,
  User,
  Role,
  Announcement,
  Achievement,
  MuktarStats,
  Importance,
} from "../types";
import {
  mockComplaints,
  mockMuktars,
  mockAdmins,
  mockManagers,
  mockAnnouncements,
  mockAchievements,
  getDemoComplaints,
} from "./mockData";

// Helper function to map API role strings to frontend Role enum
const mapApiRoleToFrontendRole = (apiRole: string): Role => {
  switch (apiRole.toLowerCase()) {
    case "manager":
      return Role.MANAGER;
    case "admin":
      return Role.ADMIN;
    case "mukhtar":
      return Role.MUKTAR;
    case "citizen":
    default:
      return Role.CITIZEN;
  }
};

// Helper function to map frontend Role enum to API role strings
const mapFrontendRoleToApiRole = (frontendRole: Role): string => {
  switch (frontendRole) {
    case Role.MANAGER:
      return "manager";
    case Role.ADMIN:
      return "admin";
    case Role.MUKTAR:
      return "mukhtar";
    case Role.CITIZEN:
    default:
      return "citizen";
  }
};

const API_BASE_URL = "http://localhost:5000/v1";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Don't try to refresh token if we're already on the login page
    if (window.location.pathname === "/login") {
      throw new Error("Authentication required");
    }

    // Token expired, try to refresh
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      localStorage.setItem("accessToken", accessToken);
      // Retry the original request with new token
      const newHeaders = getAuthHeaders();
      const retryResponse = await fetch(response.url, {
        ...response,
        headers: newHeaders,
      });
      return handleResponse(retryResponse);
    } else {
      // Refresh failed, clear user state and redirect to login
      localStorage.removeItem("accessToken");
      // Clear user from store if it exists
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
      throw new Error("Authentication failed");
    }
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: "include" as RequestCredentials,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

// Helper function to map backend complaint to frontend format
const mapBackendComplaintToFrontend = (backendComplaint: any): Complaint => {
  return {
    id: backendComplaint.id,
    trackingNumber: backendComplaint.trackingTag,
    district: backendComplaint.neighborhood,
    category: backendComplaint.complaint_type,
    importance:
      backendComplaint.priority === "high"
        ? Importance.HIGH
        : backendComplaint.priority === "mid"
        ? Importance.MEDIUM
        : Importance.LOW,
    title: backendComplaint.description.substring(0, 50) + "...", // Create a title from description
    description: backendComplaint.description,
    status:
      backendComplaint.complaint_status === "pending"
        ? ComplaintStatus.PENDING
        : backendComplaint.complaint_status === "accepted"
        ? ComplaintStatus.COMPLETED
        : backendComplaint.complaint_status === "refused"
        ? ComplaintStatus.CLOSED
        : ComplaintStatus.IN_PROGRESS,
    createdAt: backendComplaint.createdAt,
    phoneNumber: backendComplaint.contactNumber,
    attachments: [], // Backend doesn't have attachments in the response
    pinned: false, // Frontend specific
    submitterName: backendComplaint.submitterName,
    location: backendComplaint.location,
    citizenHelp: backendComplaint.suggestedSolution || "",
    solutionInfo: backendComplaint.solutionInfo,
    refusalReason: backendComplaint.refusalReason,
    notes: backendComplaint.notes,
    estimatedReviewTime: backendComplaint.estimatedReviewTime,
  };
};

// Helper function to map frontend complaint to backend format
const mapFrontendComplaintToBackend = (frontendComplaint: Complaint): any => {
  return {
    submitterName: frontendComplaint.submitterName,
    contactNumber: frontendComplaint.phoneNumber,
    description: frontendComplaint.description,
    location: frontendComplaint.location,
    neighborhood: frontendComplaint.district,
    complaint_type: frontendComplaint.category,
    priority:
      frontendComplaint.importance === Importance.HIGH
        ? "high"
        : frontendComplaint.importance === Importance.MEDIUM
        ? "mid"
        : "low",
    suggestedSolution: frontendComplaint.citizenHelp,
    notes: frontendComplaint.notes,
    estimatedReviewTime: frontendComplaint.estimatedReviewTime,
  };
};

export const api = {
  // Authentication methods
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: formData.toString(),
    });

    const data = await handleResponse(response);
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    // Map the role from API response to frontend Role enum
    if (data.user && data.user.role) {
      data.user.role = mapApiRoleToFrontendRole(data.user.role);
    }

    return data;
  },

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: Role;
    neighborhood?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: mapFrontendRoleToApiRole(userData.role),
        ...(userData.neighborhood && { neighborhood: userData.neighborhood }),
      }),
    });

    const data = await handleResponse(response);
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    // Map the role from API response to frontend Role enum
    if (data.user && data.user.role) {
      data.user.role = mapApiRoleToFrontendRole(data.user.role);
    }

    return data;
  },

  async logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("accessToken");
    }
  },

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const data = await handleResponse(response);
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data;
  },

  // Complaints methods
  async getComplaintByTracking(trackingTag: string): Promise<Complaint | null> {
    try {
      const complaint = await apiRequest(`/complaints/track/${trackingTag}`);
      return mapBackendComplaintToFrontend(complaint);
    } catch (error) {
      return null;
    }
  },

  async submitComplaint(data: {
    submitterName: string;
    contactNumber: string;
    description: string;
    location: string;
    neighborhood: string;
    complaint_type: string;
    priority?: string;
    suggestedSolution?: string;
    files?: File[];
  }): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.trackingTag;
  },

  async getComplaints(role: Role): Promise<Complaint[]> {
    try {
      const complaints = await apiRequest("/complaints");
      const mapped = complaints.map(mapBackendComplaintToFrontend);
      // If backend returns no data, use demo data
      if (mapped.length === 0) {
        console.warn("Backend returned no complaints, using demo data");
        return getDemoComplaints(role);
      }
      return mapped;
    } catch (error) {
      console.warn("Backend not available, using demo data for development");
      // Return demo data when backend is not available
      return getDemoComplaints(role);
    }
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const complaint = await apiRequest(`/complaints/${id}`);
    return mapBackendComplaintToFrontend(complaint);
  },

  async acceptComplaint(id: string, solutionInfo: string): Promise<Complaint> {
    return apiRequest(`/complaints/${id}/accept`, {
      method: "PATCH",
      body: JSON.stringify({ solutionInfo }),
    });
  },

  async refuseComplaint(id: string, refusalReason: string): Promise<Complaint> {
    return apiRequest(`/complaints/${id}/refuse`, {
      method: "PATCH",
      body: JSON.stringify({ refusalReason }),
    });
  },

  async updateComplaint(
    id: string,
    updates: {
      priority?: string;
      notes?: string;
      estimatedReviewTime?: string;
    }
  ): Promise<Complaint> {
    return apiRequest(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteComplaint(id: string): Promise<{ message: string }> {
    return apiRequest(`/complaints/${id}`, { method: "DELETE" });
  },

  // Legacy methods for backward compatibility
  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes?: string
  ): Promise<boolean> {
    try {
      if (status === ComplaintStatus.COMPLETED) {
        await this.acceptComplaint(id, notes || "Accepted");
      } else if (status === ComplaintStatus.CLOSED) {
        await this.refuseComplaint(id, notes || "Refused");
      } else {
        await this.updateComplaint(id, { notes });
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  async updateComplaintImportance(
    id: string,
    importance: Importance
  ): Promise<boolean> {
    try {
      const priority =
        importance === Importance.HIGH
          ? "high"
          : importance === Importance.MEDIUM
          ? "mid"
          : "low";
      await this.updateComplaint(id, { priority });
      return true;
    } catch (error) {
      return false;
    }
  },

  async updateComplaintPinned(id: string, pinned: boolean): Promise<boolean> {
    // This is frontend-specific, no backend call needed
    return true;
  },

  async getUserById(id: string): Promise<User> {
    const user = await apiRequest(`/users/${id}`);
    // Map the role from API response to frontend Role enum
    if (user.role) {
      user.role = mapApiRoleToFrontendRole(user.role);
    }
    return user;
  },

  async getUserComplaints(id: string): Promise<Complaint[]> {
    const complaints = await apiRequest(`/users/${id}/complaints`);
    return complaints.map(mapBackendComplaintToFrontend);
  },

  async updateUser(
    id: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
      neighborhood?: string;
    }
  ): Promise<User> {
    const user = await apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    // Map the role from API response to frontend Role enum
    if (user.role) {
      user.role = mapApiRoleToFrontendRole(user.role);
    }

    return user;
  },

  async deactivateUser(id: string): Promise<User> {
    const user = await apiRequest(`/users/${id}/deactivate`, {
      method: "PATCH",
    });

    // Map the role from API response to frontend Role enum
    if (user.role) {
      user.role = mapApiRoleToFrontendRole(user.role);
    }

    return user;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiRequest(`/users/${id}`, { method: "DELETE" });
  },

  // Legacy methods for backward compatibility
  async getMuktars(): Promise<User[]> {
    try {
      // Try to get all users from API and filter by role
      const users = await apiRequest("/users");
      const muktars = users.filter((user: any) => user.role === "mukhtar");
      const mapped = muktars.map((user: any) => ({
        ...user,
        role: mapApiRoleToFrontendRole(user.role),
        district: user.neighborhood || user.district,
      }));
      // If no muktars found, use demo data
      if (mapped.length === 0) {
        console.warn("Backend returned no muktars, using demo data");
        return mockMuktars;
      }
      return mapped;
    } catch (error) {
      console.warn("Backend not available for muktars, using demo data");
      // Return demo data when backend is not available
      return mockMuktars;
    }
  },

  async getAdmins(): Promise<User[]> {
    try {
      // Try to get all users from API and filter by role
      const users = await apiRequest("/users");
      const admins = users.filter((user: any) => user.role === "admin");
      const mapped = admins.map((user: any) => ({
        ...user,
        role: mapApiRoleToFrontendRole(user.role),
        district: user.neighborhood || user.district,
      }));
      // If no admins found, use demo data
      if (mapped.length === 0) {
        console.warn("Backend returned no admins, using demo data");
        return mockAdmins;
      }
      return mapped;
    } catch (error) {
      console.warn("Backend not available for admins, using demo data");
      // Return demo data when backend is not available
      return mockAdmins;
    }
  },

  async getManagers(): Promise<User[]> {
    // Return mock managers data
    return mockManagers;
  },

  async createMuktar(userData: {
    name: string;
    email: string;
    password: string;
    district?: string;
  }): Promise<User> {
    // Use the register endpoint for muktar creation
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: "mukhtar",
        ...(userData.district && { neighborhood: userData.district }),
      }),
    });

    const data = await handleResponse(response);

    // The register endpoint returns { accessToken, user } or just user data
    // Extract the user object and map the role
    const user = data.user || data;

    // Map the role from API response to frontend Role enum
    if (user.role) {
      user.role = mapApiRoleToFrontendRole(user.role);
    }

    // Map neighborhood back to district for frontend consistency
    if (user.neighborhood && !user.district) {
      user.district = user.neighborhood;
      delete user.neighborhood;
    }

    return user;
  },

  async getMuktarById(id: string): Promise<User | null> {
    try {
      return await this.getUserById(id);
    } catch (error) {
      return null;
    }
  },

  async getMuktarStats(id: string): Promise<MuktarStats> {
    // This would need a stats endpoint
    // For now, return mock data
    return {
      total: 150,
      resolved: 120,
      pending: 30,
      avgResolutionTime: "2 Days",
      performance: 80,
      complaintsByMonth: [
        { name: "Jan", count: 20 },
        { name: "Feb", count: 35 },
        { name: "Mar", count: 25 },
        { name: "Apr", count: 40 },
      ],
    };
  },

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const announcements = await apiRequest("/announcements");
      // If no announcements, use demo data
      if (!announcements || announcements.length === 0) {
        console.warn("Backend returned no announcements, using demo data");
        return mockAnnouncements;
      }
      return announcements;
    } catch (error) {
      console.warn("Backend not available for announcements, using demo data");
      return mockAnnouncements;
    }
  },

  async getAnnouncementById(id: string): Promise<Announcement> {
    return apiRequest(`/announcements/${id}`);
  },

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    if (announcement.id) {
      // Update existing
      return apiRequest(`/announcements/${announcement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.description,
          status: announcement.isSticky ? "active" : "inactive",
        }),
      });
    } else {
      // Create new
      return apiRequest("/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.description,
          status: announcement.isSticky ? "active" : "inactive",
        }),
      });
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await apiRequest(`/announcements/${id}`, { method: "DELETE" });
  },

  async getAchievements(): Promise<Achievement[]> {
    try {
      const achievements = await apiRequest("/achievements");
      // If no achievements, use demo data
      if (!achievements || achievements.length === 0) {
        console.warn("Backend returned no achievements, using demo data");
        return mockAchievements;
      }
      return achievements;
    } catch (error) {
      console.warn("Backend not available for achievements, using demo data");
      return mockAchievements;
    }
  },

  async getAchievementById(id: string): Promise<Achievement> {
    return apiRequest(`/achievements/${id}`);
  },

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    if (achievement.id) {
      // Update existing
      return apiRequest(`/achievements/${achievement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: achievement.title,
          description: achievement.description,
          iconUrl: achievement.media?.[0]?.url || "",
          status: "active",
        }),
      });
    } else {
      // Create new
      return apiRequest("/achievements", {
        method: "POST",
        body: JSON.stringify({
          title: achievement.title,
          description: achievement.description,
          iconUrl: achievement.media?.[0]?.url || "",
          status: "active",
        }),
      });
    }
  },

  async deleteAchievement(id: string): Promise<void> {
    await apiRequest(`/achievements/${id}`, { method: "DELETE" });
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    district?: string;
  }): Promise<User> {
    // Use the register endpoint for user creation
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: mapFrontendRoleToApiRole(userData.role),
        ...(userData.district && { neighborhood: userData.district }),
      }),
    });

    const data = await handleResponse(response);

    // The register endpoint returns { accessToken, user } or just user data
    // Extract the user object and map the role
    const user = data.user || data;

    // Map the role from API response to frontend Role enum
    if (user.role) {
      user.role = mapApiRoleToFrontendRole(user.role);
    }

    // Map neighborhood back to district for frontend consistency
    if (user.neighborhood && !user.district) {
      user.district = user.neighborhood;
      delete user.neighborhood;
    }

    return user;
  },

  // Admin Dashboard Summary Data
  async getAdminDashboardSummary(): Promise<{
    systemOverview: {
      totalUsers: number;
      activeUsers: number;
      totalComplaints: number;
      resolvedToday: number;
      avgResolutionTime: string;
      systemUptime: string;
    };
    performanceMetrics: {
      resolutionRate: number;
      customerSatisfaction: number;
      responseTime: string;
      escalationRate: number;
    };
    recentActivity: {
      complaintsSubmitted: number;
      complaintsResolved: number;
      usersActive: number;
      systemAlerts: number;
    };
    monthlyTrends: {
      complaints: number[];
      resolutions: number[];
      userGrowth: number[];
    };
  }> {
    // Mock admin dashboard summary data
    return {
      systemOverview: {
        totalUsers: 1247,
        activeUsers: 892,
        totalComplaints: 3456,
        resolvedToday: 23,
        avgResolutionTime: "2.4 days",
        systemUptime: "99.8%",
      },
      performanceMetrics: {
        resolutionRate: 87.3,
        customerSatisfaction: 4.2,
        responseTime: "4.1 hours",
        escalationRate: 3.2,
      },
      recentActivity: {
        complaintsSubmitted: 45,
        complaintsResolved: 38,
        usersActive: 156,
        systemAlerts: 2,
      },
      monthlyTrends: {
        complaints: [
          145, 167, 189, 203, 178, 192, 156, 178, 201, 187, 203, 198,
        ],
        resolutions: [
          132, 154, 176, 189, 165, 178, 143, 165, 187, 173, 189, 184,
        ],
        userGrowth: [45, 52, 48, 61, 55, 49, 58, 62, 57, 64, 59, 67],
      },
    };
  },

  async getAdminPerformanceReport(): Promise<{
    topPerformingAdmins: Array<{
      id: string;
      name: string;
      resolvedComplaints: number;
      avgResolutionTime: string;
      satisfactionScore: number;
      efficiency: number;
    }>;
    districtPerformance: Array<{
      district: string;
      totalComplaints: number;
      resolvedComplaints: number;
      avgResolutionTime: string;
      citizenSatisfaction: number;
    }>;
    complaintCategories: Array<{
      category: string;
      count: number;
      percentage: number;
      avgResolutionTime: string;
    }>;
    timeBasedMetrics: {
      peakHours: string[];
      weekendVsWeekday: {
        weekday: number;
        weekend: number;
      };
      monthlyGrowth: number;
    };
  }> {
    // Mock admin performance report data
    return {
      topPerformingAdmins: [
        {
          id: "admin1",
          name: "Fatima Al-Admin",
          resolvedComplaints: 145,
          avgResolutionTime: "1.8 days",
          satisfactionScore: 4.6,
          efficiency: 92.3,
        },
        {
          id: "admin2",
          name: "Omar Al-Admin",
          resolvedComplaints: 132,
          avgResolutionTime: "2.1 days",
          satisfactionScore: 4.4,
          efficiency: 88.7,
        },
      ],
      districtPerformance: [
        {
          district: "District 1",
          totalComplaints: 456,
          resolvedComplaints: 423,
          avgResolutionTime: "2.2 days",
          citizenSatisfaction: 4.3,
        },
        {
          district: "District 2",
          totalComplaints: 389,
          resolvedComplaints: 356,
          avgResolutionTime: "2.5 days",
          citizenSatisfaction: 4.1,
        },
        {
          district: "District 3",
          totalComplaints: 298,
          resolvedComplaints: 278,
          avgResolutionTime: "1.9 days",
          citizenSatisfaction: 4.5,
        },
      ],
      complaintCategories: [
        {
          category: "infrastructure",
          count: 234,
          percentage: 28.5,
          avgResolutionTime: "3.2 days",
        },
        {
          category: "sanitation",
          count: 189,
          percentage: 23.0,
          avgResolutionTime: "2.1 days",
        },
        {
          category: "lighting",
          count: 156,
          percentage: 19.0,
          avgResolutionTime: "1.8 days",
        },
        {
          category: "water",
          count: 98,
          percentage: 11.9,
          avgResolutionTime: "2.8 days",
        },
        {
          category: "electricity",
          count: 76,
          percentage: 9.3,
          avgResolutionTime: "4.1 days",
        },
        {
          category: "other",
          count: 67,
          percentage: 8.2,
          avgResolutionTime: "2.4 days",
        },
      ],
      timeBasedMetrics: {
        peakHours: ["9-11 AM", "2-4 PM"],
        weekendVsWeekday: {
          weekday: 78.5,
          weekend: 21.5,
        },
        monthlyGrowth: 12.3,
      },
    };
  },
};
