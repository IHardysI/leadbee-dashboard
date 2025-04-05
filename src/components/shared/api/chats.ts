import axios from 'axios';

const CHATS_BASE_URL: string =
  process.env.NEXT_PUBLIC_CHATS_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro';

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

export const getConversationsList = async ({
  page = 1, 
  limit = 10, 
  filter = {}
}: {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
}): Promise<ConversationsResponse> => {
  const offset = (page - 1) * limit;
  try {
    // Prepare the params object - now simplified since we're using client-side filtering
    const params: Record<string, any> = { 
      limit, 
      offset,
      ts: new Date().getTime()
    };
    
    // Add any other filter parameters except stage (handled on client side)
    Object.entries(filter).forEach(([key, value]) => {
      if (key !== 'stage') {
        params[key] = value;
      }
    });
    
    console.log('API call with params:', params);
    
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/list`, { params });
    console.log('API response total:', data.total_count);
    return data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getConversationById = async (conversationId: number): Promise<ConversationDetailResponse> => {
  try {
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

