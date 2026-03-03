import { useState } from 'react'
import {
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { Absensi, StatusAbsensi, UserRole } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AttendanceTableProps {
  data: Absensi[]
  userRole: UserRole
  onDelete?: (id: string) => void
  onUpdateStatus?: (id: string, status: StatusAbsensi) => void
  loading?: boolean
}

type SortField = 'nama' | 'kelas' | 'tanggal' | 'status'
type SortOrder = 'asc' | 'desc'

const statusConfig: Record<
  StatusAbsensi,
  { label: string; color: string; bg: string }
> = {
  hadir: {
    label: 'Hadir',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  terlambat: {
    label: 'Terlambat',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  izin: {
    label: 'Izin',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  sakit: {
    label: 'Sakit',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  alpha: {
    label: 'Alpha',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
}

export function AttendanceTable({
  data,
  userRole,
  onDelete,
  onUpdateStatus,
  loading = false,
}: AttendanceTableProps) {

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('tanggal')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const canEdit = userRole === 'developer' || userRole === 'owner'
  const canDelete = userRole === 'developer' || userRole === 'owner'

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredData = data
    .filter(item =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'nama':
          comparison = a.nama.localeCompare(b.nama)
          break
        case 'kelas':
          comparison = a.kelas.localeCompare(b.kelas)
          break
        case 'tanggal':
          const aTime = a.tanggal instanceof Date ? a.tanggal.getTime() : a.tanggal.toDate().getTime()
          const bTime = b.tanggal instanceof Date ? b.tanggal.getTime() : b.tanggal.toDate().getTime()
          comparison = aTime - bTime
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#1e293b] border border-white/10 p-6">
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-[#1e293b] border border-white/10 overflow-hidden shadow-xl"
    >

      {/* HEADER */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Data Absensi
        </h3>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Cari nama atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 bg-[#0f172a] border-white/10 text-white"
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredData.length === 0 && (
        <div className="py-16 text-center text-white/40">
          Tidak ada data absensi
        </div>
      )}

      {/* TABLE */}
      {filteredData.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>No</TableHead>
                <TableHead onClick={() => handleSort('nama')}>Nama</TableHead>
                <TableHead onClick={() => handleSort('kelas')}>Kelas</TableHead>
                <TableHead onClick={() => handleSort('tanggal')}>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                {(canEdit || canDelete) && <TableHead>Aksi</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, index) => {
                const status = statusConfig[item.status]

                return (
                  <TableRow
                    key={item.id}
                    className="border-white/10 hover:bg-white/5 transition"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.kelas}</TableCell>
                    <TableCell>
                      {format(item.tanggal instanceof Date ? item.tanggal : item.tanggal.toDate(), 'dd MMM yyyy HH:mm', { locale: id })}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize border",
                          status.bg,
                          status.color
                        )}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>

                    {(canEdit || canDelete) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4 text-white/50" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1e293b] border-white/10"
                          >

                            {canEdit && onUpdateStatus && (
                              <>
                                {Object.keys(statusConfig).map((key) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() =>
                                      onUpdateStatus(item.id, key as StatusAbsensi)
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Set {statusConfig[key as StatusAbsensi].label}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}

                            {canDelete && onDelete && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm('Hapus data ini?')) {
                                    onDelete(item.id)
                                  }
                                }}
                                className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}

                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 text-sm text-white/50">
        Menampilkan {filteredData.length} data
      </div>

    </motion.div>
  )
}