"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Search, MessageSquare, Pencil, HelpCircle } from "lucide-react"
import Link from "next/link"
import { ChatDialog } from "@/components/ui/ChatDialog/index"

interface Client {
  id: string
  username: string
  status: "in_progress" | "signed"
  manager?: string
  categories: string[]
  location?: string
  sentLeads: number
  messages: {
    id: string
    content: string
    timestamp: string
    isBot: boolean
  }[]
}

export default function ClientsPage() {
  const clients: Client[] = [
    {
      id: "1",
      username: "aaandrey23",
      status: "in_progress",
      categories: [],
      sentLeads: 0,
      messages: [],
    },
    {
      id: "2",
      username: "leadbee_roman",
      status: "signed",
      categories: [],
      sentLeads: 0,
      messages: [],
    },
    {
      id: "3",
      username: "stacyrubik",
      status: "in_progress",
      location: "Russia",
      categories: [],
      sentLeads: 0,
      messages: [
        {
          id: "1",
          content: "Здравствуйте! Как мы можем вам помочь?",
          timestamp: "2024-01-20T12:00:00.000Z",
          isBot: true,
        },
      ],
    },
    {
      id: "4",
      username: "BravaLine",
      status: "signed",
      categories: [],
      sentLeads: 0,
      messages: [],
    },
    {
      id: "5",
      username: "designsyndicate",
      status: "in_progress",
      categories: [],
      sentLeads: 0,
      messages: [],
    },
  ]

  const getStatusBadge = (status: Client["status"]) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            В обработке
          </Badge>
        )
      case "signed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Подписан
          </Badge>
        )
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по имени пользователя" className="pl-9" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Статус</TableHead>
              <TableHead>Имя пользователя</TableHead>
              <TableHead>За менеджером</TableHead>
              <TableHead>Категории</TableHead>
              <TableHead>Локации</TableHead>
              <TableHead>Переписка</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell>
                  <Link href="#" className="text-blue-600 hover:text-blue-800">
                    {client.username}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <HelpCircle className="h-3 w-3 mr-1" />?
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.categories.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {client.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {client.location ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {client.location}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="w-[80px]">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Чат
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] w-full p-0">
                      <ChatDialog
                        username={client.username}
                        userId={client.id}
                        role="client"
                        messages={client.messages}
                      />
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8">
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

