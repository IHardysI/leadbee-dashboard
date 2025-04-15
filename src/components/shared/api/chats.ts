import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

// Dynamic Base URL that reads from the Zustand store
export const getChatsBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_CHATS_API_URL || domain;
};

export interface Conversation {
  conversation_id: number;
  username: string | null;
  bot_alias: string;
  last_message: string;
  last_created_at: string;
  stage: string | null;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total_count: number;
}

export interface ConversationMessage {
  is_user_message: boolean;
  is_bot_message: boolean;
  created_at: string;
  text: string;
  username: string;
  bot_alias: string;
}

export interface ConversationDetailResponse {
  messages: ConversationMessage[];
}

export interface DistinctStagesResponse {
  stages: string[];
}

export const getConversationsList = async ({
  page = 1, 
  limit = 10, 
  filter = {}
}: {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
}): Promise<ConversationsResponse> => {
  try {
    const CHATS_BASE_URL = getChatsBaseUrl();
    const offset = (page - 1) * limit;
    
    // Prepare the params object - include all filter parameters
    const params: Record<string, any> = { 
      limit, 
      offset,
      ts: new Date().getTime()
    };
    
    // Add all filter parameters including stage to be handled by the backend
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    });
    
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/list`, { params });
    return data;
  } catch (error) {
    console.error("Error fetching conversations list:", error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: number): Promise<any> => {
  try {
    const CHATS_BASE_URL = getChatsBaseUrl();
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/messages`, {
      params: {
        conversation_id: conversationId,
        ts: new Date().getTime()
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

export const getConversationById = async (conversationId: number): Promise<ConversationDetailResponse> => {
  try {
    const CHATS_BASE_URL = getChatsBaseUrl();
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/`, {
      params: {
        conversation_id: conversationId,
        ts: new Date().getTime()
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
};

export const getDistinctStages = async (): Promise<DistinctStagesResponse> => {
  try {
    const CHATS_BASE_URL = getChatsBaseUrl();
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/distinct_stages`, {
      params: {
        ts: new Date().getTime()
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching distinct stages:", error);
    throw error;
  }
};
