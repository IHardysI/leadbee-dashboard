import { useApiConfig } from '@/store/apiConfigStore';

// Used to store the last check time
let lastResetCheck = 0;

// This could be an API endpoint that returns a reset flag
// For now we'll simulate it with a function
const checkForResetFlag = async (): Promise<boolean> => {
  try {
    // In a real application, this would be an API call:
    // const response = await fetch('/api/system/reset-flag');
    // return response.json();
    
    // For demonstration, always return false
    // In production, this would check a real endpoint
    return false;
  } catch (error) {
    console.error('Failed to check reset flag:', error);
    return false;
  }
};

// Function to check if store needs to be reset
export const checkForStoreReset = async () => {
  // Only check once per hour to avoid unnecessary API calls
  const now = Date.now();
  if (now - lastResetCheck < 60 * 60 * 1000) {
    return;
  }
  
  lastResetCheck = now;
  
  const shouldReset = await checkForResetFlag();
  if (shouldReset) {
    console.log('Server requested store reset');
    useApiConfig.getState().reset();
    window.location.reload();
  }
};

// Function to initialize the reset check
export const initResetService = () => {
  // Check on initial load
  checkForStoreReset();
  
  // Check periodically (every hour)
  setInterval(checkForStoreReset, 60 * 60 * 1000);
}; 