"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, UserPlus, Search, Pencil, CheckCircle, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getGroupsList, createGroup } from "@/components/shared/api/groups"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: string
  name: string
  analysisStatus: "done" | "pending" | "not started"
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
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState<boolean>(false);
  const [newGroupLink, setNewGroupLink] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

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
              analysisStatus: group.analysis_status ? group.analysis_status : "not started",
              subscribers: "-",
              requestsCount,
              actualLeads,
              potentialLeads,
              joinedAccounts: group.joined_accounts || [],
              analysisResult: group.analysis_result ? group.analysis_result : { requests_count: {}, potential_requests: {}, total_leads_count: 0, total_potential_requests: 0 },
              location: group.join_link,
              parsing: group.parsing === true ? "done" : (group.parsing === "in progress" ? "in progress" : "not started")
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
    return <div>Загрузка групп...</div>
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
            Присоединение
          </Button>
        </div>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по названию" className="pl-9 pr-9 w-full" />
          <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Группа</TableHead>
              <TableHead>Статус анализа</TableHead>
              <TableHead>Сбор данных</TableHead>
              <TableHead>Количество подписчиков</TableHead>
              <TableHead>Какие аккаунты вступили</TableHead>
              <TableHead>Всего лидов / Потенциальных лидов</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} onClick={() => setSelectedGroup(group)} className="cursor-pointer hover:bg-gray-50">
                <TableCell>
                  <Link href={group.location || "#"} className="text-blue-600 hover:text-blue-800">
                    {group.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {group.analysisStatus === "done" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      завершено
                    </Badge>
                  ) : group.analysisStatus === "pending" ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 inline-flex items-center">
                      в ожидании
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center">
                      не начато
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {group.parsing === "done" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      завершено
                    </Badge>
                  ) : group.parsing === "in progress" ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 inline-flex items-center">
                      в процессе
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center">
                      не начато
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{group.subscribers}</TableCell>
                <TableCell>
                  {group.joinedAccounts.map((account) => (
                    <Badge key={account} className="mr-1">{account}</Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {`${group.actualLeads} / ${group.potentialLeads.toFixed(2)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedGroup && (
        <Dialog open={true} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="!w-[95vw] !max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
              <DialogDescription>Подробная информация о группе</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Параметр</TableHead>
                    <TableHead>Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold">Статус анализа</TableCell>
                    <TableCell>
                      {selectedGroup.analysisStatus === "done" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          завершено
                        </Badge>
                      ) : selectedGroup.analysisStatus === "pending" ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 inline-flex items-center">
                          в ожидании
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center">
                          не начато
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Сбор данных</TableCell>
                    <TableCell>
                      {selectedGroup.parsing === "done" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          завершено
                        </Badge>
                      ) : selectedGroup.parsing === "in progress" ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 inline-flex items-center">
                          в процессе
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 inline-flex items-center">
                          не начато
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Количество подписчиков</TableCell>
                    <TableCell>{selectedGroup.subscribers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Какие аккаунты вступили</TableCell>
                    <TableCell>
                      {selectedGroup.joinedAccounts.length ? (
                        selectedGroup.joinedAccounts.map((account) => (
                          <Badge key={account} className="mr-1">{account}</Badge>
                        ))
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Всего лидов / Потенциальных лидов</TableCell>
                    <TableCell>
                      {selectedGroup.analysisResult?.total_leads_count ?? '-'} / {selectedGroup.analysisResult?.total_potential_requests !== undefined ? Number(selectedGroup.analysisResult.total_potential_requests).toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                  {Object.keys(selectedGroup.analysisResult?.requests_count || {}).map((key) => {
                    const displayKey = key === "spam" ? "Спам" : key === "other" ? "Другое" : key === "freelancers" ? "Фрилансеры" : key;
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-bold">{displayKey}</TableCell>
                        <TableCell>
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
    </div>
  )
}

