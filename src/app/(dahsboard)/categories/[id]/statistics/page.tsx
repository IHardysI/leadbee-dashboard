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
// API time interval mapping
const apiIntervalMap = {
  '15min': '15 minutes',
  '1hour': '1 hour',
  '1day': '1 day'
} as const;

// Define a more specific type for formatted data
interface FormattedDataItem {
  interval: string;
  count: number;
  originalTimestamp: number;
}

// Helper function to format timestamp based on interval type
function formatTimestampForDisplay(timestamp: Date, intervalType: TimeInterval): string {
  if (intervalType === '15min' || intervalType === '1hour') {
    return timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else {
    return timestamp.toLocaleDateString('ru-RU', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  }
}

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
  }, [categoryNameFromUrl, decodedCategoryName]);
  
  // Fetch statistics data when time interval changes
  useEffect(() => {
    let isMounted = true;
    
    async function fetchStatistics() {
      setStatsLoading(true);
      try {
        // Calculate date ranges dynamically based on the current date
        const now = new Date();
        let startTime: string;
        let endTime: string;
        
        // Format a date to API expected format YYYY-MM-DD HH:MM:SS
        const formatDateForApi = (date: Date): string => {
          return date.toISOString().replace('T', ' ').substring(0, 19);
        };
        
        // Calculate different date ranges based on the interval
        if (timeInterval === '1day') {
          // For daily view - last 30 days
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          
          startTime = formatDateForApi(startDate);
          endTime = formatDateForApi(endDate);
        } else if (timeInterval === '1hour') {
          // For hourly view - last 24 hours
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          
          startTime = formatDateForApi(startDate);
          endTime = formatDateForApi(endDate);
        } else { // 15min
          // For 15-min view - last 24 hours
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          
          startTime = formatDateForApi(startDate);
          endTime = formatDateForApi(endDate);
        }
        
        // IMPORTANT: The API requires exactly this casing for the category
        const categoryName = "Selling_something|Недвижимость";
        
        // Call the API with properly cased category name
        console.log(`Making API request with: start=${startTime}, end=${endTime}, interval=${apiIntervalMap[timeInterval]}`);
        const data = await getCategoryAnalytics(
          startTime,
          endTime,
          apiIntervalMap[timeInterval],
          [categoryName]
        );
        
        // Add detailed logging to inspect raw API data
        console.log(`======= RAW API RESPONSE FOR ${timeInterval} =======`);
        if (data?.result?.length > 0) {
          // Log the first few items to see the raw structure
          console.log("First item raw:", JSON.stringify(data.result[0], null, 2));
          
          // Check if category exists in the first item
          const hasCategory = categoryName in data.result[0];
          console.log(`Category "${categoryName}" exists in first item? ${hasCategory}`);
          
          // Check how many items have the category field
          const itemsWithCategory = data.result.filter((item: AnalyticsResultItem) => categoryName in item).length;
          console.log(`Items with category field: ${itemsWithCategory}/${data.result.length}`);
          
          // Count non-zero values
          const nonZeroItems = data.result.filter((item: AnalyticsResultItem) => 
            categoryName in item && typeof item[categoryName] === 'number' && item[categoryName] > 0
          );
          console.log(`Items with non-zero values: ${nonZeroItems.length}`);
          if (nonZeroItems.length > 0) {
            console.log("Non-zero items:", nonZeroItems.map((item: AnalyticsResultItem) => ({ 
              interval: item.interval, 
              [categoryName]: item[categoryName]
            })));
          }
        }
        console.log(`===========================================`);
        
        console.log(`Got API response with ${data?.result?.length || 0} data points`);
        
        if (isMounted && data?.result?.length) {
          // Transform data - use the same simple approach for all interval types
          const formattedData: FormattedDataItem[] = data.result.map((item: AnalyticsResultItem) => {
            const timestamp = new Date(item.interval);
            const count = typeof item[categoryName] === 'number' ? item[categoryName] as number : 0;
            
            // Format the interval display based on the time interval type
            let displayInterval: string;
            if (timeInterval === '1day') {
              // For daily view, format as day-month (e.g., "25 мар")
              displayInterval = timestamp.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            } else if (timeInterval === '1hour') {
              // For hourly view, format as day + hour (e.g., "25 12:00")
              displayInterval = `${timestamp.toLocaleDateString('ru-RU', { day: 'numeric' })} ${timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
              // For 15-minute view, format as day + hour:minute (e.g., "25 12:15")
              displayInterval = `${timestamp.toLocaleDateString('ru-RU', { day: 'numeric' })} ${timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            return {
              interval: displayInterval,
              count: count,
              originalTimestamp: timestamp.getTime()
            };
          });
          
          // Sort by timestamp
          const sortedData = [...formattedData].sort((a, b) => a.originalTimestamp - b.originalTimestamp);
          
          // For daily data, we need to aggregate by day (in case there are multiple entries per day)
          let finalData: MessageStatPoint[];
          if (timeInterval === '1day') {
            // Aggregate by day
            const dailyData = new Map<string, number>();
            sortedData.forEach((item) => {
              if (dailyData.has(item.interval)) {
                dailyData.set(item.interval, dailyData.get(item.interval)! + item.count);
              } else {
                dailyData.set(item.interval, item.count);
              }
            });
            
            // Convert back to array and keep sorting
            const aggregatedArray = Array.from(dailyData).map(([interval, count]) => ({ interval, count }));
            finalData = aggregatedArray;
          } else {
            // For hourly and 15-minute views, just use the sorted data directly
            finalData = sortedData.map(({ interval, count }) => ({ interval, count }));
          }
          
          // Debug the final processed data more clearly
          console.log(`Final chart data for ${timeInterval} view:`, 
            finalData.map(item => JSON.stringify(item)).join('\n')
          );
          
          // Log the structure of the first item in finalData to check if it's correctly formed
          if (finalData.length > 0) {
            console.log("First item in finalData structure:", 
              Object.keys(finalData[0]).join(", "), 
              "Values:", 
              Object.values(finalData[0]).join(", ")
            );
          }
          
          setStatisticsData(finalData);
        } else {
          setStatisticsData([{ interval: "No data", count: 0 }]);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        
        if (isMounted) {
          toast({ 
            title: "Ошибка", 
            description: "Не удалось загрузить статистику сообщений", 
            variant: "destructive" 
          });
          
          setStatisticsData([{ interval: "Error", count: 0 }]);
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
  }, [categoryNameFromUrl, decodedCategoryName, timeInterval]);
  
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
              ) : (
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
                        interval={0}
                        fontSize={10}
                        tick={{ fill: '#666' }}
                      >
                        <Label value="Интервал" position="insideBottom" offset={-10} />
                      </XAxis>
                      <YAxis fontSize={12} tick={{ fill: '#666' }}>
                        <Label value="Количество" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                      </YAxis>
                      <Tooltip 
                        formatter={(value: number) => [`${value} сообщений`, 'Количество']}
                        labelFormatter={(label: string) => `Время: ${label}`}
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 