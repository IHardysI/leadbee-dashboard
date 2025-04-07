/**
 * Types and API functions for service statistics
 */

/**
 * Represents the counts of conversations at different stages
 */
export interface ConversationStagesCount {
  [stage: string]: number;
}

/**
 * Represents statistics for a service
 */
export interface ServiceStats {
  /** Number of active accounts */
  active_accounts_count: number;
  
  /** Number of unique conversations */
  unique_conversations_count: number;
  
  /** Counts of conversations categorized by stages */
  conversation_stages_count: ConversationStagesCount;
  
  /** Name of the service */
  service_name: string;
}

/**
 * Category count interface for total counts
 */
export interface CategoryCount {
  count: number;
  category: string;
}

/**
 * Total counts statistics interface
 */
export interface TotalCounts {
  total_leads_count: number;
  total_sended_leads: number;
  total_clients_count: number;
  total_potential_leads: number;
  total_leads_count_by_category: CategoryCount[];
}

/**
 * Interface for messaged users count response
 */
export interface MessagedUsersCount {
  messaged_users_count: number;
}

/**
 * Interface for date range parameters
 */
export interface DateRangeParams {
  start_date?: string; // ISO format date string
  end_date?: string; // ISO format date string
}

/**
 * Format date for API request
 * @param date Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Fetches statistics for LeadBee services
 * @param dateFilter Optional date filter, can be either a single date or a date range
 * @returns Promise with service statistics array
 */
export async function getServiceStats(dateFilter?: Date | [Date, Date]): Promise<ServiceStats[]> {
  try {
    let url = 'https://python-platforma-leadbee-freelance.reflectai.pro/analytics/service_stats';
    
    // Add date parameters if provided
    if (dateFilter) {
      const params = new URLSearchParams();
      
      if (Array.isArray(dateFilter)) {
        // Date range: start_date and end_date
        params.append('start_date', formatDateForAPI(dateFilter[0]));
        params.append('end_date', formatDateForAPI(dateFilter[1]));
      } else {
        // Single date
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

import axios from 'axios';

/**
 * Fetches total counts data for analytics
 * @param dateFilter Optional date filter, can be either a single date or a date range
 * @returns Promise with total counts data
 */
export async function getTotalCounts(dateFilter?: Date | [Date, Date]): Promise<TotalCounts> {
  try {
    const url = 'https://python-platforma-leadbee-freelance.reflectai.pro/analytics/total_counts';
    let params: any = {};
    
    if (dateFilter) {
      if (Array.isArray(dateFilter)) {
        // Date range: start_date and end_date
        params.start_date = dateFilter[0].toISOString().split('T')[0];
        params.end_date = dateFilter[1].toISOString().split('T')[0];
      } else {
        // Single date
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

/**
 * Fetches messaged users count for a specific date
 * @param date The date to get messaged users count for
 * @returns Promise with messaged users count data
 */
export async function getMessagedUsersCount(date: Date): Promise<MessagedUsersCount> {
  try {
    const formattedDate = formatDateForAPI(date);
    const url = `https://python-platforma-leadbee-freelance.reflectai.pro/analytics/messaged_users_count?date=${formattedDate}`;
    
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
