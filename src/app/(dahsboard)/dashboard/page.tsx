"use client"

import { DollarSign, Users, CreditCard, Clock } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { getLeadsCount } from "@/components/shared/api/analytics"
import { getServiceStats, ConversationStagesCount, getTotalCounts, TotalCounts } from "@/components/shared/api/stats"

import { ClientActivityChart } from "@/components/features/dashboard/components/client-activity-chart"
import { StatCard } from "@/components/features/dashboard/components/stats-card"
import { StatsList } from "@/components/features/dashboard/components/stats-list"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"

// Default stats data (will be replaced with API data)
const defaultStatsData = [
  { title: "Загрузка данных...", count: 0 },
]

// Stage name mapping for better display
const stageNameMapping: Record<string, string> = {
  "отправка_бесплатных_лидов": "отправка_бесплатных_лидов",
  "завершен": "завершен",
  "убеждение_на_бесплатные_лиды": "убеждение_на_бесплатные_лиды",
  "отправка_последовательности_приветствия": "отправка_последовательности_приветствия",
  "ожидание_подтверждения_подписки": "ожидание_подтверждения_подписки",
  "убеждение_на_подписку": "убеждение_на_подписку"
};

// Logical order of stages for display
const stageOrder = [
  "отправка_последовательности_приветствия", // Написали боты
  "убеждение_на_бесплатные_лиды",           // Ответил на первое сообщение
  "отправка_бесплатных_лидов",              // Получил бесплатных лидов
  "убеждение_на_подписку",                  // Получил ссылку на оплату
  "завершен",                               // Оплатил
  "ожидание_подтверждения_подписки"         // Перешел в бота
];

// Convert category names to more readable format
function formatCategoryName(category: string): string {
  // Replace underscores with spaces
  let formatted = category.replace(/_/g, ' ');
  
  // Replace pipe characters with commas
  formatted = formatted.replace(/\|/g, ', ');
  
  // Special cases for common categories
  if (formatted === "CUSTOMER REQUEST") return "Запрос клиента";
  if (formatted === "ASK FOR ADVICE") return "Запрос совета";
  if (formatted === "Other") return "Другое";
  if (formatted === "not reviewed") return "Не рассмотрено";
  if (formatted === "From moderator") return "От модератора";
  
  // Capitalize first letter of each word
  return formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface StatsItem {
  title: string;
  count: number;
  isDivider?: boolean;
}

export default function DashboardPage() {
  const [leadsCount, setLeadsCount] = useState<string>("...")
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterMode, setFilterMode] = useState<'single' | 'range'>('range')
  const [isAllTime, setIsAllTime] = useState<boolean>(false)
  const [activityData, setActivityData] = useState([
    { name: "Загрузка данных...", value: 0 },
  ])
  const [statsData, setStatsData] = useState<StatsItem[]>(defaultStatsData)
  const [totalLeads, setTotalLeads] = useState<number | null>(null)
  const [totalSendedLeads, setTotalSendedLeads] = useState<number | null>(null)
  const [totalMoneyEarned, setTotalMoneyEarned] = useState<number>(0) // New state for total money earned
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingChart, setIsLoadingChart] = useState(true)
  const [dataTimestamp, setDataTimestamp] = useState<number>(Date.now())

  // Get current date filter based on filterMode
  const getCurrentDateFilter = useCallback(() => {
    if (isAllTime) {
      return undefined; // No date filter for "All time"
    }
    return filterMode === 'range' ? dateRange : selectedDate;
  }, [filterMode, dateRange, selectedDate, isAllTime]);

  // Fetch leads count data
  const fetchLeadsCount = useCallback(async () => {
    try {
      // Get leads count with date filtering
      const dateFilter = getCurrentDateFilter();
      const data = await getLeadsCount(dateFilter);
      const count = data.leads_count;
      setLeadsCount(count.toLocaleString());
    } catch (error: any) {
      console.error('Error fetching leads count:', error);
      setLeadsCount('Error');
    }
  }, [getCurrentDateFilter]);

  // Fetch conversation stages data for chart
  const fetchConversationStages = useCallback(async () => {
    setIsLoadingChart(true);
    try {
      // Fetch service stats with date filtering
      const dateFilter = getCurrentDateFilter();
      console.log('Fetching service stats with date filter:', dateFilter);
      const stats = await getServiceStats(dateFilter);
      console.log('Received stats:', stats);
      
      if (stats && stats.length > 0) {
        // Transform conversation stages data for chart
        const stagesData = stats[0].conversation_stages_count;
        transformActivityData(stagesData);
      } else {
        setActivityData([{ name: "Нет данных", value: 0 }]);
      }
    } catch (error) {
      console.error('Error fetching conversation stages:', error);
      setActivityData([{ name: "Ошибка загрузки данных", value: 0 }]);
    } finally {
      setIsLoadingChart(false);
    }
  }, [getCurrentDateFilter]);

  // Fetch total counts data
  const fetchTotalCounts = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // Fetch all data with date filtering
      const dateFilter = getCurrentDateFilter();
      console.log('Fetching total counts with date filter:', dateFilter);
      const data = await getTotalCounts(dateFilter);
      console.log('Received total counts:', data);
      
      // Set total counts for stats cards
      setTotalLeads(data.total_leads_count);
      setTotalSendedLeads(data.total_sended_leads);
      
      // Process categories data for list
      const categoriesStats = processAllStats(data);
      setStatsData(categoriesStats);
    } catch (error) {
      console.error('Error fetching total counts:', error);
      setStatsData([{ title: "Ошибка загрузки данных", count: 0 }]);
    } finally {
      setIsLoadingStats(false);
    }
  }, [getCurrentDateFilter]);

  // Fetch all data
  const fetchAllData = useCallback(() => {
    fetchLeadsCount();
    fetchConversationStages();
    fetchTotalCounts();
    // Update timestamp to force cache refresh
    setDataTimestamp(Date.now());
  }, [fetchLeadsCount, fetchConversationStages, fetchTotalCounts]);

  // Load all data on initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Process all stats for display in the list - no header for categories
  const processAllStats = (data: TotalCounts): StatsItem[] => {
    const result: StatsItem[] = [];
    
    // Add total leads count at the top
    result.push({ 
      title: `Всего лидов: ${data.total_leads_count.toLocaleString()}`, 
      count: 0,
      isDivider: true
    });
    
    // Sort categories by count (descending)
    const sortedCategories = [...data.total_leads_count_by_category].sort((a, b) => b.count - a.count);
    
    // Add all categories
    sortedCategories.forEach(item => {
      result.push({
        title: formatCategoryName(item.category),
        count: item.count
      });
    });
    
    return result;
  };

  // Transform conversation stages data for the chart
  const transformActivityData = (stagesData: ConversationStagesCount) => {
    // Check if there's any data
    if (!stagesData || Object.keys(stagesData).length === 0) {
      setActivityData([{ name: "Нет данных", value: 0 }]);
      return;
    }
    
    // Transform and sort data according to logical stage order
    const transformedData = [];
    
    // Process stages in order
    for (let i = 0; i < stageOrder.length; i++) {
      const stage = stageOrder[i];
      const value = stagesData[stage] || 0;
      
      // Calculate percentage relative to previous stage (if exists)
      let percentageText = "";
      if (i > 0) {
        const prevStage = stageOrder[i-1];
        const prevValue = stagesData[prevStage] || 1; // Default to 1 to avoid division by zero
        
        if (prevValue > 0) {
          const percentage = Math.round((value / prevValue) * 100);
          percentageText = ` (${percentage}%)`;
        }
      } else {
        // First stage, no percentage
        percentageText = "";
      }
      
      // Only add stages with values
      if (value > 0 || i === 0) { // Always include first stage even if 0
        transformedData.push({
          name: `${stageNameMapping[stage] || stage}${percentageText}`,
          value
        });
      }
    }
    
    // If there's no data after filtering, show a message
    if (transformedData.length === 0) {
      setActivityData([{ name: "Нет данных", value: 0 }]);
    } else {
      setActivityData(transformedData);
    }
  };

  // Handle "All time" button click
  const handleAllTimeClick = () => {
    // Toggle the "All time" state if clicked again
    if (isAllTime) {
      setIsAllTime(false);
      // Refresh data with current date filter when exiting "All time" mode
      fetchAllData();
    } else {
      setIsAllTime(true);
      // Refetch data without date filtering
      fetchAllData();
    }
  };

  // Force exit from "All time" mode and apply the current filter immediately
  const forceExitAllTimeMode = () => {
    if (isAllTime) {
      console.log("Forcing exit from All time mode");
      // Set state synchronously to ensure immediate update
      setIsAllTime(false);
      return true;
    }
    return false;
  };

  // Handle date range change with reliable "All time" mode exit
  const handleDateRangeChange = (range: [Date, Date] | null) => {
    if (range) {
      console.log("Date range changed:", range.map(d => d.toISOString()));
      
      // Force exit from "All time" mode first
      forceExitAllTimeMode();
      
      // Update state values for the range
      setDateRange(range);
      setFilterMode('range');
      
      // Immediately fetch data with the new filter
      console.log("Fetching data with new date range");
      fetchAllData();
    }
  };

  // Handle single date change with reliable "All time" mode exit
  const handleDateChange = (date: Date | null) => {
    if (date) {
      console.log("Single date changed:", date.toISOString());
      
      // Force exit from "All time" mode first
      forceExitAllTimeMode();
      
      // Update state values for the single date
      setSelectedDate(date);
      setFilterMode('single');
      
      // Immediately fetch data with the new filter
      console.log("Fetching data with new single date");
      fetchAllData();
    }
  };

  // Toggle between single date and date range filtering
  const toggleFilterMode = () => {
    const newMode = filterMode === 'range' ? 'single' : 'range';
    
    // If we're in "All time" mode, exit it
    if (isAllTime) {
      setIsAllTime(false);
    }
    
    setFilterMode(newMode);
    
    // Always refresh data when toggling filter mode
    fetchAllData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Статистика Лидов</h2>
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">Выберите период:</span>
          <Button 
            variant={isAllTime ? "default" : "outline"}
            size="sm"
            onClick={handleAllTimeClick}
            className={`mr-2 ${isAllTime ? 'bg-black text-white hover:bg-black/90 hover:text-white' : ''}`}
          >
            <Clock className="h-4 w-4 mr-1" />
            За все время
          </Button>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            onSingleDateChange={handleDateChange}
            selectedDate={selectedDate}
            filterMode={filterMode}
            onFilterModeChange={toggleFilterMode}
            isAllTime={isAllTime}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Отправлено лидов"
          value={totalSendedLeads !== null ? totalSendedLeads.toLocaleString() : "..."}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Всего заработано"
          value="- $"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          {isLoadingChart && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-sm text-muted-foreground">Загрузка данных...</div>
            </div>
          )}
          <ClientActivityChart data={activityData} />
        </div>
        <StatsList items={statsData} isLoading={isLoadingStats} />
      </div>
    </div>
  )
}
