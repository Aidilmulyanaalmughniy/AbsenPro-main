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

  const endToday = new Date(today.getTime()+86400000)

  const tanggalKey =
    today.toISOString().split("T")[0].replace(/-/g,"")

  console.log("Start generate alpha")

  const siswaSnap = await db.collection("siswa").get()

  const absensiSnap = await db
    .collection("absensi")
    .where("tanggal",">=",today)
    .where("tanggal","<=",endToday)
    .get()

  const scanned = new Set()

  absensiSnap.forEach(doc=>{
    const data = doc.data()
    scanned.add(data.uid_rfid)
  })

  let batch = db.batch()
  let counter = 0

  siswaSnap.forEach(doc=>{

    const siswa = doc.data()

    if(!scanned.has(siswa.uid_rfid)){

      const id = `${siswa.uid_rfid}_${tanggalKey}`

      const ref = db.collection("absensi").doc(id)

      batch.set(ref,{
        uid_rfid:siswa.uid_rfid,
        nama:siswa.nama,
        kelas:siswa.kelas,

        status:"alpha",
        terlambatMenit:null,

        tanggal:today,
        waktu_scan:now,

        createdAt:
          admin.firestore.FieldValue.serverTimestamp()
      })

      counter++

      if(counter===450){
        batch.commit()
        batch=db.batch()
        counter=0
      }

    }

  })

  if(counter>0){
    await batch.commit()
  }

  console.log("Alpha generated")

}

generateAlpha()