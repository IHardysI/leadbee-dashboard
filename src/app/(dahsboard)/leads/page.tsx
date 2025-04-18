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
import { Check, Ban, Loader2, XCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getLeadsList, updateModerationStatus } from '@/components/shared/api/analytics';
import PaginationUniversal from '@/components/widgets/PaginationUniversal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface Lead {
  id: string;
  category: string;
  chat_title: string;
  price: number;
  updatedAt: string;
  message: string;
  tags?: string[];
  moderation_status: "not_approved" | "spam" | "approved" | "not_reviewed";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const leadsPerPage = 15;
  const [displayMode, setDisplayMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Calculate total pages based on the total count
  const computedTotalPages = Math.ceil(totalCount / leadsPerPage) || 1;

  useEffect(() => {
    async function fetchLeads() {
      if (displayMode === 'loadmore' && leads.length > 0) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // Use API's status filtering directly - pass filterStatus to the API
        const result = await getLeadsList(currentPage, leadsPerPage, filterStatus);
        
        if(result.leads) {
          if (displayMode === 'pagination') {
            setLeads(result.leads);
          } else {
            setLeads(prevLeads => {
              const existingIds = new Set(prevLeads.map(lead => lead.id));
              const uniqueNewLeads = result.leads.filter(
                (lead: Lead) => !existingIds.has(lead.id)
              );
              
              console.log(`Fetched ${result.leads.length} leads, adding ${uniqueNewLeads.length} new ones`);
              
              return [...prevLeads, ...uniqueNewLeads];
            });
          }
          
          if(result.total_count !== undefined) {
            setTotalCount(result.total_count);
          }
          
          const actualTotalPages = result.total_count 
            ? Math.ceil(result.total_count / leadsPerPage) 
            : 1;
          
          setHasMore(currentPage < actualTotalPages && result.leads.length > 0);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    
    fetchLeads();
  }, [currentPage, leadsPerPage, displayMode, filterStatus, reloadTrigger]);

  if (loading && (!loadingMore || leads.length === 0)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  const displayedLeads = leads;

  const handlePageChange = (page: number) => {
    setLeads([]);
    setDisplayMode('pagination');
    setCurrentPage(page);
  };

  const handleLoadMore = () => {
    setDisplayMode('loadmore');
    setCurrentPage(prev => prev + 1);
  };

  const resetFilter = () => {
    console.log("Resetting filter");
    setLeads([]);
    
    // If already on "All" filter (empty filterStatus), force a reload
    if (filterStatus === '' && currentPage === 1) {
      setReloadTrigger(prev => prev + 1);
    } else {
      setFilterStatus('');
      setCurrentPage(1);
      setDisplayMode('pagination');
    }
  };

  const applyFilter = (status: string) => {
    console.log(`Applying status filter: ${status}`);
    setLeads([]);
    setFilterStatus(status);
    setCurrentPage(1);
    setDisplayMode('pagination');
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case "approved": return "Одобрено";
      case "spam": return "В спам";
      case "not_approved": return "Отклонено";
      case "not_reviewed": return "Не проверено";
      default: return status;
    }
  };

  const getBadgeClass = (status: string) => {
    switch(status) {
      case "approved": return "bg-green-500 text-white hover:text-black";
      case "spam": return "bg-gray-500 text-white hover:text-black";
      case "not_approved": return "bg-red-500 text-white hover:text-black";
      case "not_reviewed": return "bg-secondary text-black hover:text-black";
      default: return "";
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: "approved" | "spam" | "not_approved") => {
    try {
      await updateModerationStatus(leadId, newStatus);
      setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, moderation_status: newStatus } : lead));
    } catch (err) {
      console.error("Ошибка при обновлении статуса", err);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="rounded-md border overflow-hidden">
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] whitespace-normal">Категория</TableHead>
                <TableHead className="w-[140px] whitespace-normal">Когда отправлен</TableHead>
                <TableHead className="w-[300px] max-w-[300px] whitespace-normal">Превью</TableHead>
                <TableHead className="w-[100px] whitespace-normal hidden md:table-cell">Отправлен кому</TableHead>
                <TableHead className="w-[120px] whitespace-normal">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`cursor-pointer font-medium flex items-center gap-1 ${filterStatus ? 'text-blue-600' : ''}`}>
                        Статус
                        <Filter className={`h-4 w-4 ${filterStatus ? 'text-blue-600 fill-blue-100' : ''}`} />
                        {filterStatus && <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Фильтр</span>}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={resetFilter}>
                        Все
                      </DropdownMenuItem>
                      {filterStatus !== 'not_reviewed' && (
                        <DropdownMenuItem onClick={() => applyFilter('not_reviewed')}>
                          Не проверено
                        </DropdownMenuItem>
                      )}
                      {filterStatus !== 'approved' && (
                        <DropdownMenuItem onClick={() => applyFilter('approved')}>
                          Одобрено
                        </DropdownMenuItem>
                      )}
                      {filterStatus !== 'spam' && (
                        <DropdownMenuItem onClick={() => applyFilter('spam')}>
                          В спам
                        </DropdownMenuItem>
                      )}
                      {filterStatus !== 'not_approved' && (
                        <DropdownMenuItem onClick={() => applyFilter('not_approved')}>
                          Отклонено
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[160px] whitespace-normal">Действия</TableHead>
                <TableHead className="w-[150px] whitespace-normal hidden lg:table-cell">Теги</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLeads.map((lead: Lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="align-top"><Badge variant="secondary" className="inline-flex items-center whitespace-normal text-xs">{lead.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs align-top whitespace-normal">
                    {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('ru-RU') : '-'}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1 w-full max-w-[300px]">
                      <p className="font-medium text-sm truncate whitespace-normal">{lead.chat_title}</p>
                      <p className="text-xs truncate whitespace-normal line-clamp-3 text-muted-foreground">{lead.message}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top hidden md:table-cell">-</TableCell>
                  <TableCell className="align-top">
                    <Badge variant="secondary" className={getBadgeClass(lead.moderation_status)}>
                      {getStatusText(lead.moderation_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle">
                    {(() => {
                      type ModerationOption = "approved" | "spam" | "not_approved";
                      const buttonProps: Record<ModerationOption, { label: string; icon: JSX.Element; className: string }> = {
                        approved: {
                          label: "Одобрить",
                          icon: <Check className="h-4 w-4 mr-1" />,
                          className: "!bg-green-500 hover:!bg-green-600 text-white"
                        },
                        spam: {
                          label: "В спам",
                          icon: <Ban className="h-4 w-4 mr-1" />,
                          className: "!bg-gray-500 hover:!bg-gray-600 text-white"
                        },
                        not_approved: {
                          label: "Отклонить",
                          icon: <XCircle className="h-4 w-4 mr-1" />,
                          className: "!bg-red-500 hover:!bg-red-600 text-white"
                        }
                      };
                      if (lead.moderation_status === "not_reviewed") {
                        return (
                          <div className="flex flex-col items-center justify-center w-full">
                            <div className="flex gap-1 w-full">
                              <Button
                                size="sm"
                                className={`flex-1 min-w-0 ${buttonProps.approved.className}`}
                                onClick={() => handleStatusChange(lead.id, "approved")}
                              >
                                {buttonProps.approved.icon}
                                <span className="hidden sm:inline">{buttonProps.approved.label}</span>
                              </Button>
                              <Button
                                size="sm"
                                className={`flex-1 min-w-0 ${buttonProps.not_approved.className}`}
                                onClick={() => handleStatusChange(lead.id, "not_approved")}
                              >
                                {buttonProps.not_approved.icon}
                                <span className="hidden sm:inline">{buttonProps.not_approved.label}</span>
                              </Button>
                            </div>
                            <div className="mt-2 w-full">
                              <Button
                                size="sm"
                                className={`w-full ${buttonProps.spam.className}`}
                                onClick={() => handleStatusChange(lead.id, "spam")}
                              >
                                {buttonProps.spam.icon}
                                <span className="hidden sm:inline">{buttonProps.spam.label}</span>
                              </Button>
                            </div>
                          </div>
                        );
                      } else {
                        const availableOptions: ModerationOption[] = ( ["approved", "spam", "not_approved"] as ModerationOption[] ).filter(s => s !== lead.moderation_status);
                        return (
                          <div className="flex flex-col gap-2 items-center justify-center w-full">
                            {availableOptions.map((option: ModerationOption) => (
                              <Button
                                key={option}
                                size="sm"
                                className={`w-full ${buttonProps[option].className}`}
                                onClick={() => handleStatusChange(lead.id, option)}
                              >
                                {buttonProps[option].icon}
                                <span className="hidden sm:inline">{buttonProps[option].label}</span>
                              </Button>
                            ))}
                          </div>
                        );
                      }
                    })()}
                  </TableCell>
                  <TableCell className="align-top hidden lg:table-cell">
                    {lead.tags && lead.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {lead.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-gray-100 text-xs whitespace-normal">
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

      {loadingMore && (
        <div className="flex justify-center my-4">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {leads.length > 0 && !loadingMore && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={computedTotalPages}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          showLoadMore={hasMore}
        />
      )}
    </div>
  );
}
