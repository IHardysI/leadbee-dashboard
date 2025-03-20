"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ChartContainer } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, LabelList } from 'recharts'
import { ResponsiveContainer } from 'recharts'

// Interface for category data
interface Category {
  id: string;
  name: string;
  prompt: string;
}

// Interface for message statistics data point
interface MessageStatPoint {
  interval: string;
  count: number;
}

// Time interval options
type TimeInterval = '15min' | '1hour' | '1day';

// Mock API function to get category details
const getCategoryById = async (id: string): Promise<Category> => {
  // Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // Mock data - using a generic name instead of showing ID
  return {
    id,
    name: "Категория",
    prompt: "Example prompt for this category"
  };
};

// Mock API function to get message statistics
const getMessageStatistics = async (categoryId: string, interval: TimeInterval): Promise<MessageStatPoint[]> => {
  // Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  // Generate mock data based on selected interval
  const currentDate = new Date();
  let data: MessageStatPoint[] = [];
  
  // Helper function to create more realistic data patterns
  const getPatternedValue = (date: Date, baseValue: number, variance: number) => {
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Higher values during work hours (9-18)
    let timeMultiplier = 0.6;
    if (hour >= 9 && hour <= 18) {
      timeMultiplier = 1.0;
    } else if (hour >= 19 && hour <= 22) {
      timeMultiplier = 0.8;
    }
    
    // Lower values on weekends
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;
    
    // Add some randomness but with patterns
    const randomFactor = 0.7 + (Math.sin(date.getTime() / 10000000) + 1) * 0.15;
    
    // Ensure we never have zero values by adding a minimum of 5
    return Math.max(5, Math.floor(baseValue * timeMultiplier * weekendMultiplier * randomFactor * (0.85 + Math.random() * 0.3)));
  };
  
  switch (interval) {
    case '15min':
      // Generate data for the last 24 hours in 15-minute intervals
      for (let i = 0; i < 24 * 4; i++) {
        const date = new Date(currentDate);
        date.setMinutes(currentDate.getMinutes() - (15 * i));
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        data.unshift({
          interval: timeStr,
          count: getPatternedValue(date, 35, 20)
        });
      }
      break;
    case '1hour':
      // Generate data for the last 24 hours in 1-hour intervals
      for (let i = 0; i < 24; i++) {
        const date = new Date(currentDate);
        date.setHours(currentDate.getHours() - i);
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        data.unshift({
          interval: timeStr,
          count: getPatternedValue(date, 150, 75)
        });
      }
      break;
    case '1day':
      // Generate data for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        const dayStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        
        // Add a trend - gradually increasing values over time
        const trendFactor = 1 + (i / 60); // Subtle upward trend
        
        data.unshift({
          interval: dayStr,
          count: getPatternedValue(date, 600 * trendFactor, 300)
        });
      }
      break;
  }
  
  return data;
};

export default function CategoryStatisticsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const categoryId = params.id as string;
  
  // Get category name from query params if available
  const categoryNameFromQuery = searchParams.get('name');
  const decodedCategoryName = categoryNameFromQuery 
    ? decodeURIComponent(categoryNameFromQuery).replace(/-/g, ' ')
    : "Категория"; // Use a generic name if none provided
  
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
        const data = await getCategoryById(categoryId);
        // Always use the name from query params instead of the API
        data.name = decodedCategoryName;
        
        if (isMounted) {
          setCategory(data);
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
            id: categoryId,
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
  }, [categoryId, decodedCategoryName]); // removed toast dependency
  
  // Fetch statistics data when time interval changes
  useEffect(() => {
    let isMounted = true;
    
    async function fetchStatistics() {
      setStatsLoading(true);
      try {
        const data = await getMessageStatistics(categoryId, timeInterval);
        
        if (isMounted) {
          setStatisticsData(data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        
        if (isMounted) {
          toast({ 
            title: "Ошибка", 
            description: "Не удалось загрузить статистику сообщений", 
            variant: "destructive" 
          });
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
  }, [categoryId, timeInterval]); // removed toast dependency
  
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