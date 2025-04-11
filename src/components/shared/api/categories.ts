import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

/**
 * This file contains functions to interact with category-related APIs.
 * It includes endpoints to retrieve the list of categories and to upsert a category.
 */

// Dynamic Base URL that reads from the Zustand store
export const getCategoryBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_CATEGORY_API_URL || domain;
};

/**
 * Retrieves the list of available categories.
 * This function calls the lead/categories endpoint which returns categories in the format:
 * {
 *   "categories": [
 *     { "name": "Category_Name", "prompt": "" },
 *     ...
 *   ]
 * }
 */
export const getCategoriesList = async (): Promise<any> => {
  const CATEGORY_BASE_URL = getCategoryBaseUrl();
  const { data } = await axios.get(`${CATEGORY_BASE_URL}/category/list`);
  return data;
};

/**
 * Upserts a category with the provided name and prompt.
 * If the category does not exist, it will be created.
 */
export const upsertCategory = async (name: string, prompt: string): Promise<any> => {
  const CATEGORY_BASE_URL = getCategoryBaseUrl();
  const { data } = await axios.post(
    `${CATEGORY_BASE_URL}/category/`,
    { name, prompt },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
};

/**
 * Retrieves category analytics data based on time range and interval.
 * @param startTime - Start of time range in format "YYYY-MM-DD HH:MM:SS"
 * @param endTime - End of time range in format "YYYY-MM-DD HH:MM:SS"
 * @param interval - Time interval for data grouping: "15 minutes", "1 hour", or "1 day"
 * @param categoryNames - Optional array of category names to filter by (not IDs)
 */
export const getCategoryAnalytics = async (
  startTime: string,
  endTime: string,
  interval: "15 minutes" | "1 hour" | "1 day",
  categoryNames?: string[]
): Promise<any> => {
  const categories = categoryNames?.join(',') || '';
  
  const CATEGORY_BASE_URL = getCategoryBaseUrl();
  
  try {
    const { data } = await axios.get(`${CATEGORY_BASE_URL}/lead/analytics`, {
      params: {
        start_time: startTime,
        end_time: endTime,
        interval,
        categories
      }
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching category analytics:", error);
    throw error;
  }
};

/**
 * Gets a simple array of category names for analytics filtering
 * This is different from getCategoriesList which returns detailed category information
 * The response is expected to be in the format: { "categories": [ { "name": "Category_Name", "prompt": "" }, ... ] }
 */
export const getCategoryNamesForAnalytics = async (): Promise<string[]> => {
  const CATEGORY_BASE_URL = getCategoryBaseUrl();
  const { data } = await axios.get(`${CATEGORY_BASE_URL}/lead/categories`);
  
  if (Array.isArray(data) && typeof data[0] === 'string') {
    return data;
  }
  
  if (data && data.categories && Array.isArray(data.categories)) {
    return data.categories.map((category: any) => category.name);
  }
  
  console.warn("getCategoryNamesForAnalytics: Unexpected response format", data);
  return [];
};