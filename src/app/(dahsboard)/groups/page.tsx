"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, UserPlus, Search, Pencil, CheckCircle, XCircle, SlidersHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getGroupsList, createGroup, changeParsingStatus } from "@/components/shared/api/groups"
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
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [loadedCount, setLoadedCount] = useState(groupsPerPage);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const displayedGroups = navigationMode === 'loadmore'
    ? filteredGroups.slice(0, loadedCount)
    : filteredGroups.slice((currentPage - 1) * groupsPerPage, currentPage * groupsPerPage);

  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
    setLoadedCount(groupsPerPage);
  };

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await getGroupsList();
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
          setGroups(transformed);
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
  }, []);

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
              <TableRow key={group.id} onClick={() => setSelectedGroup(group)} className="cursor-pointer hover:bg-gray-50">
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant={group.parsing === "done" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAnalysis(group);
                      }}
                      className={`p-2 rounded-full transition-transform duration-200 ${group.parsing === "done" ? "scale-110" : ""}`}
                    >
                      <span className="sr-only">Запустить анализ</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 fill-current ${group.parsing === "done" ? "text-accent" : "text-black"}`}
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant={group.parsing !== "done" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopAnalysis(group);
                      }}
                      className={`p-2 rounded-full transition-transform duration-200 ${group.parsing !== "done" ? "scale-110" : ""}`}
                    >
                      <span className="sr-only">Остановить анализ</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 fill-current ${group.parsing !== "done" ? "text-accent" : "text-black"}`}
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Replace the Pagination section */}
      {totalPages > 1 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange}
          onLoadMore={() => {
            setNavigationMode('loadmore');
            setLoadedCount(loadedCount + groupsPerPage);
          }}
          showLoadMore={displayedGroups.length < filteredGroups.length}
        />
      )}

      {selectedGroup && (
        <Dialog open={true} onOpenChange={() => setSelectedGroup(null)}>
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
                      {selectedGroup.parsing === "done" ? (
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
                    <TableCell className="font-bold whitespace-normal">Количество подписчиков</TableCell>
                    <TableCell className="whitespace-normal">{selectedGroup.subscribers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Какие аккаунты вступили</TableCell>
                    <TableCell className="whitespace-normal">
                      {selectedGroup.joinedAccounts.length ? (
                        selectedGroup.joinedAccounts.map((account) => (
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
                      {selectedGroup.analysisResult?.total_leads_count ?? '-'} / {selectedGroup.analysisResult?.total_potential_requests !== undefined ? Number(selectedGroup.analysisResult.total_potential_requests).toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Стоимость анализа</TableCell>
                    <TableCell className="whitespace-normal">
                      {selectedGroup.totalPrice !== undefined ? Number(selectedGroup.totalPrice).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "$" : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Время анализа</TableCell>
                    <TableCell className="whitespace-normal">
                      {selectedGroup.analysisTimeSeconds !== undefined ? Number(selectedGroup.analysisTimeSeconds).toFixed(0) + " сек" : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Анализ</TableCell>
                    <TableCell className="whitespace-normal">
                      {selectedGroup.parsing === "done" ? "Запустить анализ" : "Остановить анализ"}
                    </TableCell>
                  </TableRow>
                  {Object.keys(selectedGroup.analysisResult?.requests_count || {}).map((key) => {
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
            <DialogFooter>
              <Button onClick={() => setSelectedGroup(null)}>Закрыть</Button>
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

