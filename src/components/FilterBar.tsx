import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useApp } from '@/context/AppContext';
import { KELAS_OPTIONS } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FilterBar() {
  const { selectedKelas, setSelectedKelas, selectedDate, setSelectedDate } = useApp();

  const hasFilters = selectedKelas !== 'all';

  const clearFilters = () => {
    setSelectedKelas('all');
    setSelectedDate(new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap items-center gap-3 p-4 sm:p-5 rounded-2xl bg-[#1e293b] border border-white/5"
    >
      <div className="flex items-center gap-2 text-cyan-400">
        <Filter className="w-5 h-5" />
        <span className="font-medium text-sm">Filter Data</span>
      </div>

      <div className="w-px h-6 bg-white/10 hidden sm:block" />

      {/* Kelas Select */}
      <Select value={selectedKelas} onValueChange={setSelectedKelas}>
        <SelectTrigger className="w-[140px] bg-[#0f172a] border-white/10 text-white hover:border-cyan-500/50 transition-colors">
          <SelectValue placeholder="Semua Kelas" />
        </SelectTrigger>
        <SelectContent className="bg-[#1e293b] border-white/10">
          <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
            Semua Kelas
          </SelectItem>
          {KELAS_OPTIONS.map((kelas) => (
            <SelectItem 
              key={kelas} 
              value={kelas}
              className="text-white hover:bg-white/10 focus:bg-white/10"
            >
              {kelas}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal bg-[#0f172a] border-white/10 text-white hover:border-cyan-500/50 hover:bg-[#0f172a]",
              !selectedDate && "text-white/50"
            )}
          >
            <Calendar className="mr-2 h-4 w-4 text-cyan-400" />
            {selectedDate ? (
              format(selectedDate, 'dd MMMM yyyy', { locale: id })
            ) : (
              <span>Pilih tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#1e293b] border-white/10" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            initialFocus
            className="bg-[#1e293b] text-white"
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
