import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileCode, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExport } from '@/hooks/useExport';
import type { Absensi } from '@/types';
import { KELAS_OPTIONS } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ExportDropdownProps {
  data: Absensi[];
  selectedKelas: string;
  selectedDate: Date;
}

export function ExportDropdown({ data, selectedKelas, selectedDate }: ExportDropdownProps) {
  const { exportCSV, exportExcel, exportPDF, exporting } = useExport();
  const [isOpen, setIsOpen] = useState(false);

  const generateFilename = (kelas?: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const kelasStr = kelas || (selectedKelas !== 'all' ? selectedKelas : 'semua-kelas');
    return `absensi_${kelasStr}_${dateStr}`;
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf', kelas?: string) => {
    let exportData = data;
    
    // Filter by kelas if specified
    if (kelas && kelas !== 'all') {
      exportData = data.filter(item => item.kelas === kelas);
    }

    if (exportData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const filename = generateFilename(kelas);

    switch (format) {
      case 'csv':
        exportCSV(exportData, filename);
        break;
      case 'excel':
        exportExcel(exportData, filename);
        break;
      case 'pdf':
        exportPDF(exportData, filename);
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#0f172a] border-white/10 text-white hover:bg-white/5 hover:border-cyan-500/50"
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[#1e293b] border-white/10"
      >
        {/* Export All */}
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
          Export Semua (Excel)
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
        >
          <FileCode className="w-4 h-4 mr-2 text-blue-400" />
          Export Semua (CSV)
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-red-400" />
          Export Semua (PDF)
        </DropdownMenuItem>

        {/* Export Per Kelas */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
            <ChevronRight className="w-4 h-4 mr-2 text-cyan-400" />
            Export Per Kelas
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-[#1e293b] border-white/10">
            {KELAS_OPTIONS.map((kelas) => (
              <DropdownMenuSub key={kelas}>
                <DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  {kelas}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-[#1e293b] border-white/10">
                  <DropdownMenuItem
                    onClick={() => handleExport('excel', kelas)}
                    className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport('csv', kelas)}
                    className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 mr-2 text-blue-400" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport('pdf', kelas)}
                    className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-red-400" />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
