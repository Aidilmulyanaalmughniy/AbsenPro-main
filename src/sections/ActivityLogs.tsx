import { useMemo, useState } from "react"
import { useRealtimeCollection } from "@/hooks/useRealtimeCollection"
import { db } from "@/lib/firebase"

import {
collection,
doc,
deleteDoc,
Timestamp,
getDocs
} from "firebase/firestore"

import {
Activity,
PlusCircle,
Trash2,
Edit,
Shield,
Database,
Search
} from "lucide-react"

import { format, isToday, isYesterday } from "date-fns"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface LogData{
id:string
action:string
performedBy:string
role?:string
targetName?:string
timestamp?:Timestamp
}

export function ActivityLogs(){

const { userRole } = useAuth()

const { data:logs,loading } =
useRealtimeCollection<LogData>("activity_logs")

const [search,setSearch] = useState("")

/* ================= SORT ================= */

const sortedLogs = useMemo(()=>{

return [...logs].sort((a,b)=>{

const t1 = a.timestamp?.toMillis() || 0
const t2 = b.timestamp?.toMillis() || 0

return t2 - t1

})

},[logs])

/* ================= FILTER ================= */

const filteredLogs = useMemo(()=>{

return sortedLogs.filter(log=>

log.action.toLowerCase().includes(search.toLowerCase()) ||
log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
log.targetName?.toLowerCase().includes(search.toLowerCase())

)

},[sortedLogs,search])

/* ================= STATS ================= */

const stats = useMemo(()=>{

return{

total:logs.length,
add:logs.filter(l=>l.action.includes("ADD")).length,
update:logs.filter(l=>l.action.includes("UPDATE")).length,
delete:logs.filter(l=>l.action.includes("DELETE")).length

}

},[logs])

/* ================= GROUP BY DATE ================= */

const groupedLogs = useMemo(()=>{

const groups:Record<string,LogData[]> = {}

filteredLogs.forEach(log=>{

if(!log.timestamp) return

const date = log.timestamp.toDate()

let label = format(date,"dd MMM yyyy")

if(isToday(date)) label="Hari Ini"
if(isYesterday(date)) label="Kemarin"

if(!groups[label]) groups[label]=[]

groups[label].push(log)

})

return groups

},[filteredLogs])

/* ================= ICON ================= */

const getIcon=(action:string)=>{

if(action.includes("ADD")) return <PlusCircle size={16}/>
if(action.includes("DELETE")) return <Trash2 size={16}/>
if(action.includes("UPDATE")) return <Edit size={16}/>
if(action.includes("ROLE")) return <Shield size={16}/>

return <Database size={16}/>
}

/* ================= BADGE ================= */

const getBadgeColor=(action:string)=>{

if(action.includes("ADD"))
return "bg-emerald-500/10 text-emerald-400"

if(action.includes("DELETE"))
return "bg-red-500/10 text-red-400"

if(action.includes("UPDATE"))
return "bg-yellow-500/10 text-yellow-400"

if(action.includes("ROLE"))
return "bg-purple-500/10 text-purple-400"

return "bg-cyan-500/10 text-cyan-400"
}

/* ================= DELETE LOG ================= */

const deleteLog = async(id:string)=>{

if(userRole!=="owner" && userRole!=="developer"){
toast.error("Tidak memiliki izin")
return
}

if(!confirm("Hapus log ini?")) return

try{

await deleteDoc(doc(db,"activity_logs",id))

toast.success("Log berhasil dihapus")

}catch{

toast.error("Gagal menghapus log")

}

}

/* ================= CLEAR ALL ================= */

const clearLogs = async()=>{

if(userRole!=="owner"){
toast.error("Hanya owner yang bisa menghapus semua log")
return
}

if(!confirm("Hapus SEMUA activity logs?")) return

try{

const snap = await getDocs(collection(db,"activity_logs"))

const promises = snap.docs.map(d=>deleteDoc(d.ref))

await Promise.all(promises)

toast.success("Semua log berhasil dihapus")

}catch{

toast.error("Gagal menghapus semua log")

}

}

return(

<div className="space-y-8">

{/* HEADER */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

<div className="flex items-center gap-3">

<Activity className="text-cyan-400"/>

<h1 className="text-3xl font-bold">
Activity Logs
</h1>

</div>

{/* SEARCH */}

<div className="flex gap-3">

<div className="relative w-64">

<Search
size={16}
className="absolute left-3 top-3 text-white/40"
/>

<input
placeholder="Cari aktivitas..."
value={search}
onChange={e=>setSearch(e.target.value)}
className="w-full bg-[#1e293b] border border-white/10 pl-10 pr-4 py-2 rounded-xl outline-none"
/>

</div>

{userRole==="owner" &&(

<button
onClick={clearLogs}
className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
>

<Trash2 size={16}/>
Clear Logs

</button>

)}

</div>

</div>

{/* STATS */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{[
{label:"Total",value:stats.total},
{label:"Tambah",value:stats.add},
{label:"Update",value:stats.update},
{label:"Delete",value:stats.delete}
].map((s,i)=>(

<motion.div
key={i}
whileHover={{y:-3}}
className="bg-[#1e293b] border border-white/10 rounded-xl p-4"
>

<div className="text-xs text-white/50">
{s.label}
</div>

<div className="text-2xl font-bold">
{s.value}
</div>

</motion.div>

))}

</div>

{/* LOGS */}

<div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">

{loading?(

<div className="py-20 text-center text-white/40">
Loading logs...
</div>

):Object.keys(groupedLogs).length===0?(

<div className="py-20 text-center text-white/40">
Belum ada aktivitas
</div>

):( 

<div className="space-y-8 max-h-[650px] overflow-y-auto pr-2">

{Object.entries(groupedLogs).map(([date,items])=>(

<div key={date} className="space-y-4">

<h3 className="text-sm text-white/50 font-semibold">
{date}
</h3>

{items.map((log,index)=>{

const time = log.timestamp
? format(log.timestamp.toDate(),"HH:mm:ss")
: "-"

return(

<motion.div
key={log.id}
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
transition={{delay:index*0.02}}
whileHover={{scale:1.01}}
className="bg-[#0f172a]/80 border border-white/10 rounded-xl p-4 flex justify-between items-center"
>

<div className="flex items-center gap-4">

<div className={`p-2 rounded-lg ${getBadgeColor(log.action)}`}>
{getIcon(log.action)}
</div>

<div>

<div className="flex gap-2">

<span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(log.action)}`}>
{log.action}
</span>

{log.role &&(
<span className="text-xs text-cyan-400">
{log.role}
</span>
)}

</div>

<div className="text-sm text-white/70">

<span className="font-semibold text-white">
{log.performedBy}
</span>

{log.targetName &&(
<>
{" "}→{" "}
<span className="text-white/50">
{log.targetName}
</span>
</>
)}

</div>

</div>

</div>

<div className="flex items-center gap-4">

<div className="text-xs text-white/40">
{time}
</div>

{(userRole==="owner" || userRole==="developer") &&(

<button
onClick={()=>deleteLog(log.id)}
className="text-red-400 hover:text-red-300"
>

<Trash2 size={16}/>

</button>

)}

</div>

</motion.div>

)

})}

</div>

))}

</div>

)}

</div>

</div>

)

}