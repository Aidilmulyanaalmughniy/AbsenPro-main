import { useState, useMemo, useEffect } from "react"
import { useRealtimeCollection } from "@/hooks/useRealtimeCollection"
import { db, app } from "@/lib/firebase"

import {
doc,
updateDoc,
deleteDoc,
setDoc,
serverTimestamp,
onSnapshot
} from "firebase/firestore"

import { initializeApp, getApps } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

import {
Trash2,
Search,
Plus,
Shield,
Users,
Crown,
X
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface UserData{
id:string
username:string
email:string
role:"admin"|"developer"|"owner"
}

export function OwnerPanel(){

const { user,userRole } = useAuth()

const { data:users,loading } =
useRealtimeCollection<UserData>("users")

const [search,setSearch] = useState("")
const [showModal,setShowModal] = useState(false)
const [creating,setCreating] = useState(false)
const [maintenanceMode,setMaintenanceMode] = useState(false)

const [newUser,setNewUser] = useState({
username:"",
email:"",
password:"",
role:"admin"
})

/* ================= MAINTENANCE LISTENER ================= */

useEffect(()=>{

const ref = doc(db,"settings","attendance_control")

const unsub = onSnapshot(ref,snap=>{
if(snap.exists()){
setMaintenanceMode(
snap.data()?.maintenanceMode===true
)
}
})

return ()=>unsub()

},[])

/* ================= SUMMARY ================= */

const summary = useMemo(()=>({

total:users.length,
admin:users.filter(u=>u.role==="admin").length,
developer:users.filter(u=>u.role==="developer").length,
owner:users.filter(u=>u.role==="owner").length

}),[users])

const filteredUsers = useMemo(()=>{

return users.filter(u=>
u.username.toLowerCase().includes(search.toLowerCase()) ||
u.email.toLowerCase().includes(search.toLowerCase())
)

},[users,search])

/* ================= ACTIONS ================= */

const toggleMaintenance = async()=>{

await updateDoc(
doc(db,"settings","attendance_control"),
{maintenanceMode:!maintenanceMode}
)

toast.success(
maintenanceMode
? "Mode Libur Dinonaktifkan"
: "Mode Libur Diaktifkan"
)

}

const handleRoleChange = async(id:string,role:string)=>{

if(user?.uid===id){
toast.error("Tidak bisa mengubah role sendiri")
return
}

await updateDoc(doc(db,"users",id),{role})

}

const handleDelete = async(id:string)=>{

if(user?.uid===id){
toast.error("Tidak bisa menghapus diri sendiri")
return
}

await deleteDoc(doc(db,"users",id))

}

const handleCreate = async()=>{

if(!newUser.username || !newUser.email || !newUser.password){
toast.error("Semua field wajib diisi")
return
}

try{

setCreating(true)

let secondaryApp

const existing = getApps().find(a=>a.name==="Secondary")

if(existing){
secondaryApp = existing
}else{
secondaryApp = initializeApp(app.options,"Secondary")
}

const secondaryAuth = getAuth(secondaryApp)

const cred = await createUserWithEmailAndPassword(
secondaryAuth,
newUser.email,
newUser.password
)

await setDoc(doc(db,"users",cred.user.uid),{
username:newUser.username,
email:newUser.email,
role:newUser.role,
createdAt:serverTimestamp()
})

toast.success("User berhasil dibuat")

setShowModal(false)

setNewUser({
username:"",
email:"",
password:"",
role:"admin"
})

}catch(err:any){

toast.error(err.message)

}finally{

setCreating(false)

}

}

/* ================= PROTECTION ================= */

if(userRole!=="owner"){
return(
<div className="text-center py-20 text-red-400">
Akses hanya untuk Owner
</div>
)
}

/* ================= UI ================= */

return(

<div className="space-y-10">

{/* HEADER */}

<div>

<h1 className="text-3xl font-bold">
Owner Control Panel
</h1>

<p className="text-white/50">
Manajemen user dan kontrol sistem
</p>

</div>

{/* MAINTENANCE CARD */}

<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-4"
>

<div>

<h2 className="font-semibold flex gap-2 items-center">
<Shield size={18}/>
Maintenance Mode
</h2>

<p className="text-white/50 text-sm">
Nonaktifkan sementara sistem absensi
</p>

</div>

<button
onClick={toggleMaintenance}
className={`relative w-16 h-8 rounded-full transition ${
maintenanceMode ? "bg-red-500" : "bg-emerald-500"
}`}
>

<motion.div
layout
transition={{ type:"spring", stiffness:500, damping:30 }}
className={`absolute top-1 w-6 h-6 rounded-full bg-white ${
maintenanceMode ? "right-1" : "left-1"
}`}
/>

</button>

</motion.div>

{/* SUMMARY */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

{[
{label:"Total User",value:summary.total,icon:<Users size={18}/>},
{label:"Admin",value:summary.admin},
{label:"Developer",value:summary.developer},
{label:"Owner",value:summary.owner,icon:<Crown size={18}/>}
].map((item,i)=>(

<motion.div
key={i}
whileHover={{y:-5}}
className="p-6 bg-[#1e293b] rounded-2xl border border-white/10"
>

<div className="text-sm text-white/50 flex gap-2 items-center">
{item.icon}
{item.label}
</div>

<div className="text-2xl font-bold mt-2">
{item.value}
</div>

</motion.div>

))}

</div>

{/* SEARCH + ADD */}

<div className="flex flex-col md:flex-row gap-4 justify-between">

<div className="relative">

<Search className="absolute left-3 top-3 text-white/40" size={16}/>

<input
placeholder="Cari user..."
value={search}
onChange={e=>setSearch(e.target.value)}
className="bg-[#1e293b] pl-10 pr-4 py-2 rounded-xl outline-none w-full md:w-72"
/>

</div>

<button
onClick={()=>setShowModal(true)}
className="flex gap-2 items-center bg-cyan-500 px-4 py-2 rounded-xl hover:bg-cyan-600 transition"
>

<Plus size={16}/>
Tambah User

</button>

</div>

{/* USER LIST */}

<div className="space-y-4">

{loading ? (

<div className="text-white/40">Loading...</div>

):(filteredUsers.length===0 ? (

<div className="text-white/40 text-center py-10">
Tidak ada user
</div>

):(filteredUsers.map(u=>(

<div
key={u.id}
className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 bg-[#1e293b] rounded-xl border border-white/10"
>

<div>

<div className="font-semibold">{u.username}</div>
<div className="text-white/50 text-sm">{u.email}</div>

</div>

<div className="flex gap-3 items-center">

<select
value={u.role}
disabled={user?.uid===u.id}
onChange={e=>handleRoleChange(u.id,e.target.value)}
className="bg-black/40 px-2 py-1 rounded"
>

<option value="admin">Admin</option>
<option value="developer">Developer</option>
<option value="owner">Owner</option>

</select>

<button
onClick={()=>handleDelete(u.id)}
className="text-red-400 hover:text-red-300"
>

<Trash2 size={16}/>

</button>

</div>

</div>

))))}

</div>

{/* MODAL */}

<AnimatePresence>

{showModal && (

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
>

<motion.div
initial={{scale:0.9}}
animate={{scale:1}}
exit={{scale:0.9}}
className="bg-[#0f172a] w-full max-w-md p-8 rounded-2xl space-y-4 border border-white/10"
>

<div className="flex justify-between items-center">

<h3 className="text-lg font-semibold">
Tambah User
</h3>

<button onClick={()=>setShowModal(false)}>
<X size={18}/>
</button>

</div>

<input
placeholder="Username"
value={newUser.username}
onChange={e=>setNewUser({...newUser,username:e.target.value})}
className="w-full p-2 rounded bg-black/40"
/>

<input
placeholder="Email"
value={newUser.email}
onChange={e=>setNewUser({...newUser,email:e.target.value})}
className="w-full p-2 rounded bg-black/40"
/>

<input
type="password"
placeholder="Password"
value={newUser.password}
onChange={e=>setNewUser({...newUser,password:e.target.value})}
className="w-full p-2 rounded bg-black/40"
/>

<select
value={newUser.role}
onChange={e=>setNewUser({...newUser,role:e.target.value as any})}
className="w-full p-2 rounded bg-black/40"
>

<option value="admin">Admin</option>
<option value="developer">Developer</option>

</select>

<button
onClick={handleCreate}
disabled={creating}
className="w-full bg-cyan-500 py-2 rounded-xl hover:bg-cyan-600 transition"
>

{creating ? "Membuat..." : "Buat User"}

</button>

</motion.div>

</motion.div>

)}

</AnimatePresence>

</div>

)

}