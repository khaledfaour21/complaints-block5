
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

export enum ComplaintStatus {
  UNREAD = 'Unread',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
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
  category: string;
  urgency: Urgency;
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
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
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
  urgency: string;
  search: string;
}
