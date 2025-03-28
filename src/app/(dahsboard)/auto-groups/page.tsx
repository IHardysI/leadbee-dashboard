"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Loader2, PlusCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import PaginationUniversal from '@/components/widgets/PaginationUniversal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { searchChannels, SearchChannelResult } from "@/components/shared/api/autoGroups"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Interface for chat/channel items
interface AutoGroupItem {
  id: string | number;
  name: string;
  type: "Chat" | "Channel";
  subscribersCount: number;
  spamPercentage: number;
  isRecommended?: boolean;
  description?: string;
}

// Mock function to add selected groups to collection - replace with actual API call later
const addToSelection = async (selectedIds: (string | number)[]): Promise<{ success: boolean }> => {
  // This is a mock implementation
  // Replace with actual API call to backend
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return { success: true };
};

export default function AutoGroupsPage() {
  const [autoGroups, setAutoGroups] = useState<AutoGroupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<(string | number)[]>([]);
  const [isAddSelectionOpen, setIsAddSelectionOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Pagination state
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');

  // Handle search execution when search button is clicked
  const executeSearch = () => {
    setSearchQuery(searchTerm);
    // Reset to first page when performing a new search
    setCurrentPage(1);
    setNavigationMode('pagination');
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };
  
  // Fetch data when search query or page changes
  useEffect(() => {
    async function fetchAutoGroups() {
      if (!searchQuery) {
        setAutoGroups([]);
        setTotalCount(0);
        return;
      }
      
      // Set the appropriate loading state based on the navigation mode
      if (navigationMode === 'loadmore') {
        setLoadMoreLoading(true);
      } else {
        setPageLoading(true);
      }
      
      try {
        // Calculate offset based on current page
        const offset = navigationMode === 'loadmore' && currentPage > 1 
          ? (currentPage - 1) * itemsPerPage 
          : 0;
        
        const response = await searchChannels(
          searchQuery,
          itemsPerPage,
          undefined, // No categories for basic search
          offset
        );
        
        // Map API response to our interface
        const transformedItems: AutoGroupItem[] = response.results.map((item: SearchChannelResult) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          subscribersCount: item.subscribers,
          spamPercentage: item.spam_percentage,
          isRecommended: item.is_recommended,
          description: item.description
        }));
        
        if (navigationMode === 'pagination') {
          // For standard pagination, replace the list with new results
          setAutoGroups(transformedItems);
        } else {
          // For "load more" functionality, append new items to the existing list
          setAutoGroups(prev => {
            const newItems = transformedItems.filter(
              (item) => !prev.some((existing) => existing.id === item.id)
            );
            return [...prev, ...newItems];
          });
        }
        
        setTotalCount(response.total_results);
      } catch (error) {
        console.error('Error fetching auto groups:', error);
        toast({ 
          title: "Ошибка", 
          description: "Не удалось загрузить список групп", 
          variant: "destructive" 
        });
      } finally {
        // Clear both loading states
        setPageLoading(false);
        setLoadMoreLoading(false);
      }
    }
    
    fetchAutoGroups();
  }, [searchQuery, currentPage, itemsPerPage, navigationMode, toast]);

  const handleGroupSelectionChange = (groupId: string | number, checked: boolean) => {
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

  // Add a more clear loadMore function
  const handleLoadMore = () => {
    setNavigationMode('loadmore');
    setCurrentPage(prev => prev + 1);
  };

  // Only show full page loader when initial search or page navigation is happening
  if (pageLoading && autoGroups.length === 0) {
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
            placeholder="Поиск каналов и чатов" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9 w-full" 
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Show overlay loader when changing pages with existing results */}
      <div className="relative">
        {pageLoading && autoGroups.length > 0 && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
          </div>
        )}
        
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
                    <div className="flex items-center">
                      {group.name}
                      {group.isRecommended && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="ml-2 bg-green-100 text-green-800 pointer-events-none">
                                Рекомендуемый
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Этот канал рекомендуется системой</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{group.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        group.type === "Channel" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      } whitespace-normal pointer-events-none`}
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
              {autoGroups.length === 0 && !pageLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery ? 
                      "По вашему запросу ничего не найдено" : 
                      "Введите поисковый запрос и нажмите Enter для поиска"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Show "Load More" loader below the table */}
      {loadMoreLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {totalCount > 0 && !loadMoreLoading && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={computedTotalPages}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
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
