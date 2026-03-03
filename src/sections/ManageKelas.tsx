import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit, Users } from 'lucide-react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { canAccess } from '@/lib/permissions'

interface Kelas {
  id: string
  nama: string
  totalSiswa: number
}

export function ManageKelas() {

  const { userRole } = useAuth()

  const [kelas, setKelas] = useState<Kelas[]>([])
  const [namaKelas, setNamaKelas] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // =========================
  // REALTIME LISTENER
  // =========================
  useEffect(() => {

    let kelasData: any[] = []
    let siswaData: any[] = []

    const unsubscribeKelas = onSnapshot(
      collection(db, 'kelas'),
      snapshot => {
        kelasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data())
        }))
        combineData()
      }
    )

    const unsubscribeSiswa = onSnapshot(
      collection(db, 'siswa'),
      snapshot => {
        siswaData = snapshot.docs.map(doc => doc.data())
        combineData()
      }
    )

    const combineData = () => {
      if (!kelasData) return

      const finalData = kelasData.map(k => ({
        id: k.id,
        nama: k.nama,
        totalSiswa: siswaData.filter(s => s.kelas === k.nama).length
      }))

      setKelas(finalData)
    }

    return () => {
      unsubscribeKelas()
      unsubscribeSiswa()
    }

  }, [])

  // =========================
  // ADD / UPDATE
  // =========================
  const handleSubmit = async () => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin')
      return
    }

    if (!namaKelas.trim()) {
      toast.error('Nama kelas tidak boleh kosong')
      return
    }

    try {

      if (editingId) {

        await updateDoc(doc(db, 'kelas', editingId), {
          nama: namaKelas
        })

        toast.success('Kelas diperbarui')
        setEditingId(null)

      } else {

        await addDoc(collection(db, 'kelas'), {
          nama: namaKelas,
          createdAt: serverTimestamp()
        })

        toast.success('Kelas berhasil ditambahkan')
      }

      setNamaKelas('')

    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id: string) => {

    if (!canAccess(userRole, 'developer')) {
      toast.error('Tidak memiliki izin')
      return
    }

    try {
      await deleteDoc(doc(db, 'kelas', id))
      toast.success('Kelas dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-10">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Manage Kelas
        </h1>
        <p className="text-white/50 mt-2">
          Kelola kelas dan lihat jumlah siswa realtime
        </p>
      </div>

      {/* INPUT */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br
                   from-[#1e293b]
                   via-[#172036]
                   to-[#0f172a]
                   p-8
                   rounded-3xl
                   border border-cyan-500/20
                   shadow-2xl
                   flex gap-4"
      >
        <input
          value={namaKelas}
          onChange={e => setNamaKelas(e.target.value)}
          placeholder="Masukkan nama kelas..."
          className="flex-1
                     bg-[#0f172a]
                     border border-cyan-500/30
                     rounded-2xl
                     px-5 py-3
                     text-white
                     focus:ring-2
                     focus:ring-cyan-500/40"
        />

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2
                     bg-gradient-to-r
                     from-cyan-500
                     to-blue-500
                     px-6 py-3
                     rounded-2xl
                     text-white
                     font-semibold
                     shadow-lg"
        >
          <Plus size={18} />
          {editingId ? 'Update' : 'Tambah'}
        </button>
      </motion.div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {kelas.map(item => (

          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e293b]
                       border border-cyan-500/20
                       rounded-2xl
                       p-6
                       shadow-lg
                       space-y-4"
          >

            <div className="flex justify-between items-center">

              <span className="text-white font-semibold text-lg">
                {item.nama}
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setNamaKelas(item.nama)
                    setEditingId(item.id)
                  }}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>

            {/* JUMLAH SISWA */}
            <div className="flex items-center gap-2
                            bg-cyan-500/10
                            border border-cyan-500/30
                            rounded-xl
                            px-4 py-2">

              <Users size={16} className="text-cyan-400" />

              <span className="text-cyan-300 font-medium">
                {item.totalSiswa} Siswa
              </span>

            </div>

          </motion.div>

        ))}

      </div>

    </div>
  )
}