import axios from 'axios';

/**
 * This file contains functions to interact with category-related APIs.
 * It includes endpoints to retrieve the list of categories and to upsert a category.
 */

const CATEGORY_BASE_URL =
  process.env.NEXT_PUBLIC_CATEGORY_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

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
  const { data } = await axios.get(`${CATEGORY_BASE_URL}/lead/categories`);
  return data;
};

/**
 * Upserts a category with the provided name and prompt.
 * If the category does not exist, it will be created.
 */
export const upsertCategory = async (name: string, prompt: string): Promise<any> => {
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
  // Join categories with comma for the API request
  const categories = categoryNames?.join(',') || '';
  
  console.log("DEBUG - API Request:", `${CATEGORY_BASE_URL}/lead/analytics`);
  console.log("DEBUG - Parameters:", {
    start_time: startTime,
    end_time: endTime,
    interval,
    categories
  });
  
  try {
    // Make API request with properly formatted parameters
    const { data } = await axios.get(`${CATEGORY_BASE_URL}/lead/analytics`, {
      params: {
        start_time: startTime,
        end_time: endTime,
        interval,
        categories
      }
    });
    
    console.log("DEBUG - API Response Status: Success");
    console.log("DEBUG - Response Structure:", Object.keys(data));
    
    if (data?.result) {
      console.log("DEBUG - Result Count:", data.result.length);
      
      if (data.result.length > 0) {
        console.log("DEBUG - First Result Item:", data.result[0]);
        
        // Check if our category is in the response
        if (categoryNames?.length) {
          console.log("DEBUG - Looking for category:", categoryNames[0]);
          console.log("DEBUG - Available keys:", Object.keys(data.result[0]));
        }
      }
    } else {
      console.log("DEBUG - No result array in response");
    }
    
    return data;
  } catch (error) {
    console.error("DEBUG - API Error:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("DEBUG - Request Config:", {
        url: error.config?.url,
        params: error.config?.params,
        status: error.response?.status
      });
      console.error("DEBUG - Response Data:", error.response?.data);
    }
    
    throw error;
  }
};

/**
 * Gets a simple array of category names for analytics filtering
 * This is different from getCategoriesList which returns detailed category information
 * The response is expected to be in the format: { "categories": [ { "name": "Category_Name", "prompt": "" }, ... ] }
 */
export const getCategoryNamesForAnalytics = async (): Promise<string[]> => {
  const { data } = await axios.get(`${CATEGORY_BASE_URL}/lead/categories`);
  
  // If data is already an array of strings, return it directly
  if (Array.isArray(data) && typeof data[0] === 'string') {
    return data;
  }
  
  // If data has a categories array with objects that have name properties, extract those names
  if (data && data.categories && Array.isArray(data.categories)) {
    return data.categories.map((category: any) => category.name);
  }
  
  // Otherwise return an empty array
  console.warn("getCategoryNamesForAnalytics: Unexpected response format", data);
  return [];
};