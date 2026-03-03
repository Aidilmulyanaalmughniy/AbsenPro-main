import { useState, useMemo } from 'react'
import { useStudents } from '@/hooks/useStudents'
import { usePermission } from '@/hooks/usePermission'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil, Check, X, Users, Search } from 'lucide-react'
import { motion } from 'framer-motion'

const PAGE_SIZE = 6

export function ManageSiswa() {
  const { can } = usePermission()
  const { siswa, loading, addStudent, updateStudent, deleteStudent } =
    useStudents()

  const isAllowed = can('developer')

  const [nama, setNama] = useState('')
  const [uid, setUid] = useState('')
  const [kelas, setKelas] = useState('X PPLG')

  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('all')
  const [page, setPage] = useState(1)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNama, setEditNama] = useState('')
  const [editKelas, setEditKelas] = useState('')

  // ===============================
  // FILTER + SEARCH
  // ===============================
  const processed = useMemo(() => {
    let data = [...siswa]

    if (search) {
      data = data.filter(
        s =>
          s.nama.toLowerCase().includes(search.toLowerCase()) ||
          s.uid_rfid.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filterKelas !== 'all') {
      data = data.filter(s => s.kelas === filterKelas)
    }

    return data.reverse()
  }, [siswa, search, filterKelas])

  const totalPages = Math.ceil(processed.length / PAGE_SIZE)

  const paginated = processed.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // ===============================
  // ACTIONS
  // ===============================
  const handleAdd = async () => {
    if (!nama || !uid || !kelas) return

    await addStudent({
      nama,
      uid_rfid: uid,
      kelas
    })

    setNama('')
    setUid('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      await deleteStudent(id)
    }
  }

  const startEdit = (s: any) => {
    setEditingId(s.id)
    setEditNama(s.nama)
    setEditKelas(s.kelas)
  }

  const saveEdit = async (id: string) => {
    await updateStudent(id, {
      nama: editNama,
      kelas: editKelas
    })
    setEditingId(null)
  }

  if (!isAllowed) {
    return (
      <div className="text-center py-20 text-red-400">
        Akses hanya untuk Developer / Owner
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Manage Siswa
          </h1>
          <p className="text-white/40 text-sm">
            Kelola data siswa secara realtime
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-br 
                        from-cyan-500/20 to-blue-500/20 
                        px-6 py-3 rounded-2xl 
                        border border-cyan-500/20">
          <Users className="w-5 h-5 text-cyan-400" />
          <span className="text-lg font-bold text-white">
            {siswa.length}
          </span>
        </div>
      </div>

      {/* FORM TAMBAH */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 shadow-lg space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Nama Siswa"
            value={nama}
            onChange={e => setNama(e.target.value)}
          />
          <Input
            placeholder="UID RFID"
            value={uid}
            onChange={e => setUid(e.target.value)}
          />
          <Input
            placeholder="Kelas"
            value={kelas}
            onChange={e => setKelas(e.target.value)}
          />
        </div>

        <Button
          onClick={handleAdd}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl"
        >
          Tambah Siswa
        </Button>
      </div>

      {/* FILTER BAR UPGRADE */}
      <div className="flex flex-col md:flex-row gap-4 items-center">

        {/* SEARCH */}
        <div className="relative w-full md:w-1/2">
          <Input
            placeholder="Cari nama atau UID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-[#1e293b] border-white/10 
                       focus:border-cyan-500"
          />
          <Search className="absolute left-3 top-1/2 
                             -translate-y-1/2 
                             w-4 h-4 text-white/40" />
        </div>

        {/* FILTER KELAS */}
        <div className="relative">
          <select
            value={filterKelas}
            onChange={e => setFilterKelas(e.target.value)}
            className="appearance-none bg-[#1e293b] 
                       px-5 py-2 pr-10 rounded-xl 
                       border border-white/10 
                       text-white cursor-pointer
                       hover:border-cyan-500/40
                       transition-all"
          >
            <option value="all">Semua Kelas</option>
            {[...new Set(siswa.map(s => s.kelas))].map(k => (
              <option key={k}>{k}</option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 
                          -translate-y-1/2 
                          text-white/40 pointer-events-none">
            ▼
          </div>
        </div>
      </div>

      {/* LIST SISWA */}
      {loading ? (
        <div className="text-white/40">Loading data...</div>
      ) : paginated.length === 0 ? (
        <div className="text-white/40 text-center py-10">
          Tidak ada siswa ditemukan
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map(s => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center
                         bg-gradient-to-br 
                         from-[#1e293b] to-[#172036]
                         p-5 rounded-2xl
                         border border-white/5
                         hover:border-cyan-500/40
                         transition-all shadow-md"
            >
              {editingId === s.id ? (
                <div className="flex gap-2 w-full">
                  <Input
                    value={editNama}
                    onChange={e => setEditNama(e.target.value)}
                  />
                  <Input
                    value={editKelas}
                    onChange={e => setEditKelas(e.target.value)}
                  />
                  <Button size="icon" onClick={() => saveEdit(s.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {s.nama}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-3 py-1 rounded-full 
                                       bg-cyan-500/20 text-cyan-400">
                        {s.kelas}
                      </span>

                      <span className="text-xs px-3 py-1 rounded-full 
                                       bg-white/5 text-white/60">
                        {s.uid_rfid}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => startEdit(s)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? 'default' : 'secondary'}
              onClick={() => setPage(i + 1)}
              className="rounded-xl"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}