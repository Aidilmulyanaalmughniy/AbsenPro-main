import { useState } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Absensi } from '@/types';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ExportPanel() {

  const { data: absensi } =
    useRealtimeCollection<Absensi>('absensi');

  const [format, setFormat] = useState('csv');
  const [kelas, setKelas] = useState('all');

  const filtered =
    kelas === 'all'
      ? absensi
      : absensi.filter(a => a.kelas === kelas);

  const handleExport = () => {

    if (format === 'csv') exportCSV();
    if (format === 'excel') exportExcel();
    if (format === 'pdf') exportPDF();
  };

  const prepareData = () => {
    return filtered.map(a => ({
      Nama: a.nama,
      RFID: a.uid_rfid,
      Kelas: a.kelas,
      Status: a.status,
      Tanggal: a.tanggal?.toString()
    }));
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(prepareData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
    XLSX.writeFile(wb, 'absensi.csv');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(prepareData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
    XLSX.writeFile(wb, 'absensi.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nama', 'RFID', 'Kelas', 'Status', 'Tanggal']],
      body: filtered.map(a => [
        a.nama,
        a.uid_rfid,
        a.kelas,
        a.status,
        a.tanggal?.toString()
      ])
    });
    doc.save('absensi.pdf');
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold">
        Export Data Absensi
      </h1>

      <div className="bg-[#1e293b] p-6 rounded-xl border border-white/5 space-y-6">

        <div>
          <label className="block mb-2 text-sm text-white/60">
            Format File
          </label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="px-4 py-2 bg-black/30 rounded-lg"
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel (.xlsx)</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-white/60">
            Filter Kelas
          </label>
          <select
            value={kelas}
            onChange={e => setKelas(e.target.value)}
            className="px-4 py-2 bg-black/30 rounded-lg"
          >
            <option value="all">Semua Kelas</option>
            {[...new Set(absensi.map(a => a.kelas))].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <FileDown size={18} />
          Export Sekarang
        </button>

      </div>

    </div>
  );
}


