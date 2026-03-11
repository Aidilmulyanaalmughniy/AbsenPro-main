import { useState, useEffect, useCallback } from 'react'
import type { Absensi } from '@/types'
import { toast } from 'sonner'
import { startOfDay, endOfDay, format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { canAccess } from '@/lib/permissions'
import { logActivity } from '@/lib/activityLogger'

import {
collection,
doc,
setDoc,
deleteDoc,
updateDoc,
onSnapshot,
query,
where,
serverTimestamp,
Timestamp
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

interface UseAttendanceReturn {
absensi: Absensi[]
loading: boolean
error: string | null
addAbsensi: (data: Omit<Absensi,'id'|'createdAt'|'status'>) => Promise<void>
deleteAbsensi: (id: string) => Promise<void>
updateStatus: (id: string,status: Absensi['status']) => Promise<void>
}

export function useAttendance(
selectedDate: Date = new Date(),
selectedKelas: string = 'all'
): UseAttendanceReturn {

const { userRole } = useAuth()

const [absensi,setAbsensi] = useState<Absensi[]>([])
const [loading,setLoading] = useState(true)
const [error] = useState<string|null>(null)

useEffect(()=>{

setLoading(true)

const startDate = startOfDay(selectedDate)
const endDate = endOfDay(selectedDate)

const q = query(
collection(db,'absensi'),
where('tanggal','>=',Timestamp.fromDate(startDate)),
where('tanggal','<=',Timestamp.fromDate(endDate))
)

const unsubscribe = onSnapshot(q,(snapshot)=>{

let data:Absensi[] = snapshot.docs.map(docSnap=>{

const raw = docSnap.data()

return{
id:docSnap.id,
uid_rfid:raw.uid_rfid,
nama:raw.nama,
kelas:raw.kelas,
status:raw.status,
tanggal:raw.tanggal?.toDate(),
waktu_scan:raw.waktu_scan?.toDate(),
terlambatMenit:raw.terlambatMenit ?? 0,
createdAt:raw.createdAt?.toDate()
} as Absensi

})

if(selectedKelas!=='all'){
data=data.filter(a=>a.kelas===selectedKelas)
}

setAbsensi(data)
setLoading(false)

})

return ()=>unsubscribe()

},[selectedDate,selectedKelas])

/* ============================= */
/* ADD ABSENSI MANUAL */
/* ============================= */

const addAbsensi = useCallback(async(
data:Omit<Absensi,'id'|'createdAt'|'status'>
)=>{

if(!canAccess(userRole,'admin')){
toast.error('Tidak memiliki izin')
return
}

try{

const now=new Date()
const today=startOfDay(now)

const id=`${data.uid_rfid}_${format(today,'yyyyMMdd')}`

await setDoc(doc(db,'absensi',id),{

...data,

status:'hadir',
terlambatMenit:0,

waktu_scan:Timestamp.fromDate(now),
tanggal:Timestamp.fromDate(today),

manual:true,

createdAt:serverTimestamp()

},{merge:true})

await logActivity('ADD_ABSENSI',id)

toast.success('Absensi berhasil disimpan')

}catch{

toast.error('Gagal menyimpan absensi')

}

},[userRole])

/* ============================= */
/* UPDATE STATUS */
/* ============================= */

const updateStatus = useCallback(async(
id:string,
status:Absensi['status']
)=>{

try{

await updateDoc(doc(db,'absensi',id),{status})

await logActivity('UPDATE_STATUS',id)

toast.success('Status diperbarui')

}catch{

toast.error('Gagal update status')

}

},[])

/* ============================= */
/* DELETE ABSENSI */
/* ============================= */

const deleteAbsensi = useCallback(async(id:string)=>{

if(!canAccess(userRole,'developer')){
toast.error('Tidak memiliki izin')
return
}

try{

await deleteDoc(doc(db,'absensi',id))

await logActivity('DELETE_ABSENSI',id)

toast.success('Absensi dihapus')

}catch{

toast.error('Gagal menghapus')

}

},[userRole])

return{
absensi,
loading,
error,
addAbsensi,
deleteAbsensi,
updateStatus
}

}