import axios from 'axios';
import { getCurrentDomain } from '@/lib/apiDomains';

// Dynamic Base URL that reads from the Zustand store
export const getAccountsBaseUrl = (): string => {
  const domain = getCurrentDomain();
  return process.env.NEXT_PUBLIC_ACCOUNTS_API_URL || domain;
};

export const getAccountsList = async (page: number = 1, perPage: number = 20): Promise<any> => {
  try {
    const ACCOUNTS_BASE_URL = getAccountsBaseUrl();
    const params = { 
      ts: new Date().getTime(),
      page,
      perPage
    };
    
    const { data } = await axios.get(`${ACCOUNTS_BASE_URL}/accounts/list`, { params });
    return data;
  } catch (error) {
    console.error("Error fetching accounts list:", error);
    throw error;
  }
};

export const getAccountDetails = async (id: string): Promise<any> => {
  try {
    const ACCOUNTS_BASE_URL = getAccountsBaseUrl();
    const params = { 
      id, 
      ts: new Date().getTime() 
    };
    
    const { data } = await axios.get(`${ACCOUNTS_BASE_URL}/accounts/detail`, { params });
    return data;
  } catch (error) {
    console.error("Error getting account details:", error);
    throw error;
  }
};

export const checkAccountSpam = async (alias: string): Promise<any> => {
  try {
    const ACCOUNTS_BASE_URL = getAccountsBaseUrl();
    const params = { 
      alias, 
      ts: new Date().getTime() 
    };
    
    const { data } = await axios.get(`${ACCOUNTS_BASE_URL}/accounts/check_spam`, { params });
    return data;
  } catch (error) {
    console.error("Error checking account spam status:", error);
    throw error;
  }
};

export const checkAllAccountsSpam = async (): Promise<any> => {
  try {
    const ACCOUNTS_BASE_URL = getAccountsBaseUrl();
    const params = { 
      ts: new Date().getTime() 
    };
    
    const { data } = await axios.get(`${ACCOUNTS_BASE_URL}/accounts/check_spam/all`, { params });
    return data;
  } catch (error) {
    console.error("Error checking all accounts spam status:", error);
    throw error;
  }
};

export const createAccount = async (data: any): Promise<any> => {
  try {
    const ACCOUNTS_BASE_URL = getAccountsBaseUrl();
    const params = { ts: new Date().getTime() };
    
    const response = await axios.post(`${ACCOUNTS_BASE_URL}/accounts/create`, data, { params });
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

