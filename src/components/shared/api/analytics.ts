import axios from 'axios';

/**
 * This file contains functions to interact with analytics related APIs.
 * It includes endpoints to get counts for freelancers, leads, messaged users,
 * and to analyze groups for specific categories.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

/**
 * Retrieves the total count of freelancers.
 * Optionally, a specific date can be provided to filter the results.
 */
export const getFreelancersCount = async (date: string = ''): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/analytics/freelancers_count`, {
    params: { date },
  });
  return response.data;
};

/**
 * Retrieves the total count of leads.
 * Optionally, a specific date can be provided to filter the results.
 */
export const getLeadsCount = async (date: string = ''): Promise<any> => {
  const param = (date && date.trim() !== '') ? date.trim() : 'overall';
  const { data } = await axios.get(`${API_BASE_URL}/analytics/leads_count`, { params: { date: param } });
  console.log('getLeadsCount (using param):', param, data);
  return data;
};

/**
 * Retrieves the total count of messaged users.
 * Optionally, a specific date can be provided to filter the results.
 */
export const getMessagedUsersCount = async (date: string = ''): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/analytics/messaged_users_count`, {
    params: { date },
  });
  return response.data;
};

/**
 * Analyzes groups based on provided group and category IDs.
 * Useful for performing custom analysis on selected groups.
 */
export const analyzeGroup = async (groupIds: string[], categoryIds: string[]): Promise<any> => {
  const payload = {
    group_ids: groupIds,
    category_ids: categoryIds,
  };

  const response = await axios.post(`${API_BASE_URL}/analyze_group`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/**
 * Retrieves a list of leads with the specified limit and offset.
 * Optionally filters by moderation_status if provided.
 */
export const getLeadsList = async (page: number = 1, limit: number = 15, moderation_status: string = ''): Promise<any> => {
  const offset = (page - 1) * limit;
  const params: any = { limit, offset, ts: new Date().getTime() };
  
  if (moderation_status) {
    params.moderation_status = moderation_status;
    console.log(`Filtering leads by moderation_status: ${moderation_status}`);
  }
  
  console.log('API call params:', params);
  const response = await axios.get(`${API_BASE_URL}/lead/list`, { params });
  console.log(`API response: ${response.data.leads?.length} leads, total: ${response.data.total_count || 'unknown'}`);
  return response.data;
};

// Inserted function to update lead moderation status
/**
 * Updates the moderation status for a lead.
 * moderation_status может быть один из ["not_approved", "spam", "approved", "not_reviewed"]
 */
export const updateModerationStatus = async (lead_id: string, moderation_status: "not_approved" | "spam" | "approved" | "not_reviewed"): Promise<any> => {
  const response = await axios.put(`${API_BASE_URL}/lead/moderation_status`, { lead_id, moderation_status }, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};
