import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole, User } from '@/types';

interface AppContextType {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  loginRole: 'admin' | 'developer' | null;
  setLoginRole: (role: 'admin' | 'developer' | null) => void;
  openLoginModal: (role: 'admin' | 'developer') => void;
  closeLoginModal: () => void;
  
  // Filters
  selectedKelas: string;
  setSelectedKelas: (kelas: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Current view
  currentView: 'dashboard' | 'absensi' | 'belum-absen' | 'monitoring';
  setCurrentView: (view: 'dashboard' | 'absensi' | 'belum-absen' | 'monitoring') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('publik');
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'admin' | 'developer' | null>(null);
  
  // Filters
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Current view
  const [currentView, setCurrentView] = useState<'dashboard' | 'absensi' | 'belum-absen' | 'monitoring'>('dashboard');

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openLoginModal = useCallback((role: 'admin' | 'developer') => {
    setLoginRole(role);
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setLoginRole(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        userRole,
        setUserRole,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        loginModalOpen,
        setLoginModalOpen,
        loginRole,
        setLoginRole,
        openLoginModal,
        closeLoginModal,
        selectedKelas,
        setSelectedKelas,
        selectedDate,
        setSelectedDate,
        currentView,
        setCurrentView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
