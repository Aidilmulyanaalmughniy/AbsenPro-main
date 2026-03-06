import {
TrendingUp,
AlertTriangle,
Award,
BarChart3,
Clock
} from "lucide-react"

import { FilterBar } from "@/components/FilterBar"
import { WeeklyChart } from "@/components/WeeklyChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useApp } from "@/context/AppContext"

import { motion } from "framer-motion"

export function Dashboard(){

const { selectedKelas, selectedDate } = useApp()

const { analytics, chartData, loading } =
useAnalytics(selectedDate, selectedKelas)

if(loading){
return(
<div className="text-white/60 p-10">
Memuat analytics...
</div>
)
}

return(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
transition={{duration:0.4}}
className="space-y-10"
>

{/* HEADER */}

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

<div>
<h1 className="text-3xl font-bold text-white">
Analytics Dashboard
</h1>

<p className="text-white/50 mt-1">
Analisis performa kehadiran siswa
</p>
</div>

<span className="flex items-center gap-2 text-emerald-400 text-sm">
<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
Realtime
</span>

</div>

<FilterBar/>

{/* KPI */}

<div className="grid grid-cols-2 md:grid-cols-5 gap-6">

<KpiCard
title="Rata-rata Kehadiran"
value={`${analytics.average7Days}%`}
icon={<TrendingUp size={18}/>}
/>

<KpiCard
title="Trend Mingguan"
value={`${analytics.weeklyTrend}%`}
icon={<BarChart3 size={18}/>}
/>

<KpiCard
title="Hari Terbaik"
value={analytics.bestDay || "-"}
icon={<Award size={18}/>}
/>

<KpiCard
title="Siswa Berisiko"
value={`${analytics.riskCount}`}
icon={<AlertTriangle size={18}/>}
/>

<KpiCard
title="Datang Paling Siang"
value={analytics.latestLate?.nama || "-"}
icon={<Clock size={18}/>}
/>

</div>

{/* CHART */}

<motion.div
whileHover={{scale:1.01}}
className="rounded-3xl bg-[#1e293b]/70 border border-white/10 p-8 shadow-2xl"
>

<h3 className="text-white font-semibold mb-6 flex items-center gap-2">
<BarChart3 size={18}/>
Grafik Kehadiran Mingguan
</h3>

<WeeklyChart
labels={chartData.labels}
data={chartData.data}
/>

</motion.div>

{/* TOP & RISK */}

<div className="grid md:grid-cols-2 gap-8">

{/* TOP STUDENTS */}

<motion.div
whileHover={{scale:1.02}}
className="rounded-3xl bg-[#1e293b]/70 border border-white/10 p-8 shadow-xl"
>

<h3 className="text-white font-semibold mb-6 flex items-center gap-2">
<Award size={18}/>
Siswa Paling Rajin
</h3>

<div className="space-y-3">

{analytics.topStudents?.length === 0 && (
<p className="text-white/50">
Belum ada data
</p>
)}

{analytics.topStudents?.map((s,i)=>(
<div
key={i}
className="flex justify-between bg-white/5 p-3 rounded-xl"
>

<span className="text-white">
{i+1}. {s.nama}
</span>

<span className="text-emerald-400 font-semibold">
{s.hadir} hadir
</span>

</div>
))}

</div>

</motion.div>

{/* RISK */}

<motion.div
whileHover={{scale:1.02}}
className="rounded-3xl bg-[#1e293b]/70 border border-white/10 p-8 shadow-xl"
>

<h3 className="text-white font-semibold mb-6 flex items-center gap-2">
<AlertTriangle size={18}/>
Siswa Berisiko Disiplin
</h3>

<div className="space-y-3">

{analytics.riskStudents?.length === 0 && (
<p className="text-white/50">
Tidak ada siswa berisiko
</p>
)}

{analytics.riskStudents?.map((s,i)=>(
<div
key={i}
className="flex justify-between bg-red-500/10 p-3 rounded-xl"
>

<span className="text-white">
{s.nama}
</span>

<span className="text-red-400 font-semibold">
{s.alpha} alpha
</span>

</div>
))}

</div>

</motion.div>

</div>

{/* LATEST LATE */}

<motion.div
whileHover={{scale:1.01}}
className="rounded-3xl bg-[#1e293b]/70 border border-white/10 p-8 shadow-xl"
>

<h3 className="text-white font-semibold mb-6 flex items-center gap-2">
<Clock size={18}/>
Datang Paling Siang
</h3>

{analytics.latestLate ?(

<div className="flex justify-between bg-yellow-500/10 p-4 rounded-xl">

<span className="text-white">
{analytics.latestLate.nama}
</span>

<span className="text-yellow-400 font-semibold">
{analytics.latestLate.jam}
</span>

</div>

):(  

<p className="text-white/50">
Tidak ada data keterlambatan
</p>

)}

</motion.div>

{/* INSIGHT */}

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-8 shadow-2xl"
>

<h3 className="text-white font-semibold mb-4">
Insight Otomatis
</h3>

<p className="text-white/70 leading-relaxed">
{analytics.insight}
</p>

<p className="text-white/40 text-sm mt-4">
Hari terburuk minggu ini: {analytics.worstDay}
</p>

</motion.div>

</motion.div>

)

}

function KpiCard({
title,
value,
icon
}:{
title:string
value:string
icon:React.ReactNode
}){

return(

<motion.div
whileHover={{scale:1.03}}
className="rounded-3xl bg-[#1e293b]/70 border border-white/10 p-6 shadow-xl relative overflow-hidden"
>

<div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/20 blur-3xl rounded-full"/>

<div className="flex justify-between text-white/60 text-sm">
<span>{title}</span>
{icon}
</div>

<h2 className="text-2xl md:text-3xl font-bold text-white mt-4 break-words">
{value}
</h2>

</motion.div>

)

}