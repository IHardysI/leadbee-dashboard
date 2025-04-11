import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

/**
 * This file contains functions to interact with analytics related APIs.
 * It includes endpoints to get counts for freelancers, leads, messaged users,
 * and to analyze groups for specific categories.
 */

// Dynamic Base URL that reads from the Zustand store
export const getAnalyticsBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_ANALYTICS_API_URL || domain;
};

/**
 * Retrieves the total count of freelancers.
 * Optionally, a specific date can be provided to filter the results.
 */
export const getFreelancersCount = async (date: string = ''): Promise<any> => {
  try {
    const response = await axios.get(`${getAnalyticsBaseUrl()}/analytics/freelancers_count`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching freelancers count:', error);
    throw error;
  }
};

/**
 * Retrieves the total count of leads.
 * Optionally, a date filter can be provided to filter the results.
 * The date filter can be either a single Date or a date range [startDate, endDate].
 */
export const getLeadsCount = async (dateFilter?: Date | [Date, Date]): Promise<any> => {
  try {
    let params: any = {};

    if (dateFilter) {
      if (Array.isArray(dateFilter)) {
        params.start_date = dateFilter[0].toISOString().split('T')[0];
        params.end_date = dateFilter[1].toISOString().split('T')[0];
      } else {
        params.date = dateFilter.toISOString().split('T')[0];
      }
    }
    
    const { data } = await axios.get(`${getAnalyticsBaseUrl()}/analytics/total_counts`, { params });
    
    return { leads_count: data.total_leads_count };
  } catch (error) {
    console.error('Error fetching leads count:', error);
    throw error;
  }
};

/**
 * Retrieves the total count of messaged users.
 * Optionally, a specific date can be provided to filter the results.
 */
export const getMessagedUsersCount = async (date: string = ''): Promise<any> => {
  try {
    const response = await axios.get(`${getAnalyticsBaseUrl()}/analytics/messaged_users_count`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messaged users count:', error);
    throw error;
  }
};

/**
 * Analyzes groups based on provided group and category IDs.
 * Useful for performing custom analysis on selected groups.
 */
export const analyzeGroup = async (groupIds: string[], categoryIds: string[]): Promise<any> => {
  try {
    const payload = {
      group_ids: groupIds,
      category_ids: categoryIds,
    };

    const response = await axios.post(`${getAnalyticsBaseUrl()}/group/analyze`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing groups:', error);
    throw error;
  }
};

/**
 * Retrieves a list of leads with the specified limit and offset.
 * Optionally filters by moderation_status if provided.
 */
export const getLeadsList = async (page: number = 1, limit: number = 15, moderation_status: string = ''): Promise<any> => {
  try {
    const API_BASE_URL = getAnalyticsBaseUrl();
    const offset = (page - 1) * limit;
    
    const params: any = { 
      limit, 
      offset, 
      ts: new Date().getTime() 
    };
    
    if (moderation_status) {
      params.moderation_status = moderation_status;
    }
    
    const { data } = await axios.get(`${API_BASE_URL}/lead/list`, { params });
    return data;
  } catch (error) {
    console.error('Error fetching leads list:', error);
    throw error;
  }
};

// Inserted function to update lead moderation status
/**
 * Updates the moderation status for a lead.
 * moderation_status может быть один из ["not_approved", "spam", "approved", "not_reviewed"]
 */
export const updateModerationStatus = async (lead_id: string, moderation_status: "not_approved" | "spam" | "approved" | "not_reviewed"): Promise<any> => {
  try {
    const API_BASE_URL = getAnalyticsBaseUrl();
    const response = await axios.put(`${API_BASE_URL}/lead/moderation_status`, { lead_id, moderation_status }, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating moderation status:', error);
    throw error;
  }
};
