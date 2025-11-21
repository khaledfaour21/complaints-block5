import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeState, LangState, AuthState, Language, Role } from './types';
import { translations } from './i18n';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'theme-storage' }
  )
);

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en', 
      setLang: (lang: Language) => set({ lang }),
      t: (key: string) => {
        const lang = get().lang;
        return translations[lang][key] || key;
      },
    }),
    { name: 'lang-storage' }
  )
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user) => set({ user, token: 'mock-jwt-token' }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);

// Toast Store
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
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
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        { id: '1', title: 'Welcome', message: 'Welcome to the Fifth Block system.', read: false, date: new Date().toISOString() }
      ],
      addNotification: (n) => set((state) => ({
        notifications: [{ ...n, id: Math.random().toString(), read: false, date: new Date().toISOString() }, ...state.notifications]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'notifications-storage' }
  )
);

// Simple mock initialization for browser language detection
const initializeLanguage = () => {
    const stored = localStorage.getItem('lang-storage');
    if (!stored) {
        const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
        useLangStore.getState().setLang(browserLang);
    }
};
initializeLanguage();