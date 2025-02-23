import axios from 'axios';

/**
 * This file contains functions to interact with category-related APIs.
 * It includes endpoints to retrieve the list of categories and to upsert a category.
 */

const CATEGORY_BASE_URL =
  process.env.NEXT_PUBLIC_CATEGORY_API_URL ||
  'http://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

/**
 * Retrieves the list of available categories.
 */
export const getCategoriesList = async (): Promise<any> => {
  const { data } = await axios.get(`${CATEGORY_BASE_URL}/category/list`);
  return data;
};

/**
 * Upserts a category with the provided name and prompt.
 * If the category does not exist, it will be created.
 */
export const upsertCategory = async (name: string, prompt: string): Promise<any> => {
  const { data } = await axios.post(`${CATEGORY_BASE_URL}/category`, { name, prompt });
  return data;
};