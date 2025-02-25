"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon } from "lucide-react"

interface DateRangePickerProps {
  value: [Date, Date];
  onChange: (range: [Date, Date] | null) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>({ from: value[0], to: value[1] });

  React.useEffect(() => {
    setRange({ from: value[0], to: value[1] });
  }, [value]);

  const formatDate = (date: Date | undefined) => date ? date.toLocaleDateString('ru-RU') : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {range && range.from && range.to ? `${formatDate(range.from)} - ${formatDate(range.to)}` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-[10px] !w-auto" align="end">
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
      </PopoverContent>
    </Popover>
  );
} 