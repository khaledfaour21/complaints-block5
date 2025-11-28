export enum Role {
  CITIZEN = 'CITIZEN',
  MUKTAR = 'MUKTAR',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export enum Urgency {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

export enum Importance {
  HIGH = 'High Importance',
  MEDIUM = 'Medium Importance',
  LOW = 'Low Importance',
}

export enum ComplaintStatus {
  UNREAD = 'Unread',
  PENDING = 'Pending',
  UNDER_REVIEW = 'Under Review',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
  CLOSED = 'Closed',
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
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  media: Array<{
    url: string;
    type: 'image' | 'video';
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  isSticky?: boolean;
}

export type Language = 'en' | 'ar';

export interface ThemeState {
  theme: 'light' | 'dark';
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
  logout: () => void;
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
