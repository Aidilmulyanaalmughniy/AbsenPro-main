import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const generateAlpha = functions.scheduler.onSchedule(
  {
    schedule: "10 15 * * *", // setiap hari jam 15:10
    timeZone: "Asia/Jakarta"
  },
  async () => {

    try {

      const now = new Date();

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const endToday = new Date(today.getTime() + 86400000);

      const tanggalKey =
        today.toISOString().split("T")[0].replace(/-/g, "");

      // ambil semua siswa
      const siswaSnap = await db.collection("siswa").get();

      // ambil absensi hari ini
      const absensiSnap = await db
        .collection("absensi")
        .where("tanggal", ">=", today)
        .where("tanggal", "<=", endToday)
        .get();

      const existingIds = absensiSnap.docs.map((d) => d.id);

      const batch = db.batch();

      siswaSnap.forEach((doc) => {

        const siswa = doc.data();

        const id = `${siswa.uid_rfid}_${tanggalKey}`;

        if (!existingIds.includes(id)) {

          const ref = db.collection("absensi").doc(id);

          batch.set(ref, {

            uid_rfid: siswa.uid_rfid,
            nama: siswa.nama,
            kelas: siswa.kelas,

            status: "alpha",

            terlambatMenit: null,

            tanggal: today,
            waktu_scan: now,

            createdAt:
              admin.firestore.FieldValue.serverTimestamp()

          });

        }

      });

      await batch.commit();

      console.log("Alpha generated successfully");

    } catch (error) {

      console.error("Generate alpha error:", error);

    }

  }
);