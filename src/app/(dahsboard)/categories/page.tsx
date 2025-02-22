"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  currentStage: "start" | "nameCreated" | "samplesGenerated" | "addedToSystem"
}

export default function CategoriesPage() {
  const categories: Category[] = [
    {
      id: "1",
      name: "spam",
      currentStage: "addedToSystem",
    },
    {
      id: "2",
      name: "Клиент LeadBee",
      currentStage: "samplesGenerated",
    },
    {
      id: "3",
      name: "Спам бот. Продажа спам бота для чатов в телеграмм. Борется со спамом, блокирует спам сообщения",
      currentStage: "nameCreated",
    },
    {
      id: "4",
      name: "Запросы на экспорт и импорт товаров по всему миру",
      currentStage: "start",
    },
    {
      id: "5",
      name: "Запросы на помощь с оплатой за товар по всему миру. Оплата из одной страны за товары в другой стране",
      currentStage: "samplesGenerated",
    },
  ]

  const stages = [
    { key: "start", label: "Начало" },
    { key: "nameCreated", label: "Название создано" },
    { key: "samplesGenerated", label: "Образцы сгенерированы" },
    { key: "addedToSystem", label: "Добавлено в систему" },
  ] as const

  const getStageIndex = (stage: Category["currentStage"]) => {
    return stages.findIndex((s) => s.key === stage)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          Добавить
        </Button>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по названию категории" className="pl-9 w-full" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Название категории</TableHead>
              <TableHead>Стадия</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Link href="#" className="text-blue-600 hover:text-blue-800">
                    {category.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-1">
                      {stages.map((stage, index) => (
                        <div key={stage.key} className="relative">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              index <= getStageIndex(category.currentStage) ? "bg-orange-500" : "bg-gray-200"
                            }`}
                          />
                          {index < stages.length - 1 && (
                            <div
                              className={`absolute top-1/2 left-full w-2 h-0.5 -translate-y-1/2 ${
                                index < getStageIndex(category.currentStage) ? "bg-orange-500" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stages[getStageIndex(category.currentStage)].label}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Редактировать</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Удалить</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

