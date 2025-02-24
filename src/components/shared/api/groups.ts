import axios from 'axios';

const GROUPS_BASE_URL: string =
  process.env.NEXT_PUBLIC_GROUPS_API_URL ||
  'https://python-platforma-leadbee-freelance.dev.reflectai.pro/leadbee';

export const getGroupsList = async (): Promise<any> => {
  const { data } = await axios.get(`${GROUPS_BASE_URL}/groups`);
  return data;
};

export const createGroup = async (joinLink: string): Promise<any> => {
  const payload = JSON.stringify({ join_link: joinLink });
  const { data } = await axios.post(
    `${GROUPS_BASE_URL}/group`,
    { join_link: joinLink },
    { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
  );
  return data;
};