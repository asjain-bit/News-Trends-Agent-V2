import { create } from 'zustand';
import { User, authService } from '../services/authService';
import { ReportThread, storageService } from '../services/storageService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  threadId?: string;
  read: boolean;
  createdAt: number;
}

interface AppState {
  user: User | null;
  isAuthenticating: boolean;
  login: (role: "strategy" | "general") => Promise<void>;
  logout: () => Promise<void>;
  
  threads: ReportThread[];
  loadThreads: () => Promise<void>;
  addThread: (thread: ReportThread) => Promise<void>;
  updateThread: (thread: ReportThread) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  
  generateReportInBackground: (threadId: string, depth: string) => Promise<void>;

  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const getInitialUser = (): User => {
  try {
    const saved = localStorage.getItem('m42_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore error
  }
  return {
    id: "user-strat-1",
    name: "Ashika Jain",
    role: "strategy",
    email: "strategy@example.com",
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  user: getInitialUser(),
  isAuthenticating: false,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  login: async (role) => {
    set({ isAuthenticating: true });
    try {
      const user = await authService.login(role);
      try {
        localStorage.setItem('m42_user', JSON.stringify(user));
      } catch (e) {}
      set({ user });
    } finally {
      set({ isAuthenticating: false });
    }
  },
  logout: async () => {
    await authService.logout();
    try {
      localStorage.removeItem('m42_user');
    } catch (e) {}
    set({ user: null });
  },

  threads: [],
  loadThreads: async () => {
    const threads = await storageService.getThreads();
    set({ threads });
  },
  addThread: async (thread) => {
    await storageService.saveThread(thread);
    const threads = await storageService.getThreads();
    set({ threads });
  },
  updateThread: async (thread) => {
    await storageService.saveThread(thread);
    const threads = await storageService.getThreads();
    set({ threads });
  },
  deleteThread: async (id) => {
    await storageService.deleteThread(id);
    const threads = await storageService.getThreads();
    set({ threads });
  },

  generateReportInBackground: async (threadId, depth) => {
    // Smooth 8.5s simulation
    await new Promise(resolve => setTimeout(resolve, 8500));
    
    const threads = await storageService.getThreads();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const { generateDummyReportSections } = await import('../utils/dummyReportData');

    const newVersionNumber = (thread.versions?.length || 0) + 1;
    const newVersion = {
      id: `v${newVersionNumber}`,
      versionNumber: newVersionNumber,
      createdAt: Date.now(),
      content: { sections: generateDummyReportSections(depth || 'Standard', newVersionNumber) }
    };
    
    await storageService.saveThread({
      ...thread,
      status: 'completed',
      versions: [...(thread.versions || []), newVersion],
      updatedAt: Date.now()
    });
    
    const updatedThreads = await storageService.getThreads();
    
    // Add notification
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Report Generated',
      message: `Your report "${thread.title}" is ready for review.`,
      threadId,
      read: false,
      createdAt: Date.now()
    };

    set(state => ({ 
      threads: updatedThreads,
      notifications: [newNotif, ...state.notifications]
    }));
  },

  notifications: [],
  addNotification: (notif) => {
    set(state => ({
      notifications: [{
        ...notif,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
        createdAt: Date.now()
      }, ...state.notifications]
    }));
  },
  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },
  clearAllNotifications: () => set({ notifications: [] })
}));
