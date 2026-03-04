import { useMemo } from "react"
import { UserX, Users, CheckCircle2, XCircle } from "lucide-react"
import type { Siswa } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useApp } from "@/context/AppContext"

interface BelumAbsenListProps {
  siswa: Siswa[]
  totalSiswa: number
  hadirCount: number
  tidakHadirCount: number
  belumCount: number
  loading?: boolean
}

export function BelumAbsenList({
  siswa,
  totalSiswa,
  hadirCount,
  tidakHadirCount,
  belumCount,
  loading = false
}: BelumAbsenListProps) {

  const { userRole } = useApp()

  const canInput =
    userRole === "admin" ||
    userRole === "developer" ||
    userRole === "owner"

  const progress =
    totalSiswa > 0
      ? Math.round((hadirCount / totalSiswa) * 100)
      : 0

  const sortedSiswa = useMemo(() => {
    return [...siswa].sort((a, b) =>
      a.nama.localeCompare(b.nama)
    )
  }, [siswa])

  // ==========================
  // INPUT MANUAL ABSENSI
  // ==========================

  async function setManualAttendance(siswa: Siswa, status: string) {

    const now = new Date()

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const tanggalKey = today
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")

    const id = `${siswa.uid_rfid}_${tanggalKey}`

    const ref = doc(db, "absensi", id)

    await setDoc(ref, {
      uid_rfid: siswa.uid_rfid,
      nama: siswa.nama,
      kelas: siswa.kelas,

      status: status,
      terlambatMenit: null,

      tanggal: today,
      waktu_scan: now,

      createdAt: serverTimestamp()
    })
  }

  // ==========================
  // MESSAGE SYSTEM
  // ==========================

  const message = useMemo(() => {

    if (totalSiswa === 0) {
      return {
        title: "Belum ada data siswa",
        desc: "Tambahkan siswa terlebih dahulu.",
        icon: <Users className="mx-auto text-white/40 mb-4" size={40} />
      }
    }

    if (hadirCount === totalSiswa) {
      return {
        title: "Semua siswa hadir 🎉",
        desc: "Kehadiran hari ini 100% sempurna.",
        icon: <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={40} />
      }
    }

    if (tidakHadirCount === totalSiswa) {
      return {
        title: "Semua siswa tidak hadir",
        desc: "Tidak ada siswa yang hadir hari ini.",
        icon: <XCircle className="mx-auto text-red-400 mb-4" size={40} />
      }
    }

    if (belumCount > 0) {
      return {
        title: "Masih ada siswa belum absen",
        desc: `${belumCount} siswa belum melakukan scan hari ini.`,
        icon: <UserX className="mx-auto text-yellow-400 mb-4" size={40} />
      }
    }

    return {
      title: "Data kehadiran hari ini",
      desc: `${hadirCount} hadir dan ${tidakHadirCount} tidak hadir.`,
      icon: <Users className="mx-auto text-white/40 mb-4" size={40} />
    }

  }, [totalSiswa, hadirCount, tidakHadirCount, belumCount])

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#0f172a] border border-white/10 p-6">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 shadow-xl overflow-hidden">

      {/* HEADER */}

      <div className="p-6 border-b border-white/10 space-y-6">

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Users className="text-cyan-400" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Monitoring Kehadiran
            </h2>
            <p className="text-white/50 text-sm">
              Status absensi siswa hari ini
            </p>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Stat label="Total Siswa" value={totalSiswa} />

          <Stat
            label="Sudah Hadir"
            value={hadirCount}
            icon={<CheckCircle2 size={16} />}
            green
          />

          <Stat
            label="Tidak Hadir"
            value={tidakHadirCount}
            icon={<XCircle size={16} />}
            red
          />

          <Stat
            label="Belum Absen"
            value={belumCount}
          />

        </div>

        {/* PROGRESS */}

        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Kehadiran Hari Ini</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 bg-black/40 rounded-full overflow-hidden">

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            />

          </div>
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-6">

        {sortedSiswa.length === 0 ? (

          <div className="text-center py-16">
            {message.icon}
            <h3 className="text-xl font-semibold text-white">
              {message.title}
            </h3>
            <p className="text-white/50 text-sm mt-2">
              {message.desc}
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <AnimatePresence>

              {sortedSiswa.map((item, i) => (

                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-xl border border-red-500/20 bg-red-500/5"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                      {item.nama.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-white font-medium">
                        {item.nama}
                      </p>
                      <p className="text-white/50 text-xs">
                        {item.kelas}
                      </p>
                    </div>

                  </div>

                  <div className="mt-3 space-y-3">

                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                      Belum Scan
                    </span>

                    {canInput && (

                      <div className="grid grid-cols-3 gap-2">

                        <button
                          onClick={() => setManualAttendance(item, "izin")}
                          className="text-xs py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition"
                        >
                          Izin
                        </button>

                        <button
                          onClick={() => setManualAttendance(item, "sakit")}
                          className="text-xs py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition"
                        >
                          Sakit
                        </button>

                        <button
                          onClick={() => setManualAttendance(item, "alpha")}
                          className="text-xs py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                        >
                          Alpha
                        </button>

                      </div>

                    )}

                  </div>

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

        )}

      </div>

    </div>
  )
}

function Stat({ label, value, icon, green, red }: any) {

  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/10">

      <div className="text-white/50 text-xs flex items-center gap-2">
        {icon}
        {label}
      </div>

      <div className={cn(
        "text-lg font-semibold mt-1",
        green && "text-emerald-400",
        red && "text-red-400",
        !green && !red && "text-white"
      )}>
        {value}
      </div>

    </div>
  )
}