"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, UserPlus, Search, Pencil, CheckCircle, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getGroupsList } from "@/components/shared/api/groups"

interface Group {
  id: string
  name: string
  analysisStatus: "done" | "pending" | "not started"
  subscribers: number
  index: number
  requestsCount: {
    spam: number,
    other: number,
    freelancers: number
  }
  totalLeadsPerDay: number
  location?: string
  parsing: "done" | "in progress" | "not started"
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await getGroupsList();
        if(response.status === "success") {
          const transformed = response.groups.map((group: any) => ({
            id: group.id,
            name: group.title,
            analysisStatus: group.analysis_status ? group.analysis_status : "not started",
            subscribers: group.joined_accounts ? group.joined_accounts.length : 0,
            index: group.analysis_result?.analysis_time_seconds || 0,
            requestsCount: {
              spam: group.analysis_result?.requests_count?.spam || 0,
              other: group.analysis_result?.requests_count?.other || 0,
              freelancers: group.analysis_result?.requests_count?.["Фрилансеры"] || 0
            },
            totalLeadsPerDay: group.analysis_result?.total_messages_count || 0,
            location: group.join_link,
            parsing: group.parsing === true ? "done" : (group.parsing === "in progress" ? "in progress" : "not started")
          }));
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

  if (loading) {
    return <div>Загрузка групп...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button className="bg-orange-500 hover:bg-orange-600 flex-grow sm:flex-grow-0">
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
              <TableHead className="w-[250px]">Название</TableHead>
              <TableHead className="">Статус анализа</TableHead>
              <TableHead className="">Сбор данных</TableHead>
              <TableHead className="">Подписчики</TableHead>
              <TableHead className="">Спам</TableHead>
              <TableHead className="">Другое</TableHead>
              <TableHead className="">Фрилансеры</TableHead>
              <TableHead className="">Всего лидов</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <Link href={group.location || "#"} className="text-blue-600 hover:text-blue-800">
                    {group.name}
                  </Link>
                </TableCell>
                <TableCell className="">
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
                <TableCell className="">
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
                <TableCell className="">{group.subscribers.toLocaleString()}</TableCell>
                <TableCell className="">{group.requestsCount.spam}</TableCell>
                <TableCell className="">{group.requestsCount.other}</TableCell>
                <TableCell className="">{group.requestsCount.freelancers}</TableCell>
                <TableCell className="">{group.totalLeadsPerDay}</TableCell>
                <TableCell className="">
                  <Button variant="ghost" size="sm" className="h-8 w-8 mx-auto">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Редактировать</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

