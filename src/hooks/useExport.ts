import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Absensi } from '@/types'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface UseExportReturn {
  exporting: boolean
  exportCSV: (data: Absensi[], filename: string) => void
  exportExcel: (data: Absensi[], filename: string) => void
  exportPDF: (data: Absensi[], filename: string) => void
}

export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false)

  // ===============================
  // FORMAT DATA
  // ===============================
  const formatDataForExport = (data: Absensi[]) => {
    return data.map((item, index) => {
      const tanggal =
        item.tanggal instanceof Date
          ? item.tanggal
          : (item.tanggal as any).toDate?.() ?? new Date()

      return {
        No: index + 1,
        Nama: item.nama,
        Kelas: item.kelas,
        Tanggal: format(tanggal, 'dd/MM/yyyy'),
        Waktu: format(tanggal, 'HH:mm:ss'),
        Status: item.status.toUpperCase(),
      }
    })
  }

  // ===============================
  // EXPORT CSV
  // ===============================
  const exportCSV = useCallback((data: Absensi[], filename: string) => {
    setExporting(true)

    try {
      if (!data.length) {
        toast.error('Tidak ada data untuk di export')
        return
      }

      const formattedData = formatDataForExport(data)
      const headers = Object.keys(formattedData[0])

      const csvContent = [
        headers.join(','),
        ...formattedData.map(row =>
          headers
            .map(h => {
              const value = (row as any)[h]
              if (
                typeof value === 'string' &&
                (value.includes(',') || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value
            })
            .join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()

      toast.success('Export CSV berhasil')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Gagal export CSV')
    } finally {
      setExporting(false)
    }
  }, [])

  // ===============================
  // EXPORT EXCEL
  // ===============================
  const exportExcel = useCallback((data: Absensi[], filename: string) => {
    setExporting(true)

    try {
      if (!data.length) {
        toast.error('Tidak ada data untuk di export')
        return
      }

      const formattedData = formatDataForExport(data)

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Absensi')

      ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
      ]

      XLSX.writeFile(wb, `${filename}.xlsx`)

      toast.success('Export Excel berhasil')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      toast.error('Gagal export Excel')
    } finally {
      setExporting(false)
    }
  }, [])

  // ===============================
  // EXPORT PDF (FIXED VERSION)
  // ===============================
  const exportPDF = useCallback((data: Absensi[], filename: string) => {
    setExporting(true)

    try {
      if (!data.length) {
        toast.error('Tidak ada data untuk di export')
        return
      }

      const formattedData = formatDataForExport(data)

      const doc = new jsPDF()

      // Title
      doc.setFontSize(18)
      doc.text('DATA ABSENSI SISWA', 14, 20)

      // Subtitle
      doc.setFontSize(10)
      doc.text(
        `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        14,
        28
      )

      autoTable(doc, {
        startY: 35,
        head: [['No', 'Nama', 'Kelas', 'Tanggal', 'Waktu', 'Status']],
        body: formattedData.map(row => [
          row.No,
          row.Nama,
          row.Kelas,
          row.Tanggal,
          row.Waktu,
          row.Status,
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [6, 182, 212],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      doc.save(`${filename}.pdf`)

      toast.success('Export PDF berhasil')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Gagal export PDF')
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exporting,
    exportCSV,
    exportExcel,
    exportPDF,
  }
}