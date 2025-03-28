"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, LabelList } from 'recharts'
import { ResponsiveContainer } from 'recharts'
import { getCategoryAnalytics, getCategoriesList } from '@/components/shared/api/categories'

// Interface for category data
interface Category {
  name: string;
  prompt: string;
}

// Interface for message statistics data point
interface MessageStatPoint {
  interval: string;
  count: number;
}

// API response data format
interface AnalyticsResponse {
  result: {
    interval: string;
    [categoryName: string]: number | string;
  }[];
}

// Define a type for the result item
type AnalyticsResultItem = AnalyticsResponse['result'][0];

// Time interval options
type TimeInterval = '15min' | '1hour' | '1day';

// API interval mapping
const apiIntervalMap = {
  '15min': '15 minutes',
  '1hour': '1 hour',
  '1day': '1 day'
};

export default function CategoryStatisticsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // The "id" param is actually the URL-encoded category name
  const categoryNameFromUrl = params.id as string;
  
  // Get category name from query params if available, or decode from URL
  const categoryNameFromQuery = searchParams.get('name');
  const decodedCategoryName = categoryNameFromQuery 
    ? decodeURIComponent(categoryNameFromQuery).replace(/-/g, ' ')
    : decodeURIComponent(categoryNameFromUrl).replace(/-/g, ' ');
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1hour');
  const [statisticsData, setStatisticsData] = useState<MessageStatPoint[]>([]);
  const [dateRangeText, setDateRangeText] = useState<string>('');
  
  // Fetch category details
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategoryDetails() {
      try {
        // Get actual categories list to find the correct one
        const categoriesData = await getCategoriesList();
        
        // Handle API response which might return array directly or contain it in a property
        const categoriesArray = Array.isArray(categoriesData) 
          ? categoriesData 
          : categoriesData?.categories || categoriesData?.data || categoriesData?.result || [];
          
        // Find the category by name - preserve original casing from API
        const foundCategory = categoriesArray.find((cat: any) => 
          cat.name.toLowerCase() === decodedCategoryName.toLowerCase() || 
          cat.name.toLowerCase() === categoryNameFromUrl.toLowerCase()
        );
        
        if (isMounted) {
          if (foundCategory) {
            // Use the original casing from the API response
            setCategory(foundCategory);
          } else {
            // If category not found, use the name from URL but warn
            setCategory({
            name: decodedCategoryName,
            prompt: ""
          });
          }
        }
      } catch (error) {
        console.error('Error fetching category details:', error);
        
        if (isMounted) {
          toast({ 
            title: "Ошибка", 
            description: "Не удалось загрузить информацию о категории", 
            variant: "destructive" 
          });
          
          // Even on error, set a default category with the name from URL
          setCategory({
            name: decodedCategoryName,
            prompt: ""
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchCategoryDetails();
    
    return () => {
      isMounted = false;
    };
  }, [categoryNameFromUrl, decodedCategoryName, toast]);
  
  // Fetch statistics data when time interval or category changes
  useEffect(() => {
    if (!category?.name) return;
    
    let isMounted = true;
    setStatsLoading(true);
    
    async function fetchStatistics() {
      try {
        // Calculate date ranges based on the selected interval
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date(now);
        
        // Set up date ranges for different intervals
        if (timeInterval === '15min' || timeInterval === '1hour') {
          // Last 24 hours - but use full days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1); // Go back 1 day
          startDate.setHours(0, 0, 0, 0); // Set to 00:00:00
          
          endDate.setHours(23, 59, 59, 999); // Set to 23:59:59
        } else {
          // Last 30 days
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0); // Already setting to 00:00:00
          endDate.setHours(23, 59, 59, 999); // Already setting to 23:59:59
        }
        
        // Format dates for API
        const formatDateForApi = (date: Date): string => {
          return date.toISOString().replace('T', ' ').substring(0, 19);
        };
        
        const startTime = formatDateForApi(startDate);
        const endTime = formatDateForApi(endDate);
        
        // Add date range text for display
        let rangeText = '';
        if (timeInterval === '15min' || timeInterval === '1hour') {
          rangeText = `Данные за последние 24 часа (${startDate.toLocaleDateString()} 00:00:00 - ${endDate.toLocaleDateString()} 23:59:59)`;
        } else {
          rangeText = `Данные за последние 30 дней (${startDate.toLocaleDateString()} 00:00:00 - ${endDate.toLocaleDateString()} 23:59:59)`;
        }
        setDateRangeText(rangeText);
        
        // Get API response
        console.log(`Fetching analytics for category: ${category?.name}`);
        console.log(`Time range: ${startTime} to ${endTime}, interval: ${apiIntervalMap[timeInterval]}`);
        
        const data = await getCategoryAnalytics(
          startTime,
          endTime,
          apiIntervalMap[timeInterval] as "15 minutes" | "1 hour" | "1 day",
          [category?.name || ""]
        );
        
        // Detailed API response logging
        console.log(`======= COMPLETE API RESPONSE FOR ${timeInterval} VIEW =======`);
        console.log('API Response:', data);
        if (data?.result) {
          console.log(`Results count: ${data.result.length} data points`);
          
          if (data.result.length > 0) {
            // Log first few results
            console.log('First 3 data points:', data.result.slice(0, 3));
            
            // Log fields available in the first item
            const firstItem = data.result[0];
            console.log('Fields in first data point:', Object.keys(firstItem));
            
            // Check for category field
            console.log(`Category field "${category?.name || ""}" exists:`, category?.name ? (category.name in firstItem) : false);
            
            // Show all properties and their values for debugging
            console.log('All properties of first item:');
            Object.entries(firstItem).forEach(([key, value]: [string, any]) => {
              console.log(`- ${key}: ${value} (type: ${typeof value})`);
            });
            
            // Check for non-zero values
            if (category?.name) {
              const categoryName = category.name;
              const nonZeroItems = data.result.filter((item: AnalyticsResultItem) => 
                typeof item[categoryName] === 'number' && item[categoryName] > 0
              );
              console.log(`Items with non-zero counts: ${nonZeroItems.length}`);
              if (nonZeroItems.length > 0) {
                console.log('Non-zero items:', nonZeroItems);
              }
            }

            // Additional logging to see how many items have the category field vs don't have it
            if (category?.name) {
              const categoryName = category.name;
              const itemsWithCategory = data.result.filter((item: AnalyticsResultItem) => 
                categoryName in item
              ).length;
              console.log(`Items with category field: ${itemsWithCategory}/${data.result.length}`);
              console.log(`Items without category field: ${data.result.length - itemsWithCategory}/${data.result.length}`);
            }
          }
        }
        console.log(`===========================================================`);
        
        if (isMounted && data?.result?.length) {
          // Process the API response data
          const processedData = processApiData(data, category?.name || "", timeInterval);
          setStatisticsData(processedData);
        } else {
          setStatisticsData([]);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        
        if (isMounted) {
          toast({ 
            title: "Ошибка", 
            description: "Не удалось загрузить статистику сообщений", 
            variant: "destructive" 
          });
          setStatisticsData([]);
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    }
    
    fetchStatistics();
    
    return () => {
      isMounted = false;
    };
  }, [category, timeInterval, toast]);
  
  // Process API data based on selected time interval
  const processApiData = (data: AnalyticsResponse, categoryName: string, interval: TimeInterval): MessageStatPoint[] => {
    if (!data.result || !data.result.length) return [];
    
    console.log(`Processing ${data.result.length} data points for interval: ${interval}`);
    
    // Map API data to chart format
    const mappedData = data.result.map((item: AnalyticsResultItem) => {
      const timestamp = new Date(item.interval);
      const count = typeof item[categoryName] === 'number' ? item[categoryName] as number : 0;
      
      let displayInterval: string;
      if (interval === '15min') {
        // For 15min view, show date and time (DD.MM HH:MM)
        const day = timestamp.getDate().toString().padStart(2, '0');
        const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        const time = timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        displayInterval = `${day}.${month} ${time}`;
      } else if (interval === '1hour') {
        // For hourly view, show date and hour (DD.MM HH:00)
        const day = timestamp.getDate().toString().padStart(2, '0');
        const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        const hour = timestamp.getHours().toString().padStart(2, '0');
        displayInterval = `${day}.${month} ${hour}:00`;
      } else {
        // For daily view, show date (DD MMM)
        displayInterval = timestamp.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        // Log to verify we're processing timestamps through end of day
        if (count > 0) {
          console.log(`Daily data point: ${displayInterval}, time: ${timestamp.toLocaleTimeString()}, count: ${count}`);
        }
      }
      
      return {
        interval: displayInterval,
        count: count,
        // Store original timestamp for sorting
        timestamp: timestamp.getTime()
      };
    });
    
    // Sort by timestamp
    const sortedData = mappedData.sort((a, b) => a.timestamp - b.timestamp);
    
    // For daily view, we might need to aggregate multiple entries per day
    if (interval === '1day') {
      const aggregatedData = new Map<string, number>();
      
      for (const item of sortedData) {
        if (aggregatedData.has(item.interval)) {
          aggregatedData.set(item.interval, aggregatedData.get(item.interval)! + item.count);
        } else {
          aggregatedData.set(item.interval, item.count);
        }
      }
      
      const finalData = Array.from(aggregatedData).map(([interval, count]) => ({ interval, count }));
      console.log('Daily aggregated data:', finalData);
      return finalData;
    }
    
    // Return formatted data for chart (without timestamp property)
    return sortedData.map(({ interval, count }) => ({ interval, count }));
  };
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-2xl font-bold">{category?.name} - Статистика по времени</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Количество сообщений по времени</CardTitle>
          <CardDescription>
            Статистика количества найденных сообщений в категории по временным интервалам
            {dateRangeText && (
              <div className="mt-2 text-xs font-medium text-muted-foreground">
                {dateRangeText}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1hour" onValueChange={(value) => setTimeInterval(value as TimeInterval)}>
            <TabsList className="mb-4">
              <TabsTrigger value="15min">15 минут</TabsTrigger>
              <TabsTrigger value="1hour">1 час</TabsTrigger>
              <TabsTrigger value="1day">1 день</TabsTrigger>
            </TabsList>
            
            <TabsContent value={timeInterval} className="mt-4">
              {statsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
                </div>
              ) : statisticsData.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statisticsData}
                      margin={{ top: 30, right: 30, left: 30, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="interval" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        // For 15min view, don't show all labels as it would be too crowded
                        interval={timeInterval === '15min' ? 'preserveEnd' : timeInterval === '1hour' ? 1 : 0}
                        fontSize={9}
                        tick={{ fill: '#666' }}
                      >
                        <Label value="Интервал" position="insideBottom" offset={-10} />
                      </XAxis>
                      <YAxis fontSize={12} tick={{ fill: '#666' }}>
                        <Label value="Количество" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                      </YAxis>
                      <Tooltip 
                        formatter={(value: number) => [`${value} сообщений`, 'Количество']}
                        labelFormatter={(label: string) => timeInterval === '1day' ? `Дата: ${label} (00:00-23:59)` : `Дата и время: ${label}`}
                        contentStyle={{ fontSize: '12px', borderRadius: '4px' }}
                      />
                      <Bar 
                        dataKey="count"
                        fill="#FFC107"
                        name="Количество сообщений"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        <LabelList 
                          dataKey="count" 
                          position="top" 
                          fill="#666"
                          fontSize={10} 
                          offset={5}
                          formatter={(value: number) => value > (timeInterval === '15min' ? 35 : timeInterval === '1hour' ? 120 : 400) ? value : ''}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center py-16 text-muted-foreground">
                  <p>Нет данных для отображения</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 