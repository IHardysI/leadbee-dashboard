import axios from 'axios';

/**
 * This file contains functions to interact with analytics related APIs.
 * It includes endpoints to get counts for freelancers, leads, messaged users,
 * and to analyze groups for specific categories.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_URL ||
  'http://python-platforma-leadbee-freelance.dev.reflectai.pro/leadbee';

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
  const response = await axios.get(`${API_BASE_URL}/analytics/leads_count`, {
    params: { date },
  });
  return response.data;
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
  const response = await axios.post(`${API_BASE_URL}/analyze_group`, {
    group_ids: groupIds,
    category_ids: categoryIds,
  });
  return response.data;
};
