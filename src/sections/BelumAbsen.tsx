import { BelumAbsenList } from '@/components/BelumAbsenList'
import { FilterBar } from '@/components/FilterBar'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useAttendance'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

export function BelumAbsen() {
  const { selectedKelas, selectedDate } = useApp()

  const { siswa, loading: loadingSiswa } =
    useStudents(selectedKelas)

  const { absensi, loading: loadingAbsensi } =
    useAttendance(selectedDate, selectedKelas)

  const stats = useMemo(() => {
    const now = new Date()

    const batas = new Date()
    batas.setHours(15, 10, 0, 0) // 15:10

    const hadirStatuses = ['hadir', 'terlambat']
    const tidakHadirStatuses = ['sakit', 'izin', 'alpha']

    const hadirCount = absensi.filter(a =>
      hadirStatuses.includes(a.status)
    ).length

    const tidakHadirDariDB = absensi.filter(a =>
      tidakHadirStatuses.includes(a.status)
    ).length

    const scannedRFIDs = new Set(
      absensi.map(a => a.uid_rfid)
    )

    const belumScan = siswa.filter(
      s => !scannedRFIDs.has(s.uid_rfid)
    )

    const belumAbsenCount =
      now < batas ? belumScan.length : 0

    const tidakHadirTambahan =
      now >= batas ? belumScan.length : 0

    const tidakHadirCount =
      tidakHadirDariDB + tidakHadirTambahan

    return {
      totalSiswa: siswa.length,
      hadirCount,
      tidakHadirCount,
      belumCount: belumAbsenCount,
      belumScan,
    }
  }, [siswa, absensi])

  const loading = loadingSiswa || loadingAbsensi

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <FilterBar />

      <BelumAbsenList
        siswa={stats.belumScan}
        totalSiswa={stats.totalSiswa}
        hadirCount={stats.hadirCount}
        tidakHadirCount={stats.tidakHadirCount}
        belumCount={stats.belumCount}
        loading={loading}
      />
    </motion.div>
  )
}