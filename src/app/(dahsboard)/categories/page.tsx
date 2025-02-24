"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { getCategoriesList } from "@/components/shared/api/categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategoriesList();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Название категории</TableHead>
                <TableHead>Количество сообщений в категории</TableHead>
                <TableHead>Статус (Отслеживается / Не отслеживается)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedCategory(category)}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal for detailed category info */}
      {selectedCategory && (
        <Dialog open={true} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCategory.name}</DialogTitle>
              <DialogDescription>Подробная информация о категории</DialogDescription>
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
                    <TableCell className="font-bold">Название категории</TableCell>
                    <TableCell>{selectedCategory.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Количество сообщений в категории</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Статус</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Промпт</TableCell>
                    <TableCell>{selectedCategory.prompt}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedCategory(null)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

