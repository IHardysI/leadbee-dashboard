"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Pencil, Loader2, BarChart } from "lucide-react"
import { getCategoriesList, upsertCategory } from "@/components/shared/api/categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import PaginationUniversal from "@/components/widgets/PaginationUniversal"
import { useRouter } from "next/navigation"

export default function CategoriesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrompt, setNewCategoryPrompt] = useState('');
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [editCategoryPrompt, setEditCategoryPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const categoriesPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [loadedCount, setLoadedCount] = useState(categoriesPerPage);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategoriesList();
        console.log("DEBUG - Categories list response:", data);
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If loading, return centered spinner
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const displayedCategories = navigationMode === 'loadmore'
    ? filteredCategories.slice(0, loadedCount)
    : filteredCategories.slice((currentPage - 1) * categoriesPerPage, currentPage * categoriesPerPage);

  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
    setLoadedCount(categoriesPerPage);
  };

  // Function to create URL-friendly slug from category name
  const createCategorySlug = (name: string) => {
    // If name is empty or undefined, return a default
    if (!name) return 'category';
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  };

  // Function to prepare category name for stats page
  const navigateToStats = (category: any) => {
    // Preserve original casing in query parameter for the API
    const originalName = category.name;
    // Use lowercase version for the URL path
    const categorySlug = createCategorySlug(originalName);
    // Encode the original name with case preserved for the query parameter
    const encodedOriginalName = encodeURIComponent(originalName);
    
    router.push(`/categories/${categorySlug}/statistics?name=${encodedOriginalName}`);
  };

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

      <div className="rounded-md border overflow-x-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] whitespace-normal break-words">Название категории</TableHead>
              <TableHead className="w-[25%] whitespace-normal break-words">Количество сообщений в категории</TableHead>
              <TableHead className="w-[30%] whitespace-normal break-words">Статус (Отслеживается / Не отслеживается)</TableHead>
              <TableHead className="w-[15%] whitespace-normal break-words">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCategories.map((category) => (
              <TableRow key={category.name} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedCategory(category)}>
                <TableCell className="whitespace-normal break-words">{category.name}</TableCell>
                <TableCell className="whitespace-normal break-words">-</TableCell>
                <TableCell className="whitespace-normal break-words">-</TableCell>
                <TableCell className="whitespace-normal break-words" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => { setEditCategory(category); setEditCategoryPrompt(category.prompt || ''); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigateToStats(category)}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLoadMore={() => {
            setNavigationMode('loadmore');
            setLoadedCount(loadedCount + categoriesPerPage);
          }}
          showLoadMore={displayedCategories.length < filteredCategories.length}
        />
      )}

      {/* Dialog for category details */}
      {selectedCategory && (
        <Dialog open={true} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCategory.name}</DialogTitle>
              <DialogDescription>Подробная информация о категории</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border overflow-hidden mt-2">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] whitespace-normal break-words">Параметр</TableHead>
                    <TableHead className="w-[60%] whitespace-normal break-words">Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal break-words">Название категории</TableCell>
                    <TableCell className="whitespace-normal break-words">{selectedCategory.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal break-words">Количество сообщений в категории</TableCell>
                    <TableCell className="whitespace-normal break-words">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal break-words">Статус</TableCell>
                    <TableCell className="whitespace-normal break-words">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal break-words">Промпт</TableCell>
                    <TableCell className="whitespace-normal break-words">{selectedCategory.prompt}</TableCell>
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

