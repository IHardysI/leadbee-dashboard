'use client';

import { useEffect, useState } from 'react';
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Loader2, User, Bot, Filter } from 'lucide-react';
import Link from 'next/link';
import { ChatDialog } from '@/components/ui/ChatDialog/index';
import { 
  getConversationsList, 
  getConversationById, 
  Conversation, 
  ConversationMessage,
  getDistinctStages,
  DistinctStagesResponse
} from '@/components/shared/api/chats';
import PaginationUniversal from '@/components/widgets/PaginationUniversal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isBot: boolean;
  senderName: string;
}

interface Chat {
  id: string;
  role: 'manager' | 'seller';
  username: string;
  status: 'sent' | 'replied' | 'read';
  userId: string;
  timestamp: string;
  messages: ChatMessage[];
}

// Unified chat message display
const EnhancedChatDialog = ({ messages, botName, userName }: { 
  messages: ChatMessage[], 
  botName: string, 
  userName: string 
}) => {
  return (
    <div className="flex flex-col h-[70vh] relative">
      {/* Chat header with user info - fixed at top */}
      <div className="flex justify-between items-center py-3 px-4 border-b sticky top-0 bg-white z-20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-1 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <span className="font-medium text-blue-800">{userName || 'Клиент'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-teal-800">{botName}</span>
          <div className="bg-teal-100 p-1 rounded-full">
            <Bot className="h-5 w-5 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Message list - scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${message.isBot 
              ? 'bg-gray-100 text-gray-800 border-l-4 border-blue-400 mr-auto' 
              : 'bg-teal-50 text-teal-800 border-r-4 border-teal-400 ml-auto'}`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {new Date(message.timestamp).toLocaleString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadMore'>('pagination');
  const chatsPerPage = 15;

  // Filter state
  const [filterStage, setFilterStage] = useState<string>("");
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [availableStages, setAvailableStages] = useState<string[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  
  // Calculate total pages based on total count
  const totalPages = Math.ceil(totalCount / chatsPerPage);

  // Fetch available stages for filter dropdown
  const fetchStages = async () => {
    try {
      setIsLoadingStages(true);
      const response = await getDistinctStages();
      setAvailableStages(response.stages);
    } catch (err) {
      console.error('Error fetching stages:', err);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Fetch stages on component mount
  useEffect(() => {
    fetchStages();
  }, []);

  const fetchConversations = async (page: number, mode: 'pagination' | 'loadMore' = 'pagination') => {
    try {
      // Set loading states
      setIsLoading(mode === 'pagination');
      setIsLoadingMore(mode === 'loadMore');
      
      // Prepare filter object for backend filtering
      const filterObject: Record<string, any> = {};
      
      // Add stage filter if active
      if (filterStage) {
        if (filterStage === 'null_stage') {
          filterObject.stage = null;
        } else {
          filterObject.stage = filterStage;
        }
      }
      
      console.log(`Fetching conversations from API - page: ${page}, mode: ${mode}, filter:`, filterObject);
      
      const response = await getConversationsList({
        page,
        limit: chatsPerPage,
        filter: filterObject
      });
      
      console.log(`Received ${response.conversations.length} conversations, total: ${response.total_count}`);
      
      if (mode === 'pagination') {
        setConversations(response.conversations);
      } else {
        // In load more mode, append new conversations to existing ones
        setConversations(prev => {
          const newConversations = response.conversations.filter(
            (conversation) => !prev.some(existing => existing.conversation_id === conversation.conversation_id)
          );
          console.log(`Adding ${newConversations.length} new conversations to existing ${prev.length}`);
          return [...prev, ...newConversations];
        });
      }
      
      setTotalCount(response.total_count);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchConversations(currentPage, navigationMode);
  }, [currentPage, navigationMode, filterStage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
  };

  // Handle "Load More" button click
  const handleLoadMore = () => {
    setNavigationMode('loadMore');
    setCurrentPage(prev => prev + 1);
  };

  // We don't need to filter here since the server already filters the results
  // Let's use the conversations directly from the API response
  
  // Convert API messages to chat display format
  const convertToDialogMessages = (messages: ConversationMessage[]): ChatMessage[] => {
    return messages.map((message, index) => {
      const senderName = message.is_bot_message 
        ? message.bot_alias
        : message.username || 'Неизвестно';
        
      return {
        id: index.toString(),
        content: message.text,
        timestamp: message.created_at,
        isBot: !message.is_bot_message, // Inverted: false = bot message (right), true = user message (left)
        senderName
      };
    });
  };

  const handleChatClick = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      setLoadingMessages(true);
      
      const response = await getConversationById(conversation.conversation_id);
      const formattedMessages = convertToDialogMessages(response.messages);
      
      // Sort messages chronologically for enhanced chat (oldest first)
      formattedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setConversationMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching conversation messages:', err);
      // Fallback to last message if we can't get the full conversation
      setConversationMessages([{
      id: '1',
        content: conversation.last_message,
        timestamp: conversation.last_created_at,
          isBot: false,
        senderName: conversation.bot_alias
      }]);
    } finally {
      setLoadingMessages(false);
    }
  };

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

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
      case 'seller':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStageBadgeStyles = (stage: string | null) => {
    if (!stage) return 'bg-gray-100 text-gray-800';
    
    if (stage.includes('отправка')) {
      return 'bg-blue-100 text-blue-800';
    } else if (stage.includes('убеждение')) {
        return 'bg-orange-100 text-orange-800';
    } else {
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormattedStage = (stage: string | null): string => {
    if (!stage) return 'Нет стадии';
    return stage;
  };

  const getRoleFromBotAlias = (botAlias: string): 'manager' | 'seller' => {
    return botAlias.includes('Leadbee') ? 'manager' : 'seller';
  };

  // Reset filter
  const resetFilter = () => {
    console.log("Resetting filter");
    setFilterStage('');
    setIsFilterActive(false);
    setCurrentPage(1);
    setNavigationMode('pagination');
    // Force refetch
    fetchConversations(1, 'pagination');
  };

  // Apply stage filter
  const applyStageFilter = (stage: string) => {
    console.log(`Applying stage filter: ${stage}`);
    setConversations([]);
    
    // Check if applying the same filter again
    if (filterStage === stage) {
      // Force a refetch with the same filter
      setCurrentPage(1);
      setNavigationMode('pagination');
      fetchConversations(1, 'pagination');
    } else {
      // Normal filter change
      setFilterStage(stage);
      setIsFilterActive(!!stage);
      setCurrentPage(1);
      setNavigationMode('pagination');
    }
  };

  if (isLoading && navigationMode === 'pagination') return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
    </div>
  );
  
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Переписка</TableHead>
            <TableHead>Роль</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Бот</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`cursor-pointer font-medium flex items-center gap-1 ${isFilterActive ? 'text-blue-600' : ''}`}>
                      Стадия
                      <Filter className={`h-4 w-4 ${isFilterActive ? 'text-blue-600 fill-blue-100' : ''}`} />
                      {isFilterActive && <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Фильтр</span>}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={resetFilter}>
                      Все
                    </DropdownMenuItem>
                    
                    {isLoadingStages ? (
                      <DropdownMenuItem disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Загрузка...
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {availableStages.map((stage) => (
                          <DropdownMenuItem 
                            key={stage} 
                            onClick={() => applyStageFilter(stage)}
                            className={filterStage === stage ? 'bg-blue-50' : ''}
                          >
                            {stage}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem 
                          onClick={() => applyStageFilter('null_stage')}
                          className={filterStage === 'null_stage' ? 'bg-blue-50' : ''}
                        >
                          Без стадии
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>ID беседы</TableHead>
            <TableHead>Время</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {conversations.map((conversation) => {
              const role = getRoleFromBotAlias(conversation.bot_alias);
              
              return (
            <TableRow
                  key={conversation.conversation_id}
              className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-[80px]"
                          onClick={() => handleChatClick(conversation)}
                        >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Чат
                    </Button>
                  </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] w-full p-4">
                        {loadingMessages ? (
                          <div className="flex h-96 items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                          </div>
                        ) : (
                          <>
                            <DialogHeader>
                              <DialogTitle>
                                Переписка с {selectedConversation?.username || 'Клиентом'}
                              </DialogTitle>
                            </DialogHeader>
                            <EnhancedChatDialog 
                              messages={conversationMessages}
                              botName={selectedConversation?.bot_alias || 'Бот'}
                              userName={selectedConversation?.username || 'Клиент'}
                            />
                          </>
                        )}
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                      className={getRoleBadgeStyles(role)}>
                      {role === 'manager' ? 'Менеджер' : 'Продавец'}
                </Badge>
              </TableCell>
              <TableCell>
                    {conversation.username ? (
                <Link href="#" className="text-blue-600 hover:text-blue-800">
                        {conversation.username}
                </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {conversation.bot_alias}
                    </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                      className={getStageBadgeStyles(conversation.stage)}>
                      {getFormattedStage(conversation.stage)}
                </Badge>
              </TableCell>
                  <TableCell className="font-mono">{conversation.conversation_id}</TableCell>
              <TableCell className="text-muted-foreground">
                    {formatDate(conversation.last_created_at)}
              </TableCell>
            </TableRow>
              );
            })}
        </TableBody>
      </Table>
      </div>
      
      {isLoadingMore && (
        <div className="flex justify-center my-4">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      {totalCount > 0 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          showLoadMore={
            !isLoadingMore && (
              !filterStage 
              ? currentPage < totalPages 
              : conversations.length < totalCount
            )
          }
        />
      )}
    </div>
  );
}
