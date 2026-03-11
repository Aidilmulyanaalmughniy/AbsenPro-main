import { useEffect, useState } from "react"
import {
collection,
query,
where,
getDocs,
Timestamp
} from "firebase/firestore"

import { db } from "@/lib/firebase"

import {
startOfDay,
endOfDay,
subDays,
format,
isSameDay
} from "date-fns"

interface StudentRank{
nama:string
hadir:number
}

interface RiskStudent{
nama:string
alpha:number
}

interface LateStudent{
nama:string
jam:string
}

interface Analytics{
average7Days:number
weeklyTrend:number
riskCount:number
bestDay:string
worstDay:string
insight:string
topStudents:StudentRank[]
riskStudents:RiskStudent[]
latestLate?:LateStudent
}

export function useAnalytics(
selectedDate:Date,
selectedKelas:string
){

const [analytics,setAnalytics] = useState<Analytics>({
average7Days:0,
weeklyTrend:0,
riskCount:0,
bestDay:"-",
worstDay:"-",
insight:"",
topStudents:[],
riskStudents:[],
latestLate:undefined
})

const [chartData,setChartData] = useState({
labels:[] as string[],
data:[] as number[]
})

const [loading,setLoading] = useState(true)

useEffect(()=>{

const fetchAnalytics = async()=>{

setLoading(true)

try{

/* NORMALISASI KELAS */
const kelasFilter =
selectedKelas === "all"
? "all"
: selectedKelas.trim()

/* TOTAL SISWA */

let siswaQuery

if(kelasFilter==="all"){
siswaQuery = collection(db,"siswa")
}
else{
siswaQuery = query(
collection(db,"siswa"),
where("kelas","==",kelasFilter)
)
}

const siswaSnap = await getDocs(siswaQuery)
const totalSiswa = siswaSnap.size

/* ABSENSI QUERY */

const start7 = startOfDay(subDays(selectedDate,6))
const end7 = endOfDay(selectedDate)

let absensiQuery

if(kelasFilter==="all"){
absensiQuery = query(
collection(db,"absensi"),
where("tanggal",">=",Timestamp.fromDate(start7)),
where("tanggal","<=",Timestamp.fromDate(end7))
)
}
else{
absensiQuery = query(
collection(db,"absensi"),
where("kelas","==",kelasFilter),
where("tanggal",">=",Timestamp.fromDate(start7)),
where("tanggal","<=",Timestamp.fromDate(end7))
)
}

const snap = await getDocs(absensiQuery)

const rawData:any[]=[]
snap.forEach(doc=>rawData.push(doc.data()))

/* ANALYTICS */

const labels:string[]=[]
const data:number[]=[]

const studentHadir:Record<string,number>={}
const studentAlpha:Record<string,number>={}

let latestLate:any=null

for(let i=6;i>=0;i--){

const date = subDays(selectedDate,i)

const daily = rawData.filter(d=>{

let tgl:Date | null = null

if(d.tanggal?.toDate){
tgl = d.tanggal.toDate()
}

else if(typeof d.tanggal === "string"){
tgl = new Date(d.tanggal)
}

return tgl && isSameDay(tgl,date)

})

let hadir=0

daily.forEach(d=>{

const status = (d.status || "").toLowerCase()

if(status==="hadir" || status==="terlambat"){
hadir++
studentHadir[d.nama] = (studentHadir[d.nama] || 0) + 1
}

if(status==="alpha"){
studentAlpha[d.nama] = (studentAlpha[d.nama] || 0) + 1
}

let tgl:Date | null = null

if(d.tanggal?.toDate){
tgl = d.tanggal.toDate()
}

if(
status==="terlambat" &&
d.waktu_scan &&
tgl &&
isSameDay(tgl,selectedDate)
){

const scanTime = d.waktu_scan.toDate()
const h = scanTime.getHours()
const m = scanTime.getMinutes()

const minutes = h*60+m

if(!latestLate || minutes > latestLate.minutes){

latestLate = {
nama:d.nama,
jam:`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`,
minutes
}

}

}

})

labels.push(format(date,"EEE"))
data.push(hadir)

}

/* SUMMARY */

const average =
data.length
? data.reduce((a,b)=>a+b,0)/data.length
:0

const weeklyTrend =
data.length>1
? data[data.length-1]-data[0]
:0

const max = data.length ? Math.max(...data) : 0
const min = data.length ? Math.min(...data) : 0

const bestDay = max>0 ? labels[data.indexOf(max)] : "-"
const worstDay = min>=0 ? labels[data.indexOf(min)] : "-"

/* TOP STUDENTS */

const topStudents = Object.entries(studentHadir)
.map(([nama,hadir])=>({nama,hadir}))
.sort((a,b)=>b.hadir-a.hadir)
.slice(0,5)

/* RISK */

const riskStudents = Object.entries(studentAlpha)
.map(([nama,alpha])=>({nama,alpha}))
.sort((a,b)=>b.alpha-a.alpha)

const riskCount = riskStudents.length

/* INSIGHT */

let insight=""

if(totalSiswa>0){

const avgHadir = Math.round(average)

if(avgHadir >= totalSiswa * 0.9){
insight="Kehadiran sangat baik."
}
else if(avgHadir >= totalSiswa * 0.7){
insight="Kehadiran cukup stabil."
}
else if(avgHadir >= totalSiswa * 0.5){
insight="Kehadiran perlu ditingkatkan."
}
else{
insight="Kehadiran rendah. Perlu evaluasi disiplin."
}

}

if(riskCount>0){
insight += ` Terdapat ${riskCount} siswa dengan status alpha.`
}

/* SET STATE */

setAnalytics({

average7Days:Math.round(average),
weeklyTrend,
riskCount,
bestDay,
worstDay,
insight,
topStudents,
riskStudents,
latestLate: latestLate
? {nama:latestLate.nama,jam:latestLate.jam}
: undefined

})

setChartData({
labels,
data
})

}catch(err){

console.error("Analytics error:",err)

}finally{

setLoading(false)

}

}

fetchAnalytics()

},[selectedDate,selectedKelas])

return{
analytics,
chartData,
loading
}

}