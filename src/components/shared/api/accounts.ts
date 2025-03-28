import axios from 'axios';

const ACCOUNTS_BASE_URL: string =
  process.env.NEXT_PUBLIC_ACCOUNTS_API_URL ||
  'https://python-platforma-leadbee-freelance.reflectai.pro/leadbee';

export const getAccountsList = async (page: number = 1, perPage: number = 20): Promise<any> => {
  const { data } = await axios.get(`${ACCOUNTS_BASE_URL}/accounts/list`, { 
    params: { 
      ts: new Date().getTime(),
      page,
      perPage
    } 
  });
  return data;
};

export const getAccountDetails = async (accountId: string): Promise<any> => {
  try {
    // Get account details from the accounts list
    const data = await getAccountsList();
    if (data && data.accounts) {
      const account = data.accounts.find((acc: any) => acc.id === accountId);
      if (account) {
        return { account };
      }
    }
    throw new Error("Account not found");
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
};

export const checkAccountSpam = async (alias: string): Promise<any> => {
  try {
    // Dedicated endpoint for spam checking only
    const apiUrl = 'https://python-platforma-leadbee-freelance.reflectai.pro/check_spam';
    const { data } = await axios.get(apiUrl, { 
      params: { alias, ts: new Date().getTime() } 
    });
    return data;
  } catch (error) {
    console.error("Error checking account spam status:", error);
    throw error;
  }
};

export const checkAllAccountsSpam = async (): Promise<any> => {
  try {
    // Use the dedicated endpoint for checking all accounts at once
    const apiUrl = 'https://python-platforma-leadbee-freelance.reflectai.pro/check_spam/all';
    const { data } = await axios.get(apiUrl, { 
      params: { ts: new Date().getTime() } 
    });
    return data;
  } catch (error) {
    console.error("Error checking all accounts spam status:", error);
    throw error;
  }
};

// Add more account-related API functions as needed 