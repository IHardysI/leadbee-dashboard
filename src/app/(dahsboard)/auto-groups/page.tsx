"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Loader2, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import PaginationUniversal from '@/components/widgets/PaginationUniversal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Interface for chat/channel items
interface AutoGroupItem {
  id: string;
  name: string;
  type: "Chat" | "Channel";
  subscribersCount: number;
  spamPercentage: number;
}

// Mock API function - replace with actual API call
const searchAutoGroups = async (
  searchTerm: string,
  page: number,
  perPage: number
): Promise<{
  items: AutoGroupItem[];
  totalCount: number;
}> => {
  // This is a mock implementation
  // Replace with actual API call to backend
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Mock data
  const mockData: AutoGroupItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `id-${i + 1}`,
    name: `${searchTerm ? `${searchTerm} ` : ''}${i % 2 === 0 ? 'Chat' : 'Channel'} ${i + 1}`,
    type: i % 2 === 0 ? "Chat" : "Channel",
    subscribersCount: Math.floor(Math.random() * 10000),
    spamPercentage: Math.floor(Math.random() * 100)
  }));
  
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = mockData.slice(startIndex, endIndex);
  
  return {
    items: paginatedData,
    totalCount: mockData.length
  };
};

// Mock function to add selected groups to collection
const addToSelection = async (selectedIds: string[]): Promise<{ success: boolean }> => {
  // This is a mock implementation
  // Replace with actual API call to backend
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return { success: true };
};

export default function AutoGroupsPage() {
  const [autoGroups, setAutoGroups] = useState<AutoGroupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isAddSelectionOpen, setIsAddSelectionOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Pagination state
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');

  // Search function with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchTerm]);
  
  // Fetch data when search term or page changes
  useEffect(() => {
    async function fetchAutoGroups() {
      setLoading(true);
      try {
        const response = await searchAutoGroups(debouncedSearchTerm, currentPage, itemsPerPage);
        
        if (navigationMode === 'pagination') {
          setAutoGroups(response.items);
        } else {
          setAutoGroups(prev => {
            const newItems = response.items.filter(
              (item) => !prev.some((existing) => existing.id === item.id)
            );
            return [...prev, ...newItems];
          });
        }
        
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error('Error fetching auto groups:', error);
        toast({ 
          title: "Ошибка", 
          description: "Не удалось загрузить список групп", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchAutoGroups();
  }, [debouncedSearchTerm, currentPage, itemsPerPage, navigationMode, toast]);

  const handleGroupSelectionChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds(prev => [...prev, groupId]);
    } else {
      setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
    }
  };

  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
  };
  
  const handleAddToSelection = async () => {
    if (selectedGroupIds.length === 0) {
      toast({ 
        title: "Предупреждение", 
        description: "Выберите хотя бы одну группу для добавления", 
        variant: "default" 
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await addToSelection(selectedGroupIds);
      if (response.success) {
        toast({ 
          title: "Успешно", 
          description: `${selectedGroupIds.length} групп(ы) добавлены в выборку`, 
          variant: "default" 
        });
        setSelectedGroupIds([]);
        setIsAddSelectionOpen(false);
      }
    } catch (error) {
      console.error('Error adding groups to selection:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось добавить группы в выборку", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const computedTotalPages = totalCount ? Math.ceil(totalCount / itemsPerPage) : 1;

  if (loading && autoGroups.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            className="bg-cYellow/90 hover:bg-cYellow flex-grow sm:flex-grow-0"
            onClick={() => setIsAddSelectionOpen(true)}
            disabled={selectedGroupIds.length === 0}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить в выборку
          </Button>
        </div>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск по названию" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 w-full" 
          />
          {loading && debouncedSearchTerm && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 whitespace-normal">
                <div className="flex items-center justify-center h-full">
                  <Checkbox
                    checked={autoGroups.length > 0 && autoGroups.every((group) => selectedGroupIds.includes(group.id))}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedGroupIds(autoGroups.map(group => group.id));
                      } else {
                        setSelectedGroupIds([]);
                      }
                    }}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[250px] whitespace-normal">Название</TableHead>
              <TableHead className="w-[100px] whitespace-normal">Тип</TableHead>
              <TableHead className="w-[150px] whitespace-normal">Кол-во подписчиков</TableHead>
              <TableHead className="w-[150px] whitespace-normal">Оценка спама (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {autoGroups.map((group) => (
              <TableRow key={group.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={(e) => e.stopPropagation()} className="align-middle whitespace-normal">
                  <div className="flex items-center justify-center h-full">
                    <Checkbox 
                      checked={selectedGroupIds.includes(group.id)} 
                      onCheckedChange={(checked: boolean) => handleGroupSelectionChange(group.id, checked)}
                    />
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal font-medium">
                  {group.name}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      group.type === "Channel" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    } whitespace-normal`}
                  >
                    {group.type === "Channel" ? "Канал" : "Чат"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {group.subscribersCount.toLocaleString('ru-RU')}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          group.spamPercentage > 75 ? "bg-red-500" : 
                          group.spamPercentage > 50 ? "bg-orange-500" : 
                          group.spamPercentage > 25 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`} 
                        style={{ width: `${group.spamPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{group.spamPercentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {autoGroups.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalCount > 0 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={computedTotalPages}
          onPageChange={handlePageChange}
          onLoadMore={() => {
            setNavigationMode('loadmore');
            setCurrentPage(prev => prev + 1);
          }}
          showLoadMore={currentPage < computedTotalPages}
        />
      )}

      {/* Dialog for adding to selection */}
      {isAddSelectionOpen && (
        <Dialog open={true} onOpenChange={() => setIsAddSelectionOpen(false)}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить в общую выборку</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Вы выбрали {selectedGroupIds.length} групп(ы) для добавления в общую выборку.</p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddSelectionOpen(false)}
              >
                Отмена
              </Button>
              <Button 
                className="bg-cYellow/90 hover:bg-cYellow" 
                onClick={handleAddToSelection}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Добавление...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Добавить
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
