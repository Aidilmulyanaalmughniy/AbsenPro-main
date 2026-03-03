import { useEffect, useState } from 'react'
import type { StatData, ChartData } from '@/types'
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

interface UseStatsReturn {
  stats: StatData
  chartData: ChartData
  loading: boolean
  error: string | null
}

export function useStats(
  selectedDate: Date = new Date(),
  selectedKelas: string = 'all'
): UseStatsReturn {

  const [stats, setStats] = useState<StatData>({
    totalSiswa: 0,
    hadirHariIni: 0,
    belumAbsen: 0,
    persentaseKehadiran: 0
  })

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    data: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const startToday = startOfDay(selectedDate)
    const endToday = endOfDay(selectedDate)

    // =========================
    // LISTEN SISWA
    // =========================
    const unsubSiswa = onSnapshot(
      collection(db, 'siswa'),
      siswaSnap => {

        let siswaList = siswaSnap.docs.map(d => d.data())

        if (selectedKelas !== 'all') {
          siswaList = siswaList.filter(
            s => s.kelas === selectedKelas
          )
        }

        const totalSiswa = siswaList.length

        // =========================
        // LISTEN ABSENSI HARI INI
        // =========================
        const absensiQuery = query(
          collection(db, 'absensi'),
          where('tanggal', '>=', Timestamp.fromDate(startToday)),
          where('tanggal', '<=', Timestamp.fromDate(endToday))
        )

        const unsubAbsensi = onSnapshot(absensiQuery, absSnap => {

          let absensiData = absSnap.docs.map(d => d.data())

          if (selectedKelas !== 'all') {
            absensiData = absensiData.filter(
              a => a.kelas === selectedKelas
            )
          }

          const hadirHariIni = absensiData.filter(
            a => a.status === 'hadir'
          ).length

          const belumAbsen = Math.max(0, totalSiswa - hadirHariIni)

          const persentase =
            totalSiswa > 0
              ? Math.round((hadirHariIni / totalSiswa) * 100)
              : 0

          setStats({
            totalSiswa,
            hadirHariIni,
            belumAbsen,
            persentaseKehadiran: persentase
          })

          setLoading(false)
        })

        return () => unsubAbsensi()
      }
    )

    // =========================
    // GRAFIK 7 HARI TERAKHIR
    // =========================
    const sevenDaysAgo = subDays(selectedDate, 6)

    const weeklyQuery = query(
      collection(db, 'absensi'),
      where('tanggal', '>=', Timestamp.fromDate(startOfDay(sevenDaysAgo))),
      where('tanggal', '<=', Timestamp.fromDate(endToday))
    )

    const unsubWeekly = onSnapshot(weeklyQuery, snapshot => {

      const raw = snapshot.docs.map(d => d.data())

      const labels: string[] = []
      const values: number[] = []

      for (let i = 6; i >= 0; i--) {
        const date = subDays(selectedDate, i)
        labels.push(format(date, 'dd/MM'))

        const count = raw.filter(a => {
          const tgl = a.tanggal?.toDate?.()
          if (!tgl) return false

          return (
            format(tgl, 'yyyy-MM-dd') ===
              format(date, 'yyyy-MM-dd') &&
            a.status === 'hadir'
          )
        }).length

        values.push(count)
      }

      setChartData({ labels, data: values })
    })

    return () => {
      unsubSiswa()
      unsubWeekly()
    }
  }, [selectedDate, selectedKelas])

  return {
    stats,
    chartData,
    loading,
    error: null
  }
}