import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeState, LangState, AuthState, Language, Role } from "./types";
import { translations } from "./i18n";
import { api } from "./services/api";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    { name: "theme-storage" }
  )
);

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang: Language) => set({ lang }),
      t: (key: string) => {
        const lang = get().lang;
        return translations[lang][key] || key;
      },
    }),
    { name: "lang-storage" }
  )
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user) => set({ user, token: "mock-jwt-token" }),
      loginWithCredentials: async (email: string, password: string) => {
        try {
          const response = await api.login(email, password);
          if (response.user) {
            set({
              user: response.user,
              token: response.accessToken || "jwt-token",
            });
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error("Login failed:", error);
          return false;
        }
      },
      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, token: null });
        }
      },
    }),
    { name: "auth-storage" }
  )
);

// Toast Store
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastState {
  toasts: Toast[];
  addToast: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(
      () =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      3000
    );
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Notification Store
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "date">
  ) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: "1",
          title: "Welcome to Fifth Block System",
          message:
            "Welcome! Your account has been successfully activated. You can now access all complaint management features.",
          read: false,
          date: new Date().toISOString(),
        },
        {
          id: "2",
          title: "New Complaint Submitted",
          message:
            "A new high-priority complaint has been submitted in your district. Please review and assign accordingly.",
          read: false,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: "3",
          title: "System Maintenance",
          message:
            "Scheduled maintenance will occur tonight from 11 PM to 1 AM. The system may be temporarily unavailable.",
          read: false,
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        },
        {
          id: "4",
          title: "Complaint Resolved",
          message:
            "Complaint #TRK-001 has been successfully resolved. The citizen has been notified.",
          read: true,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          id: "5",
          title: "New Achievement Added",
          message:
            "A new community achievement 'Park Renovation' has been published. Check it out in the achievements section.",
          read: true,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          id: "6",
          title: "Monthly Report Available",
          message:
            "Your monthly performance report for January 2024 is now available. View detailed statistics and analytics.",
          read: false,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
        {
          id: "7",
          title: "Emergency Alert",
          message:
            "URGENT: Water main break reported on Main Street. Emergency crews have been dispatched. Please avoid the area.",
          read: false,
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          id: "8",
          title: "Training Session Reminder",
          message:
            "Don't forget: Digital literacy training session tomorrow at 2 PM in the community center. Seats are limited.",
          read: true,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
        {
          id: "9",
          title: "Policy Update",
          message:
            "New complaint handling policy has been implemented. Please review the updated guidelines in the admin panel.",
          read: false,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        },
        {
          id: "10",
          title: "System Update Complete",
          message:
            "System update has been successfully completed. New features include improved search and enhanced reporting tools.",
          read: true,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        },
      ],
      addNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              ...n,
              id: Math.random().toString(),
              read: false,
              date: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: "notifications-storage" }
  )
);

// Simple mock initialization for browser language detection
const initializeLanguage = () => {
  const stored = localStorage.getItem("lang-storage");
  if (!stored) {
    const browserLang = navigator.language.startsWith("ar") ? "ar" : "en";
    useLangStore.getState().setLang(browserLang);
  }
};
initializeLanguage();
