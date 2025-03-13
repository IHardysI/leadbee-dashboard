import axios from 'axios';

const CHATS_BASE_URL: string =
  process.env.NEXT_PUBLIC_CHATS_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

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

export const getConversationsList = async (page: number = 1, limit: number = 10): Promise<ConversationsResponse> => {
  const offset = (page - 1) * limit;
  try {
    const { data } = await axios.get(`${CHATS_BASE_URL}/coversation/list`, { 
      params: { 
        limit, 
        offset,
        ts: new Date().getTime() 
      } 
    });
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

