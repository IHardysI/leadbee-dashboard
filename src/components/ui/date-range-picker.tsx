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
  disabled?: boolean;
  isAllTime?: boolean;
}

export function DateRangePicker({ 
  value, 
  onChange, 
  onSingleDateChange, 
  selectedDate, 
  filterMode: externalFilterMode, 
  onFilterModeChange,
  disabled,
  isAllTime
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
      return `Дата: ${formatDate(singleDate)}`;
    } else if (range && range.from && range.to) {
      return `Период: ${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return "Выбрать дату";
  };

  // Function to reset to today for single date mode
  const handleSingleToday = () => {
    console.log("Setting single date to today");
    const today = new Date();
    setSingleDate(today);
    
    // Apply a range of just the selected day (full 24 hours)
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Notify parent components
    onChange([startOfDay, endOfDay]);
    if (onSingleDateChange) {
      onSingleDateChange(today);
    }
    
    // Close the popover immediately
    setOpen(false);
  };

  // Function to reset to current date and last 7 days for range mode
  const handleRangeToday = () => {
    console.log("Setting range to last 7 days");
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Update local state
    const newRange: [Date, Date] = [sevenDaysAgo, today];
    setRange({ from: sevenDaysAgo, to: today });
    
    // Notify parent component immediately
    onChange(newRange);
    
    // Close the popover immediately 
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
      
      // Force immediate application of changes
      onChange([startOfDay, endOfDay]);
      
      // Notify parent component of the single date change
      // This is crucial for exiting "All time" mode
      if (onSingleDateChange) {
        onSingleDateChange(date);
      }
      
      // Close popover after selection to ensure changes apply
      // Don't use setTimeout to avoid race conditions
      setOpen(false);
    }
  };

  // Handle mode change
  const handleModeChange = (value: string) => {
    const newMode = value as "single" | "range";
    setMode(newMode);
    
    // Notify parent component of mode change
    if (onFilterModeChange) {
      onFilterModeChange();
    }
    
    // If we need to apply current date selection
    if (isAllTime) {
      // For single mode, use today
      if (newMode === "single" && onSingleDateChange) {
        onSingleDateChange(new Date());
      } 
      // For range mode, use last 7 days
      else if (newMode === "range" && onChange) {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        onChange([sevenDaysAgo, today]);
      }
    }
  };

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        // Handle opening/closing the popover
        if (isOpen && isAllTime) {
          // If opening while in "All time" mode, trigger the appropriate handlers
          if (mode === 'single' && onSingleDateChange) {
            onSingleDateChange(singleDate);
          } else if (onChange && range?.from && range?.to) {
            onChange([range.from, range.to]);
          }
        }
        // Update open state
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`min-w-[220px] justify-start ${isAllTime ? 'opacity-80 hover:opacity-100' : 'bg-black text-white hover:bg-black/90 hover:text-white'}`} 
          disabled={disabled}
          onClick={() => {
            console.log("Calendar button clicked, current mode:", mode, "isAllTime:", isAllTime);
            
            // Always trigger the appropriate handlers when clicking the calendar button
            // This ensures date filtering is applied in all cases
            if (isAllTime) {
              // Exit "All time" mode and apply current selection
              if (mode === 'single' && onSingleDateChange) {
                onSingleDateChange(singleDate);
              } else if (onChange && range?.from && range?.to) {
                onChange([range.from, range.to]);
              }
            } else {
              // Even when not in "All time" mode, force a refresh of the data
              // This ensures consistent behavior in all cases
              if (mode === 'single' && onSingleDateChange) {
                onSingleDateChange(singleDate);
              } else if (onChange && range?.from && range?.to) {
                onChange([range.from, range.to]);
              }
            }
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isAllTime ? "Нажмите для выбора дат" : formatDateButton()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-[10px] !w-auto" align="end">
        <Tabs defaultValue="range" value={mode} onValueChange={(value) => {
          // Ensure we handle mode changes correctly
          handleModeChange(value);
          
          // Trigger any relevant callbacks for parent components
          if (isAllTime) {
            // This helps ensure we exit "All time" mode when changing tabs
            if (value === 'single' && onSingleDateChange) {
              // Make sure we pass a Date object, not a string
              onSingleDateChange(singleDate);
            } else if (onChange && range?.from && range?.to) {
              // Only use the range if both from and to are valid Date objects
              onChange([range.from, range.to]);
            } else if (onChange) {
              // Fallback to using the original value, but ensure they're Dates
              const defaultStart = new Date(value[0]);
              const defaultEnd = new Date(value[1]);
              onChange([defaultStart, defaultEnd]);
            }
          }
        }}>
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
                // Always update the local state with the selected range
                setRange(selectedRange);
                
                // Only close the popover and notify parent when a complete range is selected
                if (selectedRange && selectedRange.from && selectedRange.to) {
                  console.log("Complete range selected:", selectedRange);
                  
                  // Force immediate application of changes
                  const newRange: [Date, Date] = [selectedRange.from, selectedRange.to];
                  onChange(newRange);
                  
                  // Only close the popover when both dates are selected
                  setOpen(false);
                } else {
                  console.log("Partial range selected:", selectedRange);
                  // Keep the popover open to allow selecting the second date
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