import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { startOfDay, endOfDay, subDays } from 'date-fns'

interface AIStats {
  totalSiswa: number
  hadirHariIni: number
  persenHariIni: number
  persenKemarin: number
  trend: number
  insight: string
  recommendation: string
}

export function useDashboardAI(selectedDate: Date, selectedKelas: string) {

  const [stats, setStats] = useState<AIStats>({
    totalSiswa: 0,
    hadirHariIni: 0,
    persenHariIni: 0,
    persenKemarin: 0,
    trend: 0,
    insight: '',
    recommendation: ''
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {

        // 🔹 TOTAL SISWA
        const siswaSnap = await getDocs(
          collection(db, 'siswa')
        )

        const totalSiswa = siswaSnap.size

        // 🔹 HARI INI
        const startToday = startOfDay(selectedDate)
        const endToday = endOfDay(selectedDate)

        const qToday = query(
          collection(db, 'absensi'),
          where('kelas', '==', selectedKelas),
          where('tanggal', '>=', startToday),
          where('tanggal', '<=', endToday)
        )

        const todaySnap = await getDocs(qToday)
        const hadirHariIni = todaySnap.size

        const persenHariIni =
          totalSiswa > 0
            ? Math.round((hadirHariIni / totalSiswa) * 100)
            : 0

        // 🔹 KEMARIN
        const yesterday = subDays(selectedDate, 1)
        const startYesterday = startOfDay(yesterday)
        const endYesterday = endOfDay(yesterday)

        const qYesterday = query(
          collection(db, 'absensi'),
          where('kelas', '==', selectedKelas),
          where('tanggal', '>=', startYesterday),
          where('tanggal', '<=', endYesterday)
        )

        const yesterdaySnap = await getDocs(qYesterday)
        const hadirKemarin = yesterdaySnap.size

        const persenKemarin =
          totalSiswa > 0
            ? Math.round((hadirKemarin / totalSiswa) * 100)
            : 0

        const trend = persenHariIni - persenKemarin

        // 🔥 AI LOGIC
        let insight = ''
        let recommendation = ''

        if (persenHariIni >= 95) {
          insight = 'Performa kehadiran sangat optimal.'
          recommendation = 'Pertahankan sistem monitoring saat ini.'
        }
        else if (persenHariIni >= 80) {
          insight = 'Kehadiran cukup stabil.'
          recommendation = 'Monitor siswa yang sering terlambat.'
        }
        else if (persenHariIni >= 60) {
          insight = 'Kehadiran menurun.'
          recommendation = 'Perlu evaluasi disiplin kelas.'
        }
        else {
          insight = 'Kehadiran dalam kondisi kritis.'
          recommendation = 'Segera lakukan investigasi dan komunikasi ke wali siswa.'
        }

        setStats({
          totalSiswa,
          hadirHariIni,
          persenHariIni,
          persenKemarin,
          trend,
          insight,
          recommendation
        })

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate, selectedKelas])

  return { stats, loading }
}