"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DateRangePickerProps {
  value: [Date, Date];
  onChange: (range: [Date, Date] | null) => void;
  onSingleDateChange?: (date: Date | null) => void;
  selectedDate?: Date;
  filterMode?: 'single' | 'range';
  onFilterModeChange?: () => void;
}

export function DateRangePicker({ 
  value, 
  onChange, 
  onSingleDateChange, 
  selectedDate, 
  filterMode: externalFilterMode, 
  onFilterModeChange 
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>({ from: value[0], to: value[1] });
  const [mode, setMode] = React.useState<"single" | "range">(externalFilterMode || "range");
  const [singleDate, setSingleDate] = React.useState<Date>(selectedDate || new Date());

  React.useEffect(() => {
    setRange({ from: value[0], to: value[1] });
  }, [value]);

  React.useEffect(() => {
    // When switching to single date mode, use the most recent date in the range
    if (mode === "single" && range && range.to) {
      setSingleDate(range.to);
    }
  }, [mode, range]);

  React.useEffect(() => {
    // Update internal mode when external filterMode changes
    if (externalFilterMode) {
      setMode(externalFilterMode);
    }
  }, [externalFilterMode]);

  React.useEffect(() => {
    // Update internal single date when external selectedDate changes
    if (selectedDate) {
      setSingleDate(selectedDate);
    }
  }, [selectedDate]);

  const formatDate = (date: Date | undefined) => date ? date.toLocaleDateString('ru-RU') : "";

  const formatDateButton = () => {
    if (mode === "single" && singleDate) {
      return formatDate(singleDate);
    } else if (range && range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return "";
  };

  // Function to reset to today for single date mode
  const handleSingleToday = () => {
    const today = new Date();
    setSingleDate(today);
    // Apply a range of just the selected day (full 24 hours)
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    onChange([startOfDay, endOfDay]);
    if (onSingleDateChange) {
      onSingleDateChange(today);
    }
    setOpen(false);
  };

  // Function to reset to current date and last 7 days for range mode
  const handleRangeToday = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const newRange: [Date, Date] = [sevenDaysAgo, today];
    setRange({ from: sevenDaysAgo, to: today });
    onChange(newRange);
    setOpen(false);
  };

  // When a single date is selected
  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSingleDate(date);
      // Apply a range of just the selected day (full 24 hours)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      onChange([startOfDay, endOfDay]);
      if (onSingleDateChange) {
        onSingleDateChange(date);
      }
    }
  };

  // Handle mode change
  const handleModeChange = (value: string) => {
    const newMode = value as "single" | "range";
    setMode(newMode);
    if (onFilterModeChange) {
      onFilterModeChange();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[220px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateButton()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-[10px] !w-auto" align="end">
        <Tabs defaultValue="range" value={mode} onValueChange={handleModeChange}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="single" className="flex-1">Один день</TabsTrigger>
            <TabsTrigger value="range" className="flex-1">Диапазон</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-0">
            <Calendar
              mode="single"
              selected={singleDate}
              onSelect={handleSingleDateSelect}
              initialFocus
              locale={ru}
            />
            <div className="flex justify-end mt-2 border-t pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSingleToday}
                className="text-xs"
              >
                Сегодня
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="range" className="mt-0">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(selectedRange: DateRange | undefined) => {
                if (selectedRange && selectedRange.from && selectedRange.to) {
                  setRange(selectedRange);
                  onChange([selectedRange.from, selectedRange.to]);
                } else {
                  setRange(selectedRange);
                }
              }}
              initialFocus
              locale={ru}
            />
            <div className="flex justify-end mt-2 border-t pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRangeToday}
                className="text-xs"
              >
                Последние 7 дней
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
} 