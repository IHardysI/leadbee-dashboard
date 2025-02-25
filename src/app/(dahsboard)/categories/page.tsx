"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Pencil } from "lucide-react"
import { getCategoriesList, upsertCategory } from "@/components/shared/api/categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrompt, setNewCategoryPrompt] = useState('');
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [editCategoryPrompt, setEditCategoryPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="bg-cYellow/90 hover:bg-cYellow w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Добавить
        </Button>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию категории"
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <TableHead className="w-16">Редактировать</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedCategory(category)}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" onClick={() => { setEditCategory(category); setEditCategoryPrompt(category.prompt || ''); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog for category details */}
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

      {/* Dialog for adding a new category */}
      {createDialogOpen && (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить новую категорию</DialogTitle>
              <DialogDescription>Введите название категории и промпт.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <Input
                placeholder="Название категории"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <textarea
                placeholder="Промпт"
                value={newCategoryPrompt}
                onChange={(e) => setNewCategoryPrompt(e.target.value)}
                className="w-full border rounded p-2"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  try {
                    await upsertCategory(newCategoryName, newCategoryPrompt);
                    const data = await getCategoriesList();
                    setCategories(data.categories);
                    toast({ title: "Успех", description: "Категория успешно добавлена", variant: "default" });
                    setCreateDialogOpen(false);
                    setNewCategoryName('');
                    setNewCategoryPrompt('');
                  } catch (error) {
                    console.error('Error upserting category', error);
                  }
                }}
              >
                Добавить
              </Button>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Отмена
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for editing a category */}
      {editCategory && (
        <Dialog open={true} onOpenChange={() => setEditCategory(null)}>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>Редактировать категорию</DialogTitle>
              <DialogDescription>Измените промпт категории.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <Input
                placeholder="Название категории"
                value={editCategory.name}
                disabled
              />
              <textarea
                placeholder="Промпт"
                value={editCategoryPrompt}
                onChange={(e) => setEditCategoryPrompt(e.target.value)}
                className="w-full border rounded p-2"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  try {
                    await upsertCategory(editCategory.name, editCategoryPrompt);
                    const data = await getCategoriesList();
                    setCategories(data.categories);
                    toast({ title: "Успех", description: "Категория успешно изменена", variant: "default" });
                    setEditCategory(null);
                  } catch (error) {
                    console.error('Error editing category', error);
                  }
                }}
              >
                Подтвердить
              </Button>
              <Button variant="outline" onClick={() => setEditCategory(null)}>
                Отмена
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

