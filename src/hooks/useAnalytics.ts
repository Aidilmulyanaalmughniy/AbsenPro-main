import { useEffect, useState } from "react"
import {
collection,
query,
where,
getDocs
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
startOfDay,
endOfDay,
subDays,
format,
isSameDay
} from "date-fns"

interface Analytics {
average7Days: number
weeklyTrend: number
riskCount: number
bestDay: string
worstDay: string
insight: string
}

export function useAnalytics(
selectedDate: Date,
selectedKelas: string
) {

const [analytics,setAnalytics] =
useState<Analytics>({
average7Days:0,
weeklyTrend:0,
riskCount:0,
bestDay:"-",
worstDay:"-",
insight:""
})

const [chartData,setChartData] = useState({
labels:[] as string[],
data:[] as number[]
})

const [loading,setLoading] = useState(true)

useEffect(()=>{

const fetchAnalytics = async ()=>{

setLoading(true)

try{

const start7 = startOfDay(subDays(selectedDate,6))
const end7 = endOfDay(selectedDate)

/* ===========================
QUERY ABSENSI
=========================== */

let q

if(selectedKelas === "Semua"){

q = query(
collection(db,"absensi"),
where("tanggal",">=",start7),
where("tanggal","<=",end7)
)

}else{

q = query(
collection(db,"absensi"),
where("kelas","==",selectedKelas),
where("tanggal",">=",start7),
where("tanggal","<=",end7)
)

}

const snap = await getDocs(q)

const rawData:any[] = []

snap.forEach(doc=>{
rawData.push(doc.data())
})

/* ===========================
ANALYTICS PROCESS
=========================== */

const labels:string[] = []
const data:number[] = []

const studentAlpha:Record<string,number> = {}

for(let i=6;i>=0;i--){

const date = subDays(selectedDate,i)

const daily = rawData.filter(d =>
isSameDay(d.tanggal.toDate(),date)
)

let hadir = 0
let total = daily.length

daily.forEach(d=>{

if(d.status === "hadir")
hadir++

if(d.status === "alpha"){

if(!studentAlpha[d.nama])
studentAlpha[d.nama]=0

studentAlpha[d.nama]++

}

})

const persen =
total>0
? Math.round((hadir/total)*100)
: 0

labels.push(format(date,"EEE"))
data.push(persen)

}

/* ===========================
SUMMARY
=========================== */

const average7Days =
data.reduce((a,b)=>a+b,0)/data.length

const weeklyTrend =
data[data.length-1]-data[0]

const max = Math.max(...data)
const min = Math.min(...data)

const bestDay =
labels[data.indexOf(max)]

const worstDay =
labels[data.indexOf(min)]

const riskCount =
Object.values(studentAlpha)
.filter(v=>v>=2).length

/* ===========================
SMART INSIGHT
=========================== */

let insight = ""

if(average7Days >= 95)
insight =
"Kehadiran sangat optimal. Sistem berjalan sangat baik."

else if(average7Days >= 85)
insight =
"Performa kehadiran stabil dan cukup tinggi."

else if(average7Days >= 70)
insight =
"Kehadiran cukup namun perlu monitoring."

else
insight =
"Kehadiran rendah. Perlu evaluasi segera."

setAnalytics({
average7Days:Math.round(average7Days),
weeklyTrend,
riskCount,
bestDay,
worstDay,
insight
})

setChartData({labels,data})

}catch(err){

console.error(err)

}finally{

setLoading(false)

}

}

fetchAnalytics()

},[selectedDate,selectedKelas])

return {
analytics,
chartData,
loading
}

}