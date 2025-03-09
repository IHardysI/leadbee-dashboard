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
import { useState, useEffect } from 'react';
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
  const [loadedCount, setLoadedCount] = useState(leadsPerPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

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

  const filteredLeads = filterStatus ? leads.filter(lead => lead.moderation_status === filterStatus) : leads;
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const displayedLeads = displayMode === 'loadmore' 
    ? filteredLeads.slice(0, loadedCount)
    : filteredLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);

  const handlePageChange = (page: number) => {
    setDisplayMode('pagination');
    setCurrentPage(page);
    setLoadedCount(leadsPerPage);
  };

  const handleLoadMore = () => {
    setDisplayMode('loadmore');
    setLoadedCount(loadedCount + leadsPerPage);
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
                <TableHead className="w-[150px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="cursor-pointer font-medium flex items-center gap-1">
                        Статус
                        <Filter className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={() => { setFilterStatus(''); setCurrentPage(1); setLoadedCount(leadsPerPage); setDisplayMode('pagination'); }}>Все</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setFilterStatus('not_reviewed'); setCurrentPage(1); setLoadedCount(leadsPerPage); setDisplayMode('pagination'); }}>Не проверено</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setFilterStatus('approved'); setCurrentPage(1); setLoadedCount(leadsPerPage); setDisplayMode('pagination'); }}>Одобрено</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setFilterStatus('spam'); setCurrentPage(1); setLoadedCount(leadsPerPage); setDisplayMode('pagination'); }}>В спам</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setFilterStatus('not_approved'); setCurrentPage(1); setLoadedCount(leadsPerPage); setDisplayMode('pagination'); }}>Отклонено</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="min-w-[300px]">Действия</TableHead>
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
                    <Badge variant="secondary" className={getBadgeClass(lead.moderation_status)}>
                      {getStatusText(lead.moderation_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                          <>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className={`w-1/2 ${buttonProps.approved.className}`}
                                onClick={() => handleStatusChange(lead.id, "approved")}
                              >
                                {buttonProps.approved.icon}
                                {buttonProps.approved.label}
                              </Button>
                              <Button
                                size="sm"
                                className={`w-1/2 ${buttonProps.not_approved.className}`}
                                onClick={() => handleStatusChange(lead.id, "not_approved")}
                              >
                                {buttonProps.not_approved.icon}
                                {buttonProps.not_approved.label}
                              </Button>
                            </div>
                            <div className="mt-2">
                              <Button
                                size="sm"
                                className={`w-full ${buttonProps.spam.className}`}
                                onClick={() => handleStatusChange(lead.id, "spam")}
                              >
                                {buttonProps.spam.icon}
                                {buttonProps.spam.label}
                              </Button>
                            </div>
                          </>
                        );
                      } else {
                        const availableOptions: ModerationOption[] = ( ["approved", "spam", "not_approved"] as ModerationOption[] ).filter(s => s !== lead.moderation_status);
                        return (
                          <div className="flex flex-col gap-2">
                            {availableOptions.map((option: ModerationOption) => (
                              <Button
                                key={option}
                                size="sm"
                                className={`w-full ${buttonProps[option].className}`}
                                onClick={() => handleStatusChange(lead.id, option)}
                              >
                                {buttonProps[option].icon}
                                {buttonProps[option].label}
                              </Button>
                            ))}
                          </div>
                        );
                      }
                    })()}
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
          showLoadMore={displayedLeads.length < filteredLeads.length}
        />
      )}
    </div>
  );
}
