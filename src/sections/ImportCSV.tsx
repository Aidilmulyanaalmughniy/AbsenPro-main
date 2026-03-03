import { useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function ImportCSV() {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (selected: File) => {
    if (!selected.name.endsWith('.csv')) {
      toast.error('File harus format .csv');
      return;
    }
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      if (
        !headers.includes('nama') ||
        !headers.includes('uid_rfid') ||
        !headers.includes('kelas')
      ) {
        toast.error('Format CSV harus: nama, uid_rfid, kelas');
        setLoading(false);
        return;
      }

      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());

        const row: any = {};
        headers.forEach((h, index) => {
          row[h] = values[index];
        });

        if (row.nama && row.uid_rfid && row.kelas) {
          await addDoc(collection(db, 'siswa'), {
            nama: row.nama,
            uid_rfid: row.uid_rfid,
            kelas: row.kelas,
            createdAt: new Date()
          });
          count++;
        }
      }

      toast.success(`${count} siswa berhasil diimport`);
      setFile(null);

    } catch (err) {
      toast.error('Gagal membaca file');
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold">Import CSV Siswa</h1>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center bg-[#1e293b] hover:border-cyan-500/40 transition"
      >
        <UploadCloud className="mx-auto mb-4 text-cyan-400" size={40} />
        <p className="text-white/60">
          Drag & drop file CSV di sini
        </p>
        <p className="text-white/40 text-sm mt-2">
          atau klik untuk memilih file
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={e => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
          id="csvInput"
        />

        <label
          htmlFor="csvInput"
          className="mt-4 inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg cursor-pointer"
        >
          Pilih File
        </label>
      </div>

      {file && (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-cyan-400" />
            <span>{file.name}</span>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Importing...
              </>
            ) : (
              'Import Sekarang'
            )}
          </button>
        </div>
      )}

      <div className="bg-[#1e293b] p-6 rounded-xl border border-white/5 text-sm text-white/60">
        <p className="mb-2 font-semibold text-white">
          Format CSV yang benar:
        </p>
        <pre className="bg-black/30 p-3 rounded-lg overflow-auto">
nama,uid_rfid,kelas
Budi,123456,X PPLG
Siti,654321,X DKV
        </pre>
      </div>

    </div>
  );
}