import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

// Dynamic Base URL that reads from the Zustand store
export const getGroupsBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_GROUPS_API_URL || domain;
};

export interface Group {
  id: string;
  title: string;
  join_link: string;
  participants_count: number;
  parsing_status: boolean;
  parsing_for_search: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupsResponse {
  groups: Group[];
  total_count: number;
}

export const getGroupsList = async ({
  page = 1,
  limit = 15,
  query = '',
  filter = {}
}: {
  page?: number;
  limit?: number;
  query?: string;
  filter?: Record<string, any>;
}): Promise<GroupsResponse> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const offset = (page - 1) * limit;
    
    // Prepare params object
    const params: Record<string, any> = { 
      limit, 
      offset,
      ts: new Date().getTime() 
    };
    
    // Add search query if provided
    if (query) {
      params.query = query;
    }
    
    // Add any additional filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      params[key] = value;
    });
    
    const { data } = await axios.get(`${GROUPS_BASE_URL}/group/list`, { params });
    return data;
  } catch (error) {
    console.error("Error fetching groups list:", error);
    throw error;
  }
};

export const getGroupDetails = async (id: string): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const { data } = await axios.get(`${GROUPS_BASE_URL}/group`, {
      params: { 
        group_id: id,
        ts: new Date().getTime() 
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const { data } = await axios.delete(`${GROUPS_BASE_URL}/group/${id}`, {
      params: { 
        ts: new Date().getTime() 
      }
    });
    return data;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

export const createGroup = async (joinLink: string): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/group`,
      { join_link: joinLink },
      { 
        headers: { 'Content-Type': 'application/json' },
        params: { ts: new Date().getTime() } 
      }
    );
    return data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

export const changeParsingStatus = async (
  groupId: string, 
  parsingStatus?: boolean, 
  parsingForSearch?: boolean
): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const payload: any = { group_id: groupId };
    
    if (parsingStatus !== undefined) {
      payload.parsing_status = parsingStatus ? "true" : "false";
    }
    
    if (parsingForSearch !== undefined) {
      payload.parsing_for_search = parsingForSearch ? "true" : "false";
    }
    
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/group/parsing_status`,
      payload,
      { 
        headers: { 'Content-Type': 'application/json' },
        params: { ts: new Date().getTime() } 
      }
    );
    return data;
  } catch (error) {
    console.error("Error changing parsing status:", error);
    throw error;
  }
};

export const parseParticipants = async (groupId: string): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/group/participants`,
      { group_id: groupId },
      { 
        headers: { 'Content-Type': 'application/json' },
        params: { ts: new Date().getTime() } 
      }
    );
    return data;
  } catch (error) {
    console.error("Error parsing participants:", error);
    throw error;
  }
};

export const addMassGroups = async (sheetUrl: string): Promise<any> => {
  try {
    const GROUPS_BASE_URL = getGroupsBaseUrl();
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/join_channels`,
      { sheet_url: sheetUrl },
      { 
        headers: { 'Content-Type': 'application/json' },
        params: { ts: new Date().getTime() } 
      }
    );
    return data;
  } catch (error) {
    console.error("Error adding mass groups:", error);
    throw error;
  }
};