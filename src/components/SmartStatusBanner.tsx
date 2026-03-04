import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Props {
  total: number
  hadir: number
  yesterdayPercent?: number
  maintenanceMode?: boolean
}

export function SmartStatusBanner({
  total,
  hadir,
  yesterdayPercent = 0,
  maintenanceMode = false
}: Props) {

  const persen =
    total > 0 ? Math.round((hadir / total) * 100) : 0

  const now = new Date()
  const waktuSekarang = now.getHours() * 60 + now.getMinutes()
  const batasTutup = 15 * 60 + 10

  const isClosed = waktuSekarang > batasTutup

  let title = ''
  let desc = ''
  let color = 'text-white'
  let icon: any = null

  if (maintenanceMode) {
    title = 'Sistem Sedang Ditutup'
    desc = 'Mode libur atau maintenance aktif'
    color = 'text-gray-400'
    icon = <XCircle size={22} />
  }
  else if (isClosed) {
    title = 'Absensi Ditutup'
    desc = 'Waktu absensi telah berakhir'
    color = 'text-red-400'
    icon = <Clock size={22} />
  }
  else if (persen >= 90) {
    title = 'Sangat Baik'
    desc = 'Tingkat kehadiran sangat tinggi'
    color = 'text-emerald-400'
    icon = <CheckCircle size={22} />
  }
  else if (persen >= 70) {
    title = 'Cukup Baik'
    desc = 'Kehadiran cukup stabil'
    color = 'text-yellow-400'
    icon = <CheckCircle size={22} />
  }
  else {
    title = 'Perlu Perhatian'
    desc = 'Tingkat kehadiran masih rendah'
    color = 'text-red-400'
    icon = <AlertTriangle size={22} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-md p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <div className={color}>
            {icon}
          </div>

          <div>
            <h2 className={`text-lg font-semibold ${color}`}>
              {title}
            </h2>
            <p className="text-white/60 text-sm">
              {desc}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (HANYA SAAT ABSENSI AKTIF) */}
        {!maintenanceMode && !isClosed && (
          <div className="text-right">
            <div className={`text-3xl font-bold ${color}`}>
              {persen}%
            </div>
            <div className="text-white/40 text-xs">
              Kehadiran
            </div>
          </div>
        )}

      </div>
    </motion.div>
  )
}