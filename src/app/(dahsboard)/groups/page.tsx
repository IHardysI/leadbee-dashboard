"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, UserPlus, Search, Pencil, CheckCircle, XCircle, SlidersHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getGroupsList, createGroup, changeParsingStatus, getGroupDetails, parseParticipants } from "@/components/shared/api/groups"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { getCategoriesList } from "@/components/shared/api/categories"
import { analyzeGroup } from "@/components/shared/api/analytics"
import PaginationUniversal from '@/components/widgets/PaginationUniversal'

interface Group {
  id: string
  name: string
  analysisStatus: "done" | "pending" | "failed" | "not_started"
  subscribers: string
  requestsCount: {
    spam: number,
    other: number,
    freelancers: number
  }
  actualLeads: number,
  potentialLeads: number,
  joinedAccounts: string[],
  analysisResult?: {
    requests_count: Record<string, number>,
    potential_requests: Record<string, number>,
    total_leads_count?: number,
    total_potential_requests?: number
  }
  location?: string
  parsing: "done" | "in progress" | "not started"
  totalPrice?: number
  analysisTimeSeconds?: number
}

interface DetailedGroup {
  id: string;
  title: string;
  telegram_id: number;
  join_link: string;
  parsing: boolean;
  analysis_status: string;
  analysis_result?: {
    analysis_range_days?: number;
    total_messages_count?: number;
    total_price?: number;
    requests_count?: Record<string, number>;
    potential_requests?: Record<string, number>;
    analysis_time_seconds?: number;
    total_leads_count?: number;
    total_potential_requests?: number;
  };
  joined_accounts?: string[];
  participants_parsing_status?: string;
  participants?: string[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState<boolean>(false);
  const [newGroupLink, setNewGroupLink] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState<boolean>(false);
  const [analysisCategories, setAnalysisCategories] = useState<any[]>([]);
  const [selectedAnalysisCategories, setSelectedAnalysisCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const groupsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');

  const [detailedGroup, setDetailedGroup] = useState<DetailedGroup | null>(null);
  const [isParsingParticipants, setIsParsingParticipants] = useState<boolean>(false);
  const [parsedParticipants, setParsedParticipants] = useState<string[]>([]);
  const [parsingProgress, setParsingProgress] = useState<{total: number; current: number} | null>(null);
  const [parsingInterval, setParsingInterval] = useState<NodeJS.Timeout | null>(null);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const computedTotalPages = totalCount ? Math.ceil(totalCount / groupsPerPage) : 1;
  const displayedGroups = filteredGroups;

  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
  };

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      try {
        const response = await getGroupsList(currentPage, groupsPerPage);
        if(response.status === "success") {
          const transformed = response.groups.map((group: any) => {
            const requestsCount = {
              spam: group.analysis_result?.requests_count?.spam || 0,
              other: group.analysis_result?.requests_count?.other || 0,
              freelancers: group.analysis_result?.requests_count?.["Фрилансеры"] || 0
            };
            const potentialRequests = {
              spam: group.analysis_result?.potential_requests?.spam || 0,
              other: group.analysis_result?.potential_requests?.other || 0,
              freelancers: group.analysis_result?.potential_requests?.["Фрилансеры"] || 0
            };
            const actualLeads = requestsCount.spam + requestsCount.other + requestsCount.freelancers;
            const potentialLeads = potentialRequests.spam + potentialRequests.other + potentialRequests.freelancers;
            return {
              id: group.id,
              name: group.title,
              analysisStatus: group.analysis_status ? group.analysis_status : "not_started",
              subscribers: "-",
              requestsCount,
              actualLeads,
              potentialLeads,
              joinedAccounts: group.joined_accounts || [],
              analysisResult: group.analysis_result ? group.analysis_result : { requests_count: {}, potential_requests: {}, total_leads_count: 0, total_potential_requests: 0 },
              location: group.join_link,
              parsing: group.parsing === true ? "done" : (group.parsing === "in progress" ? "in progress" : "not started"),
              totalPrice: group.analysis_result?.total_price,
              analysisTimeSeconds: group.analysis_result?.analysis_time_seconds
            };
          });
          if(navigationMode === 'pagination') {
            setGroups(transformed);
          } else {
            setGroups(prev => {
              const newGroups = transformed.filter(
                (group: any) => !prev.some((existing: any) => existing.id === group.id)
              );
              return [...prev, ...newGroups];
            });
          }
          if(response.totalPages) {
            setTotalCount(response.totalPages * groupsPerPage);
          } else if(response.total_count !== undefined) {
            setTotalCount(response.total_count);
          }
        } else {
          console.error('API returned error status:', response);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [currentPage, groupsPerPage, navigationMode, searchTerm]);

  useEffect(() => {
    if (isAnalysisDialogOpen && analysisCategories.length === 0) {
      (async () => {
        try {
          const response = await getCategoriesList();
          if(response.categories) {
            setAnalysisCategories(response.categories);
          }
        } catch (error) {
          console.error("Error fetching categories", error);
        }
      })();
    }
  }, [isAnalysisDialogOpen]);

  const handleGroupSelectionChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds(prev => [...prev, groupId]);
    } else {
      setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
    }
  };

  const handleAnalysisCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedAnalysisCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedAnalysisCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleStartAnalysis = async (group: Group) => {
    // Optimistically update the group's parsing status
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, parsing: "done" } : g));
    // Also update the selectedGroup if it is the same group
    setSelectedGroup(prev => prev && prev.id === group.id ? { ...prev, parsing: "done" } : prev);
    try {
      await changeParsingStatus(group.id, true);
    } catch (error) {
      console.error("Error starting analysis for group", group.id, error);
      // Optionally revert update if needed
    }
  };

  const handleStopAnalysis = async (group: Group) => {
    // Optimistically update the group's parsing status
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, parsing: "not started" } : g));
    // Also update the selectedGroup if it is the same group
    setSelectedGroup(prev => prev && prev.id === group.id ? { ...prev, parsing: "not started" } : prev);
    try {
      await changeParsingStatus(group.id, false);
    } catch (error) {
      console.error("Error stopping analysis for group", group.id, error);
      // Optionally revert update if needed
    }
  };

  const handleAddGroup = async () => {
    const trimmedLink = newGroupLink.trim();
    if (!trimmedLink) {
      setErrorMessage("Ссылка не может быть пустой");
      return;
    }
    try {
      console.log("Creating group with link:", trimmedLink);
      const response = await createGroup(trimmedLink);
      if(response.status !== "success") {
        setErrorMessage(response.message || "Ошибка при создании группы");
      } else {
        toast({ title: "Группа успешно добавлена", variant: "default" });
        setIsAddGroupOpen(false);
        setNewGroupLink("");
        // Optionally refresh groups list here if needed
      }
    } catch (error: any) {
      console.error("Error in handleAddGroup", error);
      let errMsg = error.response?.data?.message || "Ошибка при создании группы";
      if (errMsg.includes("empty sequence")) {
        errMsg = "Не удалось создать группу: внутренняя ошибка сервера";
      }
      setErrorMessage(errMsg);
    }
  };

  const handleGroupSelect = async (group: Group) => {
    // First, clean up any existing parsing processes before changing groups
    if (parsingInterval) {
      clearInterval(parsingInterval);
      setParsingInterval(null);
    }
    
    // Reset participant-related states when selecting a new group
    setIsParsingParticipants(false);
    setParsedParticipants([]);
    setParsingProgress(null);
    
    setSelectedGroup(group);
    
    try {
      // Fetch detailed group information
      setLoading(true);
      const response = await getGroupDetails(group.id);
      if (response.group) {
        setDetailedGroup(response.group);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось загрузить детальную информацию о группе", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParseParticipants = async (groupId: string) => {
    // Clean up any existing interval first
    if (parsingInterval) {
      clearInterval(parsingInterval);
      setParsingInterval(null);
    }
    
    try {
      setIsParsingParticipants(true);
      setParsedParticipants([]);
      setParsingProgress({ total: 0, current: 0 });
      
      // Start parsing
      await parseParticipants(groupId);
      
      toast({ 
        title: "Парсинг участников запущен", 
        description: "Парсинг будет показан в реальном времени.",
        variant: "default" 
      });
      
      // Track the parsing completion state to prevent duplicate toasts
      let hasShownCompletionToast = false;
      
      // Set up polling for updates
      const intervalId = setInterval(async () => {
        try {
          // Check if the component is still mounted with this specific group
          if (!selectedGroup || selectedGroup.id !== groupId) {
            clearInterval(intervalId);
            return;
          }
          
          const response = await getGroupDetails(groupId);
          if (response.group && response.group.participants) {
            const newParticipants = response.group.participants;
            setParsedParticipants(newParticipants);
            
            // Update detailed group with the latest participants
            setDetailedGroup(prevGroup => {
              if (!prevGroup || prevGroup.id !== groupId) return prevGroup;
              return {
                ...prevGroup,
                participants: newParticipants,
                participants_parsing_status: response.group.participants_parsing_status
              };
            });
            
            // If parsing is complete, stop polling
            if (response.group.participants_parsing_status === 'done' && !hasShownCompletionToast) {
              hasShownCompletionToast = true; // Prevent duplicate toasts
              
              clearInterval(intervalId);
              setParsingInterval(null);
              setIsParsingParticipants(false);
              
              toast({ 
                title: "Парсинг участников завершен", 
                description: `Найдено ${newParticipants.length} участников.`,
                variant: "default" 
              });
            } else if (response.group.participants_parsing_status !== 'done') {
              // Update progress if possible
              setParsingProgress(prev => ({
                total: response.group.participants_count || prev?.total || 0,
                current: newParticipants.length
              }));
            }
          }
        } catch (error) {
          console.error("Error polling for participants updates:", error);
        }
      }, 2000); // Poll every 2 seconds
      
      setParsingInterval(intervalId);
      
    } catch (error) {
      console.error("Error parsing participants:", error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось запустить парсинг участников", 
        variant: "destructive" 
      });
      setIsParsingParticipants(false);
    }
  };

  // Cleanup interval when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (parsingInterval) {
        clearInterval(parsingInterval);
      }
    };
  }, [parsingInterval]);
  
  // Also clean up when a dialog is closed
  useEffect(() => {
    if (!selectedGroup && parsingInterval) {
      clearInterval(parsingInterval);
      setParsingInterval(null);
      setIsParsingParticipants(false);
      setParsedParticipants([]);
      setParsingProgress(null);
    }
  }, [selectedGroup, parsingInterval]);

  if (loading) {
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
          <Button className="bg-cYellow/90 hover:bg-cYellow flex-grow sm:flex-grow-0" onClick={() => setIsAddGroupOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить
          </Button>
          <Button className="bg-cYellow/90 hover:bg-cYellow flex-grow sm:flex-grow-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить чаты массово
          </Button>
          <Button variant="outline" className="flex-grow sm:flex-grow-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Присоединение аккаунтов
          </Button>
          <Button variant="outline" className="flex-grow sm:flex-grow-0" onClick={() => setIsAnalysisDialogOpen(true)}>
            Начать анализ
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
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 whitespace-normal">
                <div className="flex items-center justify-center h-full">
                  <Checkbox
                    checked={filteredGroups.length > 0 && filteredGroups.every((group) => selectedGroupIds.includes(group.id))}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedGroupIds(filteredGroups.map(group => group.id));
                      } else {
                        setSelectedGroupIds([]);
                      }
                    }}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[250px] whitespace-normal">Группа</TableHead>
              <TableHead className="whitespace-normal">Статус анализа</TableHead>
              <TableHead className="whitespace-normal">Сбор данных</TableHead>
              <TableHead className="whitespace-normal">Количество подписчиков</TableHead>
              <TableHead className="whitespace-normal">Какие аккаунты вступили</TableHead>
              <TableHead className="w-40 whitespace-normal">Всего / Потенциальных лидов</TableHead>
              <TableHead className="whitespace-normal">Анализ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedGroups.map((group) => (
              <TableRow key={group.id} onClick={() => handleGroupSelect(group)} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={(e) => e.stopPropagation()} className="align-middle whitespace-normal">
                  <div className="flex items-center justify-center h-full">
                    <Checkbox checked={selectedGroupIds.includes(group.id)} onCheckedChange={(checked: boolean) => handleGroupSelectionChange(group.id, checked)} />
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Link href={group.location || "#"} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:text-blue-800 whitespace-normal">
                    {group.name}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {group.analysisStatus === "done" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center whitespace-normal">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      завершено
                    </Badge>
                  ) : group.analysisStatus === "pending" ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 inline-flex items-center whitespace-normal">
                      в ожидании
                    </Badge>
                  ) : group.analysisStatus === "failed" ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 inline-flex items-center whitespace-normal">
                      <XCircle className="h-3 w-3 mr-1" />
                      ошибка
                    </Badge>
                  ) : group.analysisStatus === "not_started" ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center whitespace-normal">
                      не начато
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {group.parsing === "done" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center whitespace-normal">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 inline-flex items-center whitespace-normal">
                      <XCircle className="h-3 w-3" />
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-normal">{group.subscribers}</TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-wrap gap-2">
                    {group.joinedAccounts.map((account) => (
                      <Badge key={account} className="whitespace-normal">{account}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="w-40 whitespace-normal">
                  {`${group.analysisResult?.total_leads_count ?? '-'} / ${group.analysisResult?.total_potential_requests !== undefined ? Number(group.analysisResult.total_potential_requests).toFixed(2) : '-'}`}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Button
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      group.parsing === "done" ? handleStopAnalysis(group) : handleStartAnalysis(group);
                    }}
                    variant={group.parsing === "done" ? "default" : "outline"}
                    className={`p-2 rounded-full transition-transform duration-200 ${group.parsing === "done" ? "scale-110" : ""}`}
                  >
                    <span className="sr-only">{group.parsing === "done" ? "Остановить анализ" : "Запустить анализ"}</span>
                    {group.parsing === "done" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-accent">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-black">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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

      {selectedGroup && (
        <Dialog open={true} onOpenChange={() => { setSelectedGroup(null); setDetailedGroup(null); }}>
          <DialogContent className="!w-[80vw] !max-w-[80vw]">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
              <DialogDescription>Подробная информация о группе</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border mt-2 max-h-[60vh] overflow-y-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Параметр</TableHead>
                    <TableHead>Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">ID группы</TableCell>
                    <TableCell className="whitespace-normal">{detailedGroup?.id || selectedGroup.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Название</TableCell>
                    <TableCell className="whitespace-normal">{detailedGroup?.title || selectedGroup.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Telegram ID</TableCell>
                    <TableCell className="whitespace-normal">{detailedGroup?.telegram_id || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Ссылка</TableCell>
                    <TableCell className="whitespace-normal">
                      <Link href={detailedGroup?.join_link || selectedGroup.location || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 whitespace-normal">
                        {detailedGroup?.join_link || selectedGroup.location || "-"}
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Статус анализа</TableCell>
                    <TableCell className="whitespace-normal">
                      {selectedGroup.analysisStatus === "done" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center whitespace-normal">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          завершено
                        </Badge>
                      ) : selectedGroup.analysisStatus === "pending" ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 inline-flex items-center whitespace-normal">
                          в ожидании
                        </Badge>
                      ) : selectedGroup.analysisStatus === "failed" ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 inline-flex items-center whitespace-normal">
                          <XCircle className="h-3 w-3 mr-1" />
                          ошибка
                        </Badge>
                      ) : selectedGroup.analysisStatus === "not_started" ? (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center whitespace-normal">
                          не начато
                        </Badge>
                      ) : null}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Сбор данных</TableCell>
                    <TableCell className="whitespace-normal">
                      {(detailedGroup?.parsing === true || selectedGroup.parsing === "done") ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center whitespace-normal">
                          <CheckCircle className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 inline-flex items-center whitespace-normal">
                          <XCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Период анализа (дней)</TableCell>
                    <TableCell className="whitespace-normal">
                      {detailedGroup?.analysis_result?.analysis_range_days || '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Всего сообщений</TableCell>
                    <TableCell className="whitespace-normal">
                      {detailedGroup?.analysis_result?.total_messages_count || '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Какие аккаунты вступили</TableCell>
                    <TableCell className="whitespace-normal">
                      {(detailedGroup?.joined_accounts?.length || selectedGroup.joinedAccounts.length) ? (
                        (detailedGroup?.joined_accounts || selectedGroup.joinedAccounts).map((account) => (
                          <Badge key={account} className="mr-1 whitespace-normal">{account}</Badge>
                        ))
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Всего лидов / Потенциальных лидов</TableCell>
                    <TableCell className="whitespace-normal">
                      {`${detailedGroup?.analysis_result?.total_leads_count ?? selectedGroup.analysisResult?.total_leads_count ?? '-'} / ${detailedGroup?.analysis_result?.total_potential_requests !== undefined ? Number(detailedGroup.analysis_result.total_potential_requests).toFixed(2) : (selectedGroup.analysisResult?.total_potential_requests !== undefined ? Number(selectedGroup.analysisResult.total_potential_requests).toFixed(2) : '-')}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Стоимость анализа</TableCell>
                    <TableCell className="whitespace-normal">
                      {detailedGroup?.analysis_result?.total_price !== undefined ? Number(detailedGroup.analysis_result.total_price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "$" : (selectedGroup.totalPrice !== undefined ? Number(selectedGroup.totalPrice).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "$" : '-')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Время анализа</TableCell>
                    <TableCell className="whitespace-normal">
                      {detailedGroup?.analysis_result?.analysis_time_seconds !== undefined ? Number(detailedGroup.analysis_result.analysis_time_seconds).toFixed(0) + " сек" : (selectedGroup.analysisTimeSeconds !== undefined ? Number(selectedGroup.analysisTimeSeconds).toFixed(0) + " сек" : '-')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Анализ</TableCell>
                    <TableCell className="whitespace-normal">
                      <Button
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectedGroup.parsing === "done" ? handleStopAnalysis(selectedGroup) : handleStartAnalysis(selectedGroup);
                        }}
                        variant={selectedGroup.parsing === "done" ? "default" : "outline"}
                        className={`p-2 rounded-full transition-transform duration-200 ${selectedGroup.parsing === "done" ? "scale-110" : ""}`}
                      >
                        <span className="sr-only">{selectedGroup.parsing === "done" ? "Остановить анализ" : "Запустить анализ"}</span>
                        {selectedGroup.parsing === "done" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-accent">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-black">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Show detailed requests count */}
                  <TableRow>
                    <TableCell colSpan={2} className="bg-gray-100 font-bold text-center">Запросы и потенциальные лиды</TableCell>
                  </TableRow>
                  
                  {detailedGroup?.analysis_result?.requests_count && Object.keys(detailedGroup.analysis_result.requests_count).map((key) => {
                    const value = detailedGroup.analysis_result?.requests_count?.[key] || 0;
                    const potentialValue = detailedGroup.analysis_result?.potential_requests?.[key] || 0;
                    const displayKey = key
                      .replace('ASK_FOR_ADVICE', 'Запрос совета')
                      .replace('Looking_for_something_job_offer', 'Поиск работы')
                      .replace('Selling_something', 'Продажа')
                      .replace('From_moderator', 'От модератора')
                      .replace('Other', 'Другое')
                      .replace(/\|/g, ' → ');
                    
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-bold whitespace-normal break-words">
                          {displayKey}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {value} / {Number(potentialValue).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Start of participants section */}
                  {/* Show participants information */}
                  <TableRow>
                    <TableCell colSpan={2} className="bg-gray-100 font-bold text-center">
                      Участники группы {isParsingParticipants && parsedParticipants.length > 0 
                        ? `(${parsedParticipants.length})` 
                        : detailedGroup?.participants?.length
                          ? `(${detailedGroup.participants.length})` 
                          : ''}
                      
                      {isParsingParticipants && (
                        <span className="ml-2 text-amber-600 text-sm font-normal">
                          <Loader2 className="inline-block animate-spin h-4 w-4 mr-1" />
                          Парсинг в процессе...
                          {parsingProgress && (
                            <span className="ml-1">
                              {parsingProgress.current} 
                              {parsingProgress.total > 0 ? ` из ~${parsingProgress.total}` : ''}
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={2} className="whitespace-normal">
                      {/* Show progress bar if parsing */}
                      {isParsingParticipants && parsingProgress && parsingProgress.total > 0 && (
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (parsingProgress.current / parsingProgress.total) * 100)}%` }}
                          />
                        </div>
                      )}
                      
                      {/* If we have participants to show, either from parsing or already loaded */}
                      {((isParsingParticipants && parsedParticipants.length > 0) || 
                        (detailedGroup?.participants && detailedGroup.participants.length > 0)) ? (
                        <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                          {(isParsingParticipants ? parsedParticipants : detailedGroup?.participants || []).map((participant) => (
                            <Badge key={participant} variant="outline" className="whitespace-normal">
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      ) : isParsingParticipants ? (
                        /* Show loading placeholder badges if parsing just started */
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="bg-gray-100 animate-pulse whitespace-normal">Загрузка...</Badge>
                          <Badge variant="outline" className="bg-gray-100 animate-pulse whitespace-normal">Загрузка...</Badge>
                          <Badge variant="outline" className="bg-gray-100 animate-pulse whitespace-normal">Загрузка...</Badge>
                        </div>
                      ) : (
                        /* Show empty state if no participants and not parsing */
                        <div className="text-center py-4 text-gray-500">
                          Участники не загружены. Нажмите "Начать парсинг участников" для их загрузки.
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  {/* End of participants section */}
                  
                  {/* Fallback to old fields if detailed data isn't available */}
                  {!detailedGroup?.analysis_result?.requests_count && selectedGroup.analysisResult?.requests_count && Object.keys(selectedGroup.analysisResult?.requests_count || {}).map((key) => {
                    const displayKey = key === "spam" ? "Спам" : key === "other" ? "Другое" : key === "freelancers" ? "Фрилансеры" : key;
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-bold whitespace-normal">{displayKey}</TableCell>
                        <TableCell className="whitespace-normal">
                          {selectedGroup.analysisResult?.requests_count[key]} / {Number(selectedGroup.analysisResult?.potential_requests[key] || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleParseParticipants(selectedGroup.id)}
                  disabled={isParsingParticipants}
                >
                  {isParsingParticipants ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Запуск парсинга...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Начать парсинг участников
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={() => { setSelectedGroup(null); setDetailedGroup(null); }}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isAddGroupOpen && (
        <Dialog open={true} onOpenChange={() => setIsAddGroupOpen(false)}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новую группу</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <Input
                placeholder="Вставьте ссылку"
                value={newGroupLink}
                onChange={(e) => setNewGroupLink(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button className="bg-cYellow/90 hover:bg-cYellow flex items-center" onClick={handleAddGroup}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {errorMessage && (
        <Dialog open={true} onOpenChange={() => setErrorMessage(null)}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Ошибка создания группы</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorMessage(null)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isAnalysisDialogOpen && (
        <Dialog open={true} onOpenChange={() => setIsAnalysisDialogOpen(false)}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Выберите категории для анализа</DialogTitle>
              <DialogDescription>Выберите категории, по которым нужно провести анализ выбранных групп</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 my-4">
              <div className="flex items-center">
                <Checkbox
                  checked={analysisCategories.length > 0 && selectedAnalysisCategories.length === analysisCategories.length}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedAnalysisCategories(analysisCategories.map((cat: any) => cat.id));
                    } else {
                      setSelectedAnalysisCategories([]);
                    }
                  }}
                />
                <span className="ml-2">Выбрать все</span>
              </div>
              {analysisCategories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox checked={selectedAnalysisCategories.includes(category.id)} onCheckedChange={(checked: boolean) => handleAnalysisCategoryChange(category.id, checked)} />
                  <span className="ml-2">{category.name}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={async () => {
                try {
                  const response = await analyzeGroup(selectedGroupIds, selectedAnalysisCategories);
                  toast({ title: "Анализ запущен", description: "Анализ выбранных групп запущен успешно." });
                  setIsAnalysisDialogOpen(false);
                } catch (error) {
                  console.error("Error launching analysis:", error);
                  toast({ title: "Ошибка", description: "Не удалось запустить анализ выбранных групп." });
                }
              }}>Запуск анализа</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

