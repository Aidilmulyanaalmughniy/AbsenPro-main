const admin = require("firebase-admin")

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)

admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function generateAlpha(){

const now = new Date()

const today = new Date(
now.getFullYear(),
now.getMonth(),
now.getDate()
)

const endToday = new Date(today.getTime() + 86400000)

const tanggalKey =
today.toISOString().split("T")[0].replace(/-/g,"")

console.log("Start generate alpha")

// ======================
// ambil semua siswa
// ======================

const siswaSnap = await db.collection("siswa").get()

// ======================
// ambil absensi hari ini
// ======================

const absensiSnap = await db
.collection("absensi")
.where("tanggal", ">=", admin.firestore.Timestamp.fromDate(today))
.where("tanggal", "<=", admin.firestore.Timestamp.fromDate(endToday))
.get()

const scanned = new Set()

absensiSnap.forEach(doc => {
const data = doc.data()
scanned.add(data.uid_rfid)
})

let batch = db.batch()
let counter = 0

for (const doc of siswaSnap.docs){

const siswa = doc.data()

if(!scanned.has(siswa.uid_rfid)){

// ID unik per hari
const id = `${siswa.uid_rfid}_${tanggalKey}`

const ref = db.collection("absensi").doc(id)

batch.set(ref,{

uid_rfid: siswa.uid_rfid,
nama: siswa.nama,
kelas: siswa.kelas,

status: "alpha",
terlambatMenit: null,

tanggal: admin.firestore.Timestamp.fromDate(today),
waktu_scan: admin.firestore.Timestamp.fromDate(now),

createdAt: admin.firestore.FieldValue.serverTimestamp()

})

counter++

// Firestore limit 500
if(counter === 450){

await batch.commit()

batch = db.batch()

counter = 0

}

}

}

if(counter > 0){
await batch.commit()
}

console.log("Alpha generated successfully")

}

generateAlpha().catch(err=>{
console.error("Error generate alpha:", err)
process.exit(1)
})