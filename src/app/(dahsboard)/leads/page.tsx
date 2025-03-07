'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Ban, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLeadsList } from '@/components/shared/api/analytics';
import PaginationUniversal from '@/components/widgets/PaginationUniversal';

interface Lead {
  id: string;
  category: string;
  chat_title: string;
  price: number;
  updatedAt: string;
  message: string;
  tags?: string[];
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const leadsPerPage = 15;
  const [displayMode, setDisplayMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [loadedCount, setLoadedCount] = useState(leadsPerPage);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const result = await getLeadsList();
        setLeads(result.leads);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  const totalPages = Math.ceil(leads.length / leadsPerPage);
  const displayedLeads = displayMode === 'loadmore' 
    ? leads.slice(0, loadedCount)
    : leads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);

  const handlePageChange = (page: number) => {
    setDisplayMode('pagination');
    setCurrentPage(page);
    setLoadedCount(leadsPerPage);
  };

  const handleLoadMore = () => {
    setDisplayMode('loadmore');
    setLoadedCount(loadedCount + leadsPerPage);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border overflow-hidden">
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Категория</TableHead>
                <TableHead className="w-[180px]">Когда отправлен</TableHead>
                <TableHead className="min-w-[300px]">Превью твита</TableHead>
                <TableHead className="w-[150px]">Отправлен кому</TableHead>
                <TableHead className="w-[120px]">Действия</TableHead>
                <TableHead className="w-[200px]">Теги</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLeads.map((lead: Lead) => (
                <TableRow key={lead.id}>
                  <TableCell><Badge variant="secondary" className="inline-flex items-center whitespace-normal">{lead.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('ru-RU') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">{lead.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600">
                        <Check className="h-4 w-4 mr-1" />
                        Одобрить
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Ban className="h-4 w-4 mr-1" />В спам
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.tags && lead.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {lead.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-gray-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          showLoadMore={displayedLeads.length < leads.length}
        />
      )}
    </div>
  );
}
