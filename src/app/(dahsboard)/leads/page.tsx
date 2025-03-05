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
import { Check, Ban } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLeadsList } from '@/components/shared/api/analytics';

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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const result = await getLeadsList();
        setLeads(result.leads);
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    };
    fetchLeads();
  }, []);

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
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell><Badge variant="secondary" className="inline-flex items-center whitespace-normal">{lead.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(lead.updatedAt).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">{lead.message}</p>
                      <Link
                        href="#"
                        className="text-sm text-blue-500 hover:text-blue-700">
                        Вступить в чат
                      </Link>
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
                        {lead.tags.map((tag) => (
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
    </div>
  );
}
