import { BelumAbsenList } from "@/components/BelumAbsenList"
import { FilterBar } from "@/components/FilterBar"
import { useStudents } from "@/hooks/useStudents"
import { useAttendance } from "@/hooks/useAttendance"
import { useApp } from "@/context/AppContext"
import { motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"

export function BelumAbsen() {

  const { selectedKelas, selectedDate } = useApp()

  const { siswa, loading: loadingSiswa } =
    useStudents(selectedKelas)

  const { absensi, loading: loadingAbsensi } =
    useAttendance(selectedDate, selectedKelas)

  /* ===============================
     REALTIME CLOCK
  =============================== */

  const [now, setNow] = useState(new Date())

  useEffect(() => {

    const interval = setInterval(() => {
      setNow(new Date())
    }, 10000) // update tiap 10 detik

    return () => clearInterval(interval)

  }, [])

  /* ===============================
     STATS CALCULATION
  =============================== */

  const stats = useMemo(() => {

    const batas = new Date()
    batas.setHours(15, 10, 0, 0) // batas absensi

    const hadirStatuses = ["hadir", "terlambat"]
    const tidakHadirStatuses = ["sakit", "izin", "alpha"]

    /* ===============================
       HITUNG HADIR
    =============================== */

    const hadirCount = absensi.filter(a =>
      hadirStatuses.includes(a.status)
    ).length

    /* ===============================
       HITUNG TIDAK HADIR DARI DB
    =============================== */

    const tidakHadirDariDB = absensi.filter(a =>
      tidakHadirStatuses.includes(a.status)
    ).length

    /* ===============================
       UID YANG SUDAH SCAN
    =============================== */

    const scannedRFIDs = new Set(
      absensi.map(a => a.uid_rfid)
    )

    /* ===============================
       SISWA BELUM SCAN
    =============================== */

    const rawBelumScan = siswa.filter(
      s => !scannedRFIDs.has(s.uid_rfid)
    )

    /* ===============================
       SEBELUM 15:10 → BELUM SCAN
    =============================== */

    const belumScan =
      now < batas ? rawBelumScan : []

    const belumCount = belumScan.length

    /* ===============================
       SETELAH 15:10 → ALPHA
    =============================== */

    const tidakHadirCount =
      now >= batas
        ? tidakHadirDariDB + rawBelumScan.length
        : tidakHadirDariDB

    return {

      totalSiswa: siswa.length,

      hadirCount,

      tidakHadirCount,

      belumCount,

      belumScan

    }

  }, [siswa, absensi, now])

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