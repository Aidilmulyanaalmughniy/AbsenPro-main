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

/* RESET STATE AGAR DATA LAMA HILANG */

setAnalytics({
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

setChartData({
labels:[],
data:[]
})

try{

const kelasFilter =
selectedKelas === "all"
? "all"
: selectedKelas.trim()

/* ================= QUERY ABSENSI ================= */

const start7 = startOfDay(subDays(selectedDate,6))
const end7 = endOfDay(selectedDate)

let absensiQuery

if(kelasFilter==="all"){

absensiQuery = query(
collection(db,"absensi"),
where("createdAt",">=",Timestamp.fromDate(start7)),
where("createdAt","<=",Timestamp.fromDate(end7))
)

}else{

absensiQuery = query(
collection(db,"absensi"),
where("kelas","==",kelasFilter),
where("createdAt",">=",Timestamp.fromDate(start7)),
where("createdAt","<=",Timestamp.fromDate(end7))
)

}

const snap = await getDocs(absensiQuery)

const rawData:any[]=[]

snap.forEach(doc=>{
rawData.push(doc.data())
})

/* ================= DATA KOSONG ================= */

if(rawData.length===0){

setChartData({
labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
data:[0,0,0,0,0,0,0]
})

setLoading(false)
return
}

/* ================= ANALYTICS ================= */

const labels:string[]=[]
const data:number[]=[]

const studentHadir:Record<string,number>={}
const studentAlpha:Record<string,number>={}

let latestLate:any=null

for(let i=6;i>=0;i--){

const date = subDays(selectedDate,i)

const daily = rawData.filter(d=>{

let tgl:Date | null = null

if(d.createdAt?.toDate){
tgl = d.createdAt.toDate()
}

return tgl && isSameDay(tgl,date)

})

let hadir=0

daily.forEach(d=>{

const status = (d.status || "").toLowerCase()

/* HADIR */

if(status==="hadir" || status==="terlambat"){
hadir++
studentHadir[d.nama] = (studentHadir[d.nama] || 0) + 1
}

/* ALPHA */

if(status==="alpha"){
studentAlpha[d.nama] = (studentAlpha[d.nama] || 0) + 1
}

/* DATANG PALING SIANG */

if(status==="terlambat" && d.waktu_scan){

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

/* ================= SUMMARY ================= */

const average =
data.length
? data.reduce((a,b)=>a+b,0)/data.length
:0

const weeklyTrend =
data.length>1
? data[data.length-1]-data[0]
:0

const max = Math.max(...data)
const min = Math.min(...data)

const bestDay = max>0 ? labels[data.indexOf(max)] : "-"
const worstDay = min>=0 ? labels[data.indexOf(min)] : "-"

/* ================= TOP STUDENTS ================= */

const topStudents = Object.entries(studentHadir)
.map(([nama,hadir])=>({nama,hadir}))
.sort((a,b)=>b.hadir-a.hadir)
.slice(0,5)

/* ================= RISK ================= */

const riskStudents = Object.entries(studentAlpha)
.map(([nama,alpha])=>({nama,alpha}))
.sort((a,b)=>b.alpha-a.alpha)

const riskCount = riskStudents.length

/* ================= INSIGHT ================= */

let insight=""

if(average >= 20){
insight="Kehadiran sangat baik."
}
else if(average >= 10){
insight="Kehadiran cukup stabil."
}
else{
insight="Kehadiran rendah. Perlu evaluasi disiplin."
}

if(riskCount>0){
insight += ` ${riskCount} siswa memiliki status alpha.`
}

/* ================= SET STATE ================= */

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