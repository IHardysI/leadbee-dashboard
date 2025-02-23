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

interface Lead {
  id: string;
  category: string;
  sentAt: string;
  preview: string;
  sentTo: string;
  sentToName: string;
  status: 'pending' | 'sent' | 'spam';
  tags: string[];
}

export default function LeadsPage() {
  const leads: Lead[] = [
    {
      id: '1',
      category: 'LeadBee',
      sentAt: '04.12.2024 07:59',
      preview:
        'Ищу дизайнера для создания инфографики для маркетплейсов (Озон и ВБ). Писать в ЛС',
      sentTo: 'Фриланс.Ru',
      sentToName: 'Александр Иванов',
      status: 'sent',
      tags: ['action7', 'balanceyourmind'],
    },
    {
      id: '2',
      category: 'LeadBee',
      sentAt: '04.12.2024 08:00',
      preview:
        'Здравствуйте! Окажу услуги по Сео оптимизации карточки, анализу, настройке рекламы, стратегии вывода в топ, консультации, ведение лк. Опыт 3 года.',
      sentTo: 'Поставщики Wildberries',
      sentToName: 'Мария Петрова',
      status: 'pending',
      tags: ['seo', 'marketing'],
    },
    {
      id: '3',
      category: 'LeadBee',
      sentAt: '04.12.2024 08:15',
      preview:
        'Приветики 😊 😊 😊 😊 Мне срочно нужна помощь с ремонтом! Всё легко и просто но справится одна не могу! Заплачу 15.000 тысяч (могу больше) 💰 Отпишите мне, расскажу подробности!',
      sentTo: 'Работа в Сочи',
      sentToName: 'Ольга Сидорова',
      status: 'pending',
      tags: ['repair', 'urgent'],
    },
    {
      id: '4',
      category: 'LeadBee',
      sentAt: '04.12.2024 08:30',
      preview:
        'Требуется менеджер для ведения аккаунтов в соцсетях. Опыт работы от 1 года.',
      sentTo: 'HH.ru',
      sentToName: 'Дмитрий Козлов',
      status: 'sent',
      tags: ['social', 'manager'],
    },
    {
      id: '5',
      category: 'LeadBee',
      sentAt: '04.12.2024 09:00',
      preview:
        'Ищем копирайтера для написания описаний товаров на маркетплейсах. Оплата за текст.',
      sentTo: 'Авито Работа',
      sentToName: 'Наталья Кузнецова',
      status: 'pending',
      tags: ['copywriting', 'marketplace'],
    },
  ];

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
                  <TableCell>{lead.category}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lead.sentAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">{lead.preview}</p>
                      <Link
                        href="#"
                        className="text-sm text-blue-500 hover:text-blue-700">
                        Вступить в чат
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href="#"
                      className="text-blue-500 hover:text-blue-700">
                      {lead.sentToName}
                    </Link>
                  </TableCell>
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
