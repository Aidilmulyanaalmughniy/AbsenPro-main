import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { LoginModal } from '@/components/LoginModal'
import { AccessDenied } from '@/components/AccessDenied'

import { Dashboard } from '@/sections/Dashboard'
import { DataAbsensi } from '@/sections/DataAbsensi'
import { BelumAbsen } from '@/sections/BelumAbsen'
import { Monitoring } from '@/sections/Monitoring'
import { ManageSiswa } from '@/sections/ManageSiswa'
import { ManageKelas } from '@/sections/ManageKelas'
import { ImportCSV } from '@/sections/ImportCSV'
import { OwnerPanel } from '@/sections/OwnerPanel'
import { ActivityLogs } from '@/sections/ActivityLogs'

import { AppProvider, useApp } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'

import { Toaster } from '@/components/ui/sonner'
import { AnimatePresence, motion } from 'framer-motion'

function AppContent() {
  const { currentView, setUser, setUserRole } = useApp()
  const { user, userRole } = useAuth()

  // ==============================
  // 🔒 MAINTENANCE STATE
  // ==============================

  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [loadingMaintenance, setLoadingMaintenance] = useState(true)

  // ==============================
  // 🔄 AUTH SYNC
  // ==============================

  useEffect(() => {
    if (user) {
      setUser(user)
      setUserRole(userRole)
    } else {
      setUser(null)
      setUserRole('publik')
    }
  }, [user, userRole, setUser, setUserRole])

  // ==============================
  // 🔥 REALTIME MAINTENANCE LISTENER
  // ==============================

  useEffect(() => {
    const ref = doc(db, 'settings', 'attendance_control')

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setMaintenanceMode(data?.maintenanceMode === true)
          setMaintenanceMessage(data?.maintenanceMessage || '')
        } else {
          setMaintenanceMode(false)
        }
        setLoadingMaintenance(false)
      },
      () => {
        // kalau error jangan crash app
        setMaintenanceMode(false)
        setLoadingMaintenance(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // ==============================
  // 🔐 ROLE CHECK
  // ==============================

  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true
    return allowedRoles.includes(userRole || 'publik')
  }

  // ==============================
  // 🧠 VIEW CONFIG
  // ==============================

  const viewConfig: Record<
    string,
    { component: JSX.Element; roles?: string[] }
  > = {
    dashboard: { component: <Dashboard /> },
    absensi: { component: <DataAbsensi /> },
    'belum-absen': { component: <BelumAbsen /> },

    monitoring: {
      component: <Monitoring />,
      roles: ['developer', 'owner']
    },

    'manage-siswa': {
      component: <ManageSiswa />,
      roles: ['developer', 'owner']
    },

    'manage-kelas': {
      component: <ManageKelas />,
      roles: ['developer', 'owner']
    },

    import: {
      component: <ImportCSV />,
      roles: ['developer', 'owner']
    },

    owner: {
      component: <OwnerPanel />,
      roles: ['owner']
    },

    activity: {
      component: <ActivityLogs />,
      roles: ['owner']
    }
  }

  const view = viewConfig[currentView] || viewConfig['dashboard']

  const renderView = () => {
    if (!hasRole(view.roles)) {
      return (
        <AccessDenied text="Anda tidak memiliki akses ke halaman ini" />
      )
    }
    return view.component
  }

  // ==============================
  // ⏳ WAIT UNTIL SETTINGS LOADED
  // ==============================

  if (loadingMaintenance) return null

  // ==============================
  // 🔒 WEBSITE LOCKED (OWNER BYPASS)
  // ==============================

  if (maintenanceMode && userRole !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white relative overflow-hidden">

        {/* Animated Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
          className="absolute w-[500px] h-[500px] bg-cyan-500 blur-[180px] rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 text-center space-y-4 bg-white/5 p-10 rounded-2xl border border-white/10"
        >
          <h1 className="text-3xl font-bold">
            Website Sedang Libur
          </h1>

          <p className="text-white/60">
            {maintenanceMessage || 'Sistem absensi sedang dinonaktifkan sementara'}
          </p>
        </motion.div>
      </div>
    )
  }

  // ==============================
  // 🌐 NORMAL WEBSITE
  // ==============================

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <Sidebar />
      <LoginModal />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App