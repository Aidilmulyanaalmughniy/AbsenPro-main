import {
  LayoutDashboard,
  Table,
  UserX,
  Shield,
  Code,
  LogOut,
  User,
  X,
  Download,
  Users,
  School,
  Crown,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ============================= */
/* 🔥 MENU CONFIG SYSTEM */
/* ============================= */

const MENU_CONFIG = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'absensi',
    label: 'Data Absensi',
    icon: Table
  },
  {
    id: 'belum-absen',
    label: 'Belum Absen',
    icon: UserX
  },


  // DEVELOPER +
  {
    id: 'manage-siswa',
    label: 'Manage Siswa',
    icon: Users,
    roles: ['developer', 'owner']
  },
  {
    id: 'manage-kelas',
    label: 'Manage Kelas',
    icon: School,
    roles: ['developer', 'owner']
  },
  {
    id: 'import',
    label: 'Import CSV',
    icon: Download,
    roles: ['developer', 'owner']
  },

  // OWNER ONLY
  {
    id: 'owner',
    label: 'Owner Panel',
    icon: Crown,
    roles: ['owner'],
    highlight: true
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    icon: Activity,
    roles: ['owner']
  }
];

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    setCurrentView,
    currentView,
    openLoginModal
  } = useApp();

  const { user, userRole, logout } = useAuth();

  const handleMenuClick = (view: string) => {
    setCurrentView(view as any);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
  };

  /* ============================= */
  /* 🎨 ROLE COLOR SYSTEM */
  /* ============================= */

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'developer':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'admin':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  /* ============================= */
  /* 🔐 ROLE FILTER SYSTEM */
  /* ============================= */

  const filteredMenu = MENU_CONFIG.filter(item => {
    if (!item.roles) return true; // public menu
    if (!userRole) return false;  // not logged in
    return item.roles.includes(userRole);
  });

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[320px] bg-[#1e293b] border-l border-white/5 z-[70] overflow-y-auto"
          >
            <div className="p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* USER INFO */}
              {user && (
                <div
                  className={cn(
                    "mb-6 p-4 rounded-2xl border",
                    getRoleColor(userRole)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.username}
                      </p>
                      <p className="text-xs capitalize">
                        {userRole}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN MENU */}
              <div className="space-y-1 mb-6">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 px-3">
                  Menu Utama
                </p>

                {filteredMenu.map((item, index) => {
                  const isActive = currentView === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMenuClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "text-white/70 hover:text-white hover:bg-white/5",
                        item.highlight && "text-cyan-400"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* AUTH SECTION */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 px-3">
                  Akun
                </p>

                {!user ? (
                  <>
                    <button
                      onClick={() => {
                        openLoginModal('admin');
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <Shield className="w-5 h-5" />
                      Login Admin
                    </button>

                    <button
                      onClick={() => {
                        openLoginModal('developer');
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <Code className="w-5 h-5" />
                      Login Developer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}