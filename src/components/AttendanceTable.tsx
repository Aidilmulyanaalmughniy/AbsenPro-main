import { useState } from "react"
import {
  Search,
  Trash2,
  MoreHorizontal,
  Pencil
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"

import type {
  Absensi,
  StatusAbsensi,
  UserRole
} from "@/types"

import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AttendanceTableProps {
  data: Absensi[]
  userRole: UserRole
  onDelete?: (id: string) => void
  onUpdateStatus?: (id: string, status: StatusAbsensi) => void
  loading?: boolean
}

const statusConfig: Record<
  StatusAbsensi,
  { label: string; color: string; bg: string }
> = {
  hadir: {
    label: "Hadir",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },

  terlambat: {
    label: "Terlambat",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20"
  },

  izin: {
    label: "Izin",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20"
  },

  sakit: {
    label: "Sakit",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20"
  },

  alpha: {
    label: "Alpha",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20"
  }
}

export function AttendanceTable({
  data,
  userRole,
  onDelete,
  onUpdateStatus,
  loading = false
}: AttendanceTableProps) {

  const [searchQuery, setSearchQuery] = useState("")

  const canEdit =
    userRole === "developer" ||
    userRole === "owner"

  const canDelete =
    userRole === "developer" ||
    userRole === "owner"

  const filteredData = data.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10 w-64 bg-[#0f172a] border-white/10 text-white"
          />

        </div>

      </div>

      {filteredData.length === 0 && (
        <div className="py-16 text-center text-white/40">
          Tidak ada data absensi
        </div>
      )}

      {filteredData.length > 0 && (

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terlambat</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead>Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>

              {filteredData.map((item, index) => {

                /* ===== FIRESTORE TIMESTAMP FIX ===== */

                const rawTanggal =
                  item.waktu_scan ?? item.tanggal

                const tanggalObj: Date =
                  (rawTanggal as any)?.toDate
                    ? (rawTanggal as any).toDate()
                    : rawTanggal

                const status =
                  statusConfig[item.status]

                return (

                  <TableRow
                    key={item.id}
                    className="border-white/10 hover:bg-white/5 transition"
                  >

                    <TableCell>{index + 1}</TableCell>

                    <TableCell>{item.nama}</TableCell>

                    <TableCell>{item.kelas}</TableCell>

                    <TableCell>
                      {tanggalObj
                        ? format(tanggalObj, "dd MMM yyyy")
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {tanggalObj
                        ? format(tanggalObj, "HH:mm")
                        : "-"}
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

                    <TableCell>

                      {item.status === "terlambat" &&
                      item.terlambatMenit != null ? (

                        <span
                          className={cn(
                            "font-medium",
                            item.terlambatMenit > 30
                              ? "text-red-400"
                              : "text-yellow-400"
                          )}
                        >
                          {item.terlambatMenit} menit
                        </span>

                      ) : "-"}

                    </TableCell>

                    {(canEdit || canDelete) && (

                      <TableCell>

                        <DropdownMenu>

                          <DropdownMenuTrigger asChild>

                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal className="w-4 h-4 text-white/50" />
                            </Button>

                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1e293b] border-white/10"
                          >

                            {canEdit &&
                              onUpdateStatus &&
                              (Object.keys(statusConfig) as StatusAbsensi[]).map(statusKey => (

                                <DropdownMenuItem
                                  key={statusKey}
                                  onClick={() =>
                                    onUpdateStatus(
                                      item.id,
                                      statusKey
                                    )
                                  }
                                  className="cursor-pointer"
                                >

                                  <Pencil className="w-4 h-4 mr-2" />

                                  Set {statusConfig[statusKey].label}

                                </DropdownMenuItem>

                              ))}

                            {canDelete && onDelete && (

                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm("Hapus data ini?")) {
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

      <div className="p-4 border-t border-white/10 text-sm text-white/50">
        Menampilkan {filteredData.length} data
      </div>

    </motion.div>
  )
}