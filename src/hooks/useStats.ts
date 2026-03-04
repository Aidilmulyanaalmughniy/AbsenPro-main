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

import {
startOfDay,
endOfDay,
subDays,
format,
isSameDay
} from 'date-fns'

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

const [stats,setStats] = useState<StatData>({
totalSiswa:0,
hadirHariIni:0,
belumAbsen:0,
persentaseKehadiran:0
})

const [chartData,setChartData] = useState<ChartData>({
labels:[],
data:[]
})

const [loading,setLoading] = useState(true)

useEffect(()=>{

setLoading(true)

const startToday = startOfDay(selectedDate)
const endToday = endOfDay(selectedDate)

/* ===============================
LISTEN DATA SISWA
=============================== */

const unsubSiswa = onSnapshot(
collection(db,'siswa'),
siswaSnap=>{

let siswaList = siswaSnap.docs.map(d=>d.data())

if(selectedKelas !== 'all'){
siswaList = siswaList.filter(
s => s.kelas === selectedKelas
)
}

const totalSiswa = siswaList.length

/* ===============================
LISTEN ABSENSI HARI INI
=============================== */

const absensiQuery = query(
collection(db,'absensi'),
where('tanggal','>=',Timestamp.fromDate(startToday)),
where('tanggal','<=',Timestamp.fromDate(endToday))
)

const unsubAbsensi = onSnapshot(absensiQuery,absSnap=>{

let absensiData = absSnap.docs.map(d=>d.data())

if(selectedKelas !== 'all'){
absensiData = absensiData.filter(
a => a.kelas === selectedKelas
)
}

/* ===============================
HADIR
=============================== */

const hadirHariIni =
absensiData.filter(
a => a.status === 'hadir'
).length

/* ===============================
UID YANG SUDAH ABSEN
=============================== */

const scannedUID = new Set(
absensiData.map(a => a.uid_rfid)
)

/* ===============================
BELUM ABSEN
=============================== */

const belumAbsen =
siswaList.filter(
s => !scannedUID.has(s.uid_rfid)
).length

/* ===============================
PERSENTASE
=============================== */

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

return ()=>unsubAbsensi()

})

/* ===============================
GRAFIK 7 HARI TERAKHIR
=============================== */

const sevenDaysAgo = subDays(selectedDate,6)

const weeklyQuery = query(
collection(db,'absensi'),
where(
'tanggal',
'>=',
Timestamp.fromDate(startOfDay(sevenDaysAgo))
),
where(
'tanggal',
'<=',
Timestamp.fromDate(endToday)
)
)

const unsubWeekly = onSnapshot(weeklyQuery,snapshot=>{

let raw = snapshot.docs.map(d=>d.data())

if(selectedKelas !== 'all'){
raw = raw.filter(
a => a.kelas === selectedKelas
)
}

const labels:string[] = []
const values:number[] = []

for(let i=6;i>=0;i--){

const date = subDays(selectedDate,i)

labels.push(format(date,'dd/MM'))

const hadirCount = raw.filter(a=>{

const tgl = a.tanggal?.toDate?.()

if(!tgl) return false

return (
isSameDay(tgl,date) &&
a.status === 'hadir'
)

}).length

values.push(hadirCount)

}

setChartData({
labels,
data:values
})

})

return ()=>{
unsubSiswa()
unsubWeekly()
}

},[selectedDate,selectedKelas])

return {
stats,
chartData,
loading,
error:null
}

}