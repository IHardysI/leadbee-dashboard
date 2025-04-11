import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

export interface ConversationStagesCount {
  [stage: string]: number;
}

export interface ServiceStats {
  active_accounts_count: number;
  unique_conversations_count: number;
  conversation_stages_count: ConversationStagesCount;
  service_name: string;
}

export interface CategoryCount {
  count: number;
  category: string;
}

export interface TotalCounts {
  total_leads_count: number;
  total_sended_leads: number;
  total_clients_count: number;
  total_potential_leads: number;
  total_leads_count_by_category: CategoryCount[];
}

export interface MessagedUsersCount {
  messaged_users_count: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getServiceStats(dateFilter?: Date | [Date, Date]): Promise<ServiceStats[]> {
  try {
    const domain = getCurrentDomain();
    let url = `${domain}/analytics/service_stats`;
    
    if (dateFilter) {
      const params = new URLSearchParams();
      
      if (Array.isArray(dateFilter)) {
        params.append('start_date', formatDateForAPI(dateFilter[0]));
        params.append('end_date', formatDateForAPI(dateFilter[1]));
      } else {
        params.append('date', formatDateForAPI(dateFilter));
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch service stats: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching service statistics:', error);
    throw new Error('Failed to load service statistics. Please try again later.');
  }
}

export async function getTotalCounts(dateFilter?: Date | [Date, Date]): Promise<TotalCounts> {
  try {
    const domain = getCurrentDomain();
    const url = `${domain}/analytics/total_counts`;
    let params: any = {};
    
    if (dateFilter) {
      if (Array.isArray(dateFilter)) {
        params.start_date = dateFilter[0].toISOString().split('T')[0];
        params.end_date = dateFilter[1].toISOString().split('T')[0];
      } else {
        params.date = dateFilter.toISOString().split('T')[0];
      }
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching total counts:', error);
    throw new Error('Failed to load total counts data. Please try again later.');
  }
}

export async function getMessagedUsersCount(date: Date): Promise<MessagedUsersCount> {
  try {
    const domain = getCurrentDomain();
    const formattedDate = formatDateForAPI(date);
    const url = `${domain}/analytics/messaged_users_count?date=${formattedDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messaged users count: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching messaged users count:', error);
    throw new Error('Failed to load messaged users count. Please try again later.');
  }
}
