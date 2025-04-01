import axios from 'axios';

const GROUPS_BASE_URL: string =
  process.env.NEXT_PUBLIC_GROUPS_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

export const getGroupsList = async (page: number = 1, limit: number = 15): Promise<any> => {
  const offset = (page - 1) * limit;
  const { data } = await axios.get(`${GROUPS_BASE_URL}/groups`, { params: { limit, offset, ts: new Date().getTime() } });
  return data;
};

export const getGroupDetails = async (groupId: string): Promise<any> => {
  try {
    const { data } = await axios.get(`${GROUPS_BASE_URL}/group`, { 
      params: { group_id: groupId, ts: new Date().getTime() } 
    });
    return data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

export const createGroup = async (joinLink: string): Promise<any> => {
  const { data } = await axios.post(
    `${GROUPS_BASE_URL}/group`,
    { join_link: joinLink },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
};

export const changeParsingStatus = async (
  groupId: string, 
  parsingStatus?: boolean, 
  parsingForSearch?: boolean
): Promise<any> => {
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
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
};

export const parseParticipants = async (groupId: string): Promise<any> => {
  try {
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/parse_participants`,
      { group_id: groupId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (error) {
    console.error("Error parsing participants:", error);
    throw error;
  }
};

export const addMassGroups = async (sheetUrl: string): Promise<any> => {
  try {
    const { data } = await axios.post(
      `${GROUPS_BASE_URL}/join_channels`,
      { sheet_url: sheetUrl },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (error) {
    console.error("Error adding mass groups:", error);
    throw error;
  }
};