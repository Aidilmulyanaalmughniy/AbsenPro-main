import {
doc,
setDoc,
serverTimestamp,
Timestamp
} from "firebase/firestore"

import { db } from "@/lib/firebase"

export async function setManualAbsensi(
siswa:any,
status:"izin"|"sakit"|"alpha"
){

const now = new Date()

const today = new Date(
now.getFullYear(),
now.getMonth(),
now.getDate()
)

const tanggalKey =
today.toISOString().split("T")[0].replace(/-/g,"")

const id =
`${siswa.uid_rfid}_${tanggalKey}`

await setDoc(
doc(db,"absensi",id),
{
uid_rfid:siswa.uid_rfid,
nama:siswa.nama,
kelas:siswa.kelas,

status:status,

terlambatMenit:null,

tanggal:Timestamp.fromDate(today),

waktu_scan:serverTimestamp(),

manual:true
},
{ merge:true }
)

}