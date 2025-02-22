'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ChatDialog } from '@/components/ui/ChatDialog/index';

interface Chat {
  id: string;
  role: 'manager' | 'seller';
  username: string;
  status: 'sent' | 'replied' | 'read';
  userId: string;
  timestamp: string;
  messages: {
    id: string;
    content: string;
    timestamp: string;
    isBot: boolean;
  }[];
}

export default function ChatsPage() {
  const chats: Chat[] = [
    {
      id: '1',
      role: 'manager',
      username: 'leadbee_roman',
      status: 'sent',
      userId: '7700129272',
      timestamp: '2024-12-20T12:09:31.568000',
      messages: [
        {
          id: '1',
          content:
            'Здравствуйте! Я представляю компанию LeadBee. Заинтересованы в сотрудничестве?',
          timestamp: '2024-12-20T12:09:31.568000',
          isBot: true,
        },
        {
          id: '2',
          content: 'Добрый день! Да, расскажите подробнее',
          timestamp: '2024-12-20T12:10:15.000000',
          isBot: false,
        },
        {
          id: '3',
          content:
            'Мы предлагаем инновационные решения для автоматизации продаж. Могу я рассказать о наших услугах?',
          timestamp: '2024-12-20T12:11:00.000000',
          isBot: true,
        },
      ],
    },
    {
      id: '2',
      role: 'manager',
      username: 'stacyrubik',
      status: 'replied',
      userId: '209476372',
      timestamp: '2024-11-22T09:56:13.361000',
      messages: [
        {
          id: '1',
          content:
            'Приветствую! Хотели бы обсудить возможности нашей платформы?',
          timestamp: '2024-11-22T09:56:13.361000',
          isBot: true,
        },
      ],
    },
    {
      id: '3',
      role: 'seller',
      username: 'stasy_unite',
      status: 'replied',
      userId: '185258316',
      timestamp: '2024-11-14T14:20:33.665000',
      messages: [],
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeStyles = (role: Chat['role']) => {
    switch (role) {
      case 'manager':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
      case 'seller':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusBadgeStyles = (status: Chat['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-orange-100 text-orange-800';
      case 'replied':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Chat['status']) => {
    switch (status) {
      case 'sent':
        return 'Отправлено сообщение';
      case 'replied':
        return 'Ответил';
      case 'read':
        return 'Прочитал';
      default:
        return status;
    }
  };

  const getRoleText = (role: Chat['role']) => {
    switch (role) {
      case 'manager':
        return 'Менеджер';
      case 'seller':
        return 'Продавец';
      default:
        return role;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Переписка</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Имя пользователя</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>ID пользователя</TableHead>
            <TableHead>Время</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chats.map((chat) => (
            <TableRow
              key={chat.id}
              className="cursor-pointer hover:bg-muted/50">
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
                      username={chat.username}
                      userId={chat.userId}
                      role={chat.role}
                      messages={chat.messages}
                    />
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getRoleBadgeStyles(chat.role)}>
                  {getRoleText(chat.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href="#" className="text-blue-600 hover:text-blue-800">
                  {chat.username}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusBadgeStyles(chat.status)}>
                  {getStatusText(chat.status)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{chat.userId}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(chat.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
