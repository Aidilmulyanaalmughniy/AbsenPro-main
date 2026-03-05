import { useEffect, useState } from "react"  
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"  
import { db } from "@/lib/firebase"  
import { startOfDay, endOfDay, subDays, format, isSameDay } from "date-fns"  
  
interface StudentRank {  
  nama: string  
  hadir: number  
}  
  
interface RiskStudent {  
  nama: string  
  alpha: number  
}  
  
interface Analytics {  
  average7Days: number  
  weeklyTrend: number  
  riskCount: number  
  bestDay: string  
  worstDay: string  
  insight: string  
  topStudents: StudentRank[]  
  riskStudents: RiskStudent[]  
}  
  
export function useAnalytics(  
  selectedDate: Date,  
  selectedKelas: string  
) {  
  
  const [analytics, setAnalytics] = useState<Analytics>({  
    average7Days: 0,  
    weeklyTrend: 0,  
    riskCount: 0,  
    bestDay: "-",  
    worstDay: "-",  
    insight: "",  
    topStudents: [],  
    riskStudents: []  
  })  
  
  const [chartData, setChartData] = useState({  
    labels: [] as string[],  
    data: [] as number[]  
  })  
  
  const [loading, setLoading] = useState(true)  
  
  useEffect(() => {  
  
    const fetchAnalytics = async () => {  
  
      setLoading(true)  
  
      try {  
  
        const start7 = startOfDay(subDays(selectedDate, 6))  
        const end7 = endOfDay(selectedDate)  
  
        let q  
  
        if (selectedKelas === "all") {  
  
          q = query(  
            collection(db, "absensi"),  
            where("tanggal", ">=", Timestamp.fromDate(start7)),  
            where("tanggal", "<=", Timestamp.fromDate(end7))  
          )  
  
        } else {  
  
          q = query(  
            collection(db, "absensi"),  
            where("kelas", "==", selectedKelas),  
            where("tanggal", ">=", Timestamp.fromDate(start7)),  
            where("tanggal", "<=", Timestamp.fromDate(end7))  
          )  
  
        }  
  
        const snap = await getDocs(q)  
  
        const rawData: any[] = []  
  
        snap.forEach(doc => rawData.push(doc.data()))  
  
        const labels: string[] = []  
        const data: number[] = []  
  
        const studentHadir: Record<string, number> = {}  
        const studentAlpha: Record<string, number> = {}  
  
        for (let i = 6; i >= 0; i--) {  
  
          const date = subDays(selectedDate, i)  
  
          const daily = rawData.filter(d => {  
  
            const tgl = d.tanggal?.toDate?.()  
  
            return tgl && isSameDay(tgl, date)  
  
          })  
  
          let hadir = 0  
          let total = 0  
  
          daily.forEach(d => {  
  
            total++  
  
            if (d.status === "hadir" || d.status === "terlambat") {  
  
              hadir++  
  
              if (!studentHadir[d.nama]) {  
                studentHadir[d.nama] = 0  
              }  
  
              studentHadir[d.nama]++  
  
            }  
  
            if (d.status === "alpha") {  
  
              if (!studentAlpha[d.nama]) {  
                studentAlpha[d.nama] = 0  
              }  
  
              studentAlpha[d.nama]++  
  
            }  
  
          })  
  
          const persen =  
            total > 0  
              ? Math.round((hadir / total) * 100)  
              : 0  
  
          labels.push(format(date, "EEE"))  
          data.push(persen)  
  
        }  
  
        const average =  
          data.length > 0  
            ? data.reduce((a, b) => a + b, 0) / data.length  
            : 0  
  
        const weeklyTrend =  
          data.length > 1  
            ? data[data.length - 1] - data[0]  
            : 0  
  
        const max = Math.max(...data)  
        const min = Math.min(...data)  
  
        let bestDay = "-"  
        let worstDay = "-"  
  
        if (max > 0) {  
          bestDay = labels[data.indexOf(max)]  
        }  
  
        if (min >= 0) {  
          worstDay = labels[data.indexOf(min)]  
        }  
  
        const topStudents = Object.entries(studentHadir)  
          .map(([nama, hadir]) => ({ nama, hadir }))  
          .sort((a, b) => b.hadir - a.hadir)  
          .slice(0, 5)  
  
        const riskStudents = Object.entries(studentAlpha)  
          .map(([nama, alpha]) => ({ nama, alpha }))  
          .sort((a, b) => b.alpha - a.alpha)  
  
        const riskCount = riskStudents.length  
  
        let insight = ""  
  
        if (average >= 90) {  
          insight = "Kehadiran sangat baik."  
        } else if (average >= 75) {  
          insight = "Kehadiran cukup stabil."  
        } else if (average >= 50) {  
          insight = "Kehadiran perlu ditingkatkan."  
        } else {  
          insight = "Kehadiran rendah. Perlu evaluasi disiplin."  
        }  
  
        if (riskCount > 0) {  
          insight += ` Terdapat ${riskCount} siswa dengan status alpha.`  
        }  
  
        setAnalytics({  
          average7Days: Math.round(average),  
          weeklyTrend,  
          riskCount,  
          bestDay,  
          worstDay,  
          insight,  
          topStudents,  
          riskStudents  
        })  
  
        setChartData({  
          labels,  
          data  
        })  
  
      } catch (err) {  
  
        console.error("Analytics error:", err)  
  
      } finally {  
  
        setLoading(false)  
  
      }  
  
    }  
  
    fetchAnalytics()  
  
  }, [selectedDate, selectedKelas])  
  
  return {  
    analytics,  
    chartData,  
    loading  
  }  
  
}