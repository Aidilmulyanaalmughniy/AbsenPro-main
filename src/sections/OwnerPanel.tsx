import { useState, useMemo, useEffect } from 'react'
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection'
import { db, app } from '@/lib/firebase'
import {
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import {
  Trash2,
  Search,
  Plus,
  Power,
  Shield,
  Users,
  Crown
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface UserData {
  id: string
  username: string
  email: string
  role: 'admin' | 'developer' | 'owner'
}

export function OwnerPanel() {

  // ================= HOOKS =================

  const { user, userRole } = useAuth()
  const { data: users, loading } =
    useRealtimeCollection<UserData>('users')

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  })

  // =============== MAINTENANCE LISTENER ===============

  useEffect(() => {
    const ref = doc(db, 'settings', 'attendance_control')

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setMaintenanceMode(
          snap.data()?.maintenanceMode === true
        )
      }
    })

    return () => unsub()
  }, [])

  // ================= SUMMARY =================

  const summary = useMemo(() => ({
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    developer: users.filter(u => u.role === 'developer').length,
    owner: users.filter(u => u.role === 'owner').length
  }), [users])

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase())
    )
  , [users, search])

  // ================= ACTIONS =================

  const toggleMaintenance = async () => {
    await updateDoc(
      doc(db, 'settings', 'attendance_control'),
      { maintenanceMode: !maintenanceMode }
    )

    toast.success(
      maintenanceMode
        ? 'Mode Libur Dinonaktifkan'
        : 'Mode Libur Diaktifkan'
    )
  }

  const handleRoleChange = async (id: string, role: string) => {
    if (user?.uid === id) {
      toast.error('Tidak bisa mengubah role sendiri')
      return
    }
    await updateDoc(doc(db, 'users', id), { role })
  }

  const handleDelete = async (id: string) => {
    if (user?.uid === id) {
      toast.error('Tidak bisa menghapus diri sendiri')
      return
    }
    await deleteDoc(doc(db, 'users', id))
  }

  const handleCreate = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Semua field wajib diisi')
      return
    }

    try {
      setCreating(true)

      const secondaryApp = initializeApp(app.options, "Secondary")
      const secondaryAuth = getAuth(secondaryApp)

      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        newUser.email,
        newUser.password
      )

      await setDoc(doc(db, 'users', cred.user.uid), {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: serverTimestamp()
      })

      toast.success('User berhasil dibuat')
      setShowModal(false)

      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'admin'
      })

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  // ================= ROLE PROTECTION =================

  if (userRole !== 'owner') {
    return (
      <div className="text-center py-20 text-red-400 text-lg">
        Akses hanya untuk Owner
      </div>
    )
  }

  // ================= UI =================

  return (
    <div className="space-y-12">

      {/* ================= HERO CARD ================= */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black p-8 shadow-2xl"
      >
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full" />

        <div className="relative flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield size={20} />
              Mode Libur Website
            </h2>
            <p className="text-white/50 mt-2">
              Nonaktifkan seluruh sistem absensi sementara
            </p>
          </div>

          {/* iOS Style Toggle */}
          <button
            onClick={toggleMaintenance}
            className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
              maintenanceMode
                ? 'bg-red-500/30'
                : 'bg-emerald-500/30'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-1 w-8 h-8 rounded-full shadow-lg ${
                maintenanceMode
                  ? 'left-10 bg-red-400'
                  : 'left-1 bg-emerald-400'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: summary.total, icon: <Users size={18}/> },
          { label: 'Admin', value: summary.admin },
          { label: 'Developer', value: summary.developer },
          { label: 'Owner', value: summary.owner, icon: <Crown size={18}/> }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            className="rounded-2xl border border-white/10 bg-[#1e293b]/70 backdrop-blur p-6 shadow-xl"
          >
            <div className="text-white/50 text-sm flex items-center gap-2">
              {item.icon}
              {item.label}
            </div>
            <div className="text-3xl font-bold mt-3">
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= SEARCH ================= */}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 text-white/40" size={16} />
        <input
          placeholder="Cari username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1e293b] pl-10 pr-4 py-2 rounded-xl border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
        />
      </div>

      {/* ================= USER LIST ================= */}

      <div className="space-y-4">
        {loading ? (
          <div className="text-white/40">Loading...</div>
        ) : (
          filteredUsers.map(u => (
            <motion.div
              key={u.id}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e293b]/80 backdrop-blur border border-white/10 rounded-2xl p-5 flex justify-between items-center shadow-lg"
            >
              <div>
                <div className="font-semibold">{u.username}</div>
                <div className="text-white/50 text-sm">{u.email}</div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={u.role}
                  disabled={user?.uid === u.id}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="bg-black/30 px-3 py-1 rounded-lg text-xs"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="owner">Owner</option>
                </select>

                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={user?.uid === u.id}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}