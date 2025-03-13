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
  ConversationMessage 
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
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
  
  // Calculate total pages based on total count
  const totalPages = Math.ceil(totalCount / chatsPerPage);

  // Track filtered conversations for accurate pagination
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);
  const [allConversationsLoaded, setAllConversationsLoaded] = useState<boolean>(false);

  const fetchAllConversations = async () => {
    if (isLoadingAll || allConversationsLoaded) return;
    
    setIsLoadingAll(true);
    try {
      console.log('Fetching all conversations for filtering');
      
      // Fetch in batches to prevent timeout
      const batchSize = 50;
      let currentPage = 1;
      let allResults: Conversation[] = [];
      let hasMore = true;
      let fetchAttempts = 0;
      const maxAttempts = 10; // Safety limit to prevent infinite loops
      
      while (hasMore && fetchAttempts < maxAttempts) {
        fetchAttempts++;
        const response = await getConversationsList({
          page: currentPage,
          limit: batchSize,
          filter: {}
        });
        
        if (response.conversations.length > 0) {
          allResults = [...allResults, ...response.conversations];
          console.log(`Loaded ${allResults.length} conversations out of ${response.total_count}`);
          
          // Stop if we've loaded all or reached a reasonable limit
          if (allResults.length >= response.total_count || allResults.length >= 500 || response.conversations.length < batchSize) {
            hasMore = false;
            setAllConversationsLoaded(true);
          } else {
            currentPage++;
          }
        } else {
          hasMore = false;
          setAllConversationsLoaded(true);
        }
      }
      
      if (fetchAttempts >= maxAttempts) {
        console.warn('Reached maximum fetch attempts - stopping to prevent infinite loop');
        setAllConversationsLoaded(true);
      }
      
      setAllConversations(allResults);
      // Apply filter immediately after loading
      setIsFilterApplied(true);
    } catch (err) {
      console.error('Error fetching all conversations:', err);
      // Even on error, mark as loaded to prevent endless retries
      setAllConversationsLoaded(true);
      setIsFilterApplied(true);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const fetchConversations = async (page: number, mode: 'pagination' | 'loadMore' = 'pagination') => {
    try {
      // Only set loading states if we're not already loading all conversations 
      if (!isLoadingAll) {
        setIsLoading(mode === 'pagination');
        setIsLoadingMore(mode === 'loadMore');
      }
      
      // If filtering is active, make sure we have all conversations loaded
      if (filterStage && !allConversationsLoaded && !isLoadingAll) {
        // If we're applying a filter for the first time, we need to load all conversations first
        if (!isFilterApplied || isInitialLoad) {
          console.log('Loading all conversations for filtering...');
          await fetchAllConversations();
          setIsInitialLoad(false);
          return; // Return early and let the effect trigger a re-fetch
        }
      }
      
      // Handle normal pagination (no filter)
      if (!filterStage) {
        console.log(`Fetching conversations from API - page: ${page}, mode: ${mode}`);
        
        const response = await getConversationsList({
          page,
          limit: chatsPerPage,
          filter: {}
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
      }
      // Handle filtering - if we've loaded all conversations for filtering
      else if (allConversations.length > 0) {
        console.log('Applying filter to loaded conversations');
        // Apply filtering to all conversations
        let filteredConversations = [...allConversations];
        
        if (filterStage === 'null_stage') {
          // Filter for null stages
          filteredConversations = filteredConversations.filter(conv => conv.stage === null);
        } else if (filterStage === 'завершен') {
          // Filter for "завершен" stage
          filteredConversations = filteredConversations.filter(conv => conv.stage === 'завершен');
        } else if (filterStage === 'убеждение_на_подписку') {
          // Filter for "убеждение_на_подписку" stage
          filteredConversations = filteredConversations.filter(conv => conv.stage === 'убеждение_на_подписку');
        } else {
          // Standard stage filtering
          filteredConversations = filteredConversations.filter(conv => conv.stage === filterStage);
        }
        
        // Sort conversations by date (newest first)
        filteredConversations.sort((a, b) => 
          new Date(b.last_created_at).getTime() - new Date(a.last_created_at).getTime()
        );
        
        // Calculate total filtered count
        const totalFilteredCount = filteredConversations.length;
        console.log(`Total filtered conversations: ${totalFilteredCount}`);
        
        // Apply pagination to filtered results
        const startIndex = (page - 1) * chatsPerPage;
        const endIndex = mode === 'pagination' 
          ? startIndex + chatsPerPage 
          : conversations.length + chatsPerPage;
        
        const paginatedResults = filteredConversations.slice(
          mode === 'pagination' ? startIndex : 0, 
          endIndex
        );
        
        console.log(`Showing ${paginatedResults.length} filtered conversations for page ${page}`);
        
        if (mode === 'pagination') {
          setConversations(paginatedResults);
        } else {
          // In load more mode, append new filtered conversations
          setConversations(prev => [...prev, ...paginatedResults.slice(prev.length)]);
        }
        
        // Use the filtered total for pagination
        setTotalCount(totalFilteredCount);
      }
      // When filter is active but data is still loading
      else {
        console.log('Filtering is active but all conversations are not yet loaded');
        // Show temporary loading state until data is loaded
        if (mode === 'pagination') {
          setConversations([]);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      // Always clear loading states unless we're still loading all conversations
      if (!isLoadingAll) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    // Don't fetch while loading all conversations
    if (!isLoadingAll) {
      fetchConversations(currentPage, navigationMode);
    }
  }, [currentPage, navigationMode, filterStage, isLoadingAll, allConversationsLoaded]);

  // Handle filter changes 
  useEffect(() => {
    if (filterStage) {
      // When a filter is applied, load all conversations if needed
      if (!allConversationsLoaded && !isLoadingAll) {
        console.log('Filter applied, preparing to load all conversations');
        setIsInitialLoad(true);
        setIsFilterApplied(false);
      }
    } else {
      // Reset filter state when filter is cleared
      setIsFilterApplied(false);
    }
  }, [filterStage, allConversationsLoaded, isLoadingAll]);

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
    setConversations([]);
    setFilterStage('');
    setIsFilterActive(false);
    setIsFilterApplied(false);
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
      setIsFilterApplied(true); // Mark filter as already applied
      fetchConversations(1, 'pagination');
    } else {
      // Normal filter change
      setFilterStage(stage);
      setIsFilterActive(!!stage);
      setIsFilterApplied(false); // New filter needs to be applied
      setCurrentPage(1);
      setNavigationMode('pagination');
    }
  };

  if (isLoading && navigationMode === 'pagination') return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
    </div>
  );
  
  // Show loading indicator when fetching all data for filtering
  if (isLoadingAll) return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">Загрузка данных для фильтрации...</div>
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
                    {filterStage !== 'убеждение_на_бесплатные_лиды' && (
                      <DropdownMenuItem onClick={() => applyStageFilter('убеждение_на_бесплатные_лиды')}>
                        Убеждение на бесплатные лиды
                      </DropdownMenuItem>
                    )}
                    {filterStage !== 'отправка_бесплатных_лидов' && (
                      <DropdownMenuItem onClick={() => applyStageFilter('отправка_бесплатных_лидов')}>
                        Отправка бесплатных лидов
                      </DropdownMenuItem>
                    )}
                    {filterStage !== 'убеждение_на_подписку' && (
                      <DropdownMenuItem onClick={() => applyStageFilter('убеждение_на_подписку')}>
                        Убеждение на подписку
                      </DropdownMenuItem>
                    )}
                    {filterStage !== 'завершен' && (
                      <DropdownMenuItem onClick={() => applyStageFilter('завершен')}>
                        Завершен
                      </DropdownMenuItem>
                    )}
                    {filterStage !== 'null_stage' && (
                      <DropdownMenuItem onClick={() => applyStageFilter('null_stage')}>
                        Без стадии
                      </DropdownMenuItem>
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
              : allConversationsLoaded && conversations.length < totalCount
            )
          }
        />
      )}
    </div>
  );
}
