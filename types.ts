export enum Role {
  CITIZEN = "CITIZEN",
  MUKTAR = "MUKTAR",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum Urgency {
  NORMAL = "Normal",
  URGENT = "Urgent",
  CRITICAL = "Critical",
}

export enum Importance {
  HIGH = "High Importance",
  MEDIUM = "Medium Importance",
  LOW = "Low Importance",
}

export enum ComplaintStatus {
  UNREAD = "Unread",
  PENDING = "Pending",
  UNDER_REVIEW = "Under Review",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  district?: string;
  avatar?: string;
  joinedAt?: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  district: string;
  location: string;
  category: string;
  importance: Importance;
  title: string;
  description: string;
  notes?: string;
  phoneNumber: string;
  citizenHelp?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt?: string;
  expectedCompletion?: string;
  attachments: string[]; // URLs
  muktarNotes?: string;
  assignedMuktarId?: string;
  assignedAdminId?: string;
  assignedManagerId?: string;
  pinned?: boolean;
  submitterName?: string;
  solutionInfo?: string;
  refusalReason?: string;
  estimatedReviewTime?: string;
}

export interface Achievement {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  date: string;
  media: Array<{
    url: string;
    type: "image" | "video";
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  date: string;
  category: string;
  categoryAr?: string;
  isSticky?: boolean;
  language?: "en" | "ar" | "both";
}

export type Language = "en" | "ar";

export interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface LangState {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

export interface AuthState {
  user: User | null;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  token: string | null;
}

export interface MuktarStats {
  total: number;
  resolved: number;
  pending: number;
  avgResolutionTime: string;
  performance: number; // 0-100
  complaintsByMonth: { name: string; count: number }[];
}

export interface FilterState {
  district: string;
  status: string;
  importance: string;
  search: string;
}
