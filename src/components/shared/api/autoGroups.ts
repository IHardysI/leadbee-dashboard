import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

// Dynamic Base URL that reads from the Zustand store
export const getAutoGroupsBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_GROUPS_API_URL || `${domain}/leadbee`;
};

export interface SearchChannelResult {
  id: number;
  name: string;
  type: "Chat" | "Channel";
  subscribers: number;
  spam_percentage: number;
  is_recommended?: boolean;
  description?: string;
}

export interface SearchChannelsResponse {
  query: string;
  total_results: number;
  results: SearchChannelResult[];
}

export const searchChannels = async (
  query: string,
  limit?: number,
  categories?: string[],
  offset?: number
): Promise<SearchChannelsResponse> => {
  const BASE_URL = getAutoGroupsBaseUrl();
  try {
    const payload: Record<string, any> = { query };
    
    if (limit) {
      payload.limit = limit;
    }
    
    if (offset !== undefined) {
      payload.offset = offset;
    }
    
    if (categories && categories.length > 0) {
      payload.categories = categories;
    }
    
    const { data } = await axios.post(
      `${BASE_URL}/search_channels`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return data;
  } catch (error) {
    console.error("Error searching channels:", error);
    throw error;
  }
}; 