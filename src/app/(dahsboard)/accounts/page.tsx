"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, Loader2, Shield, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { getAccountsList, getAccountDetails, checkAccountSpam, checkAllAccountsSpam } from "@/components/shared/api/accounts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import PaginationUniversal from '@/components/widgets/PaginationUniversal'

interface Account {
  id: string;
  alias: string;
  phone_number: string;
  username: string;
  project: string;
  spam_status: string;
  spam_message: string;
}

interface DetailedAccount {
  id: string;
  alias: string;
  phone_number: string;
  username: string;
  project: string;
  spam_status: string;
  spam_message: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingSpam, setCheckingSpam] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailedAccount, setDetailedAccount] = useState<DetailedAccount | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkingAllSpam, setCheckingAllSpam] = useState<boolean>(false);
  
  // Pagination related states
  const accountsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');

  const filteredAccounts = accounts.filter((account) =>
    account.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const computedTotalPages = totalCount ? Math.ceil(totalCount / accountsPerPage) : 1;
  const displayedAccounts = filteredAccounts;
  
  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
  };

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      try {
        const response = await getAccountsList(currentPage, accountsPerPage);
        if (response.accounts) {
          if (navigationMode === 'pagination') {
            setAccounts(response.accounts);
          } else {
            // For load more, append the new accounts to existing ones
            setAccounts(prev => {
              const newAccounts = response.accounts.filter(
                (account: any) => !prev.some((existing: any) => existing.id === account.id)
              );
              return [...prev, ...newAccounts];
            });
          }
          
          // Set total count for pagination
          if (response.totalPages) {
            setTotalCount(response.totalPages * accountsPerPage);
          } else if (response.total_count !== undefined) {
            setTotalCount(response.total_count);
          } else {
            // If total count not provided, estimate based on current response
            setTotalCount(prevCount => {
              // If we're on page 1, set the count to the response length
              // If we're beyond page 1 and got a full page, increment our estimate
              if (currentPage === 1) {
                return response.accounts.length;
              } else if (response.accounts.length === accountsPerPage) {
                return Math.max(prevCount, currentPage * accountsPerPage + accountsPerPage);
              } else {
                return Math.max(prevCount, currentPage * accountsPerPage + response.accounts.length);
              }
            });
          }
        } else {
          console.error('API returned unexpected response:', response);
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось загрузить данные аккаунтов.",
          });
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные аккаунтов.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, [toast, currentPage, accountsPerPage, navigationMode]);

  const handleAccountSelect = async (account: Account) => {
    // Immediately display the account data we already have
    setSelectedAccount(account);
    setDetailedAccount(account);
    
    try {
      // Refresh account details from the accounts list
      const response = await getAccountDetails(account.id);
      if (response && response.account) {
        setDetailedAccount(response.account);
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      // We already have the account data displayed, so no need for an error toast
    }
  };

  const handleCheckSpam = async (account: Account, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent row click when clicking the button
    }
    
    setCheckingSpam(account.id);
    try {
      // This is specifically for checking spam status - separate from account details
      const response = await checkAccountSpam(account.alias);
      if (response && response.account) {
        const previousStatus = account.spam_status;
        const newStatus = response.account.spam_status;
        
        // Update the account in the accounts list
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.id === account.id ? response.account : acc
          )
        );
        
        // If this account is currently selected, update its details
        if (selectedAccount && selectedAccount.id === account.id) {
          setDetailedAccount(response.account);
        }
        
        // Show appropriate toast based on status change
        if (previousStatus !== newStatus) {
          if (newStatus === "ok") {
            toast({
              title: "Статус изменен",
              description: `Бот ${account.alias} теперь активен и не имеет ограничений.`,
              variant: "default",
            });
          } else {
            toast({
              title: "Статус изменен",
              description: `Бот ${account.alias} заблокирован или имеет ограничения.`,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Проверка выполнена",
            description: `Статус бота ${account.alias} не изменился: ${newStatus === "ok" ? "активен" : "заблокирован"}.`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error checking spam status:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить статус спама.",
      });
    } finally {
      setCheckingSpam(null);
    }
  };

  const handleCheckAllSpam = async () => {
    setCheckingAllSpam(true);
    try {
      // Call the check all spam endpoint
      const response = await checkAllAccountsSpam();
      
      if (response && response.message === "success") {
        // If successful, fetch the updated accounts list
        const updatedAccounts = await getAccountsList();
        
        if (updatedAccounts && updatedAccounts.accounts) {
          // Calculate how many accounts changed status
          const changedAccounts = updatedAccounts.accounts.filter((newAcc: Account) => {
            const oldAcc = accounts.find(acc => acc.id === newAcc.id);
            return oldAcc && oldAcc.spam_status !== newAcc.spam_status;
          });
          
          // Update accounts state with fresh data
          setAccounts(updatedAccounts.accounts);
          
          // Show appropriate toast based on the results
          if (changedAccounts.length > 0) {
            toast({
              title: "Статусы обновлены",
              description: `Обновлен статус ${changedAccounts.length} из ${updatedAccounts.accounts.length} ботов.`,
              variant: "default",
            });
          } else {
            toast({
              title: "Проверка выполнена",
              description: `Статусы всех ${updatedAccounts.accounts.length} ботов проверены. Изменений не обнаружено.`,
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Проверка выполнена",
            description: "Статусы ботов обновлены успешно.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Внимание",
          description: "Получен неожиданный ответ от сервера при проверке ботов.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking all spam status:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить статус спама для всех аккаунтов.",
      });
    } finally {
      setCheckingAllSpam(false);
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button 
          onClick={handleCheckAllSpam}
          className="bg-cYellow/90 hover:bg-cYellow"
          disabled={checkingAllSpam}
        >
          {checkingAllSpam ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Проверка всех ботов...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Проверить спам-статус всех ботов
            </>
          )}
        </Button>
        
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск по имени или номеру" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 w-full" 
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] whitespace-normal">Алиас</TableHead>
              <TableHead className="whitespace-normal">Имя пользователя</TableHead>
              <TableHead className="whitespace-normal">Номер телефона</TableHead>
              <TableHead className="whitespace-normal">Проект</TableHead>
              <TableHead className="whitespace-normal">Статус</TableHead>
              <TableHead className="w-[120px] whitespace-normal">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAccounts.length > 0 ? (
              displayedAccounts.map((account) => (
                <TableRow key={account.id} onClick={() => handleAccountSelect(account)} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium whitespace-normal">
                    {account.alias}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Link href={`https://t.me/${account.username.replace('@', '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:text-blue-800 whitespace-normal">
                      {account.username}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-normal">{account.phone_number}</TableCell>
                  <TableCell className="whitespace-normal">{account.project}</TableCell>
                  <TableCell className="whitespace-normal">
                    <Badge
                      variant={account.spam_status === "ok" ? "secondary" : "destructive"}
                      className={account.spam_status === "ok" ? "bg-green-100 text-green-800" : ""}
                    >
                      {account.spam_status === "ok" ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Активен</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Заблокирован</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleCheckSpam(account, e)}
                      disabled={checkingSpam === account.id}
                      className="w-full px-4"
                    >
                      {checkingSpam === account.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Проверить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Аккаунты не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalCount > 0 && (
        <PaginationUniversal 
          currentPage={currentPage} 
          totalPages={computedTotalPages}
          onPageChange={handlePageChange}
          onLoadMore={() => {
            setNavigationMode('loadmore');
            setCurrentPage(prev => prev + 1);
          }}
          showLoadMore={currentPage < computedTotalPages}
        />
      )}

      {selectedAccount && (
        <Dialog open={true} onOpenChange={() => { setSelectedAccount(null); setDetailedAccount(null); }}>
          <DialogContent className="!w-[80vw] !max-w-[80vw]">
            <DialogHeader>
              <DialogTitle>{selectedAccount.alias}</DialogTitle>
              <DialogDescription>Подробная информация об аккаунте</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border mt-2 max-h-[60vh] overflow-y-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Параметр</TableHead>
                    <TableHead>Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">ID аккаунта</TableCell>
                    <TableCell className="whitespace-normal">{detailedAccount?.id || selectedAccount.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Алиас</TableCell>
                    <TableCell className="whitespace-normal">{detailedAccount?.alias || selectedAccount.alias}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Имя пользователя</TableCell>
                    <TableCell className="whitespace-normal">
                      <Link href={`https://t.me/${(detailedAccount?.username || selectedAccount.username).replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 whitespace-normal">
                        {detailedAccount?.username || selectedAccount.username}
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Номер телефона</TableCell>
                    <TableCell className="whitespace-normal">{detailedAccount?.phone_number || selectedAccount.phone_number}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Проект</TableCell>
                    <TableCell className="whitespace-normal">{detailedAccount?.project || selectedAccount.project}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Статус</TableCell>
                    <TableCell className="whitespace-normal">
                      {(detailedAccount?.spam_status || selectedAccount.spam_status) === "ok" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 inline-flex items-center whitespace-normal">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 inline-flex items-center whitespace-normal">
                          <XCircle className="h-3 w-3 mr-1" />
                          Заблокирован
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold whitespace-normal">Сообщение о блокировке</TableCell>
                    <TableCell className="whitespace-normal break-words">
                      {(detailedAccount?.spam_message || selectedAccount.spam_message) || "Нет сообщения"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckSpam(selectedAccount);
                }}
                disabled={checkingSpam === selectedAccount.id}
                className="px-4"
              >
                {checkingSpam === selectedAccount.id ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Проверка...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" /> Проверить спам-статус</>
                )}
              </Button>
              <Button onClick={() => { setSelectedAccount(null); setDetailedAccount(null); }}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {errorMessage && (
        <Dialog open={true} onOpenChange={() => setErrorMessage(null)}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Ошибка</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorMessage(null)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 