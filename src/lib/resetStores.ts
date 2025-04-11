import { useApiConfig } from '@/store/apiConfigStore';

/**
 * Resets all Zustand stores to their initial state
 * Add additional store resets here as needed
 */
export const resetAllStores = () => {
  // Reset API config store
  useApiConfig.getState().reset();
  
  // Add other store resets here
  // example: useOtherStore.getState().reset();
  
  // Optional: clear all localStorage if you want to reset everything
  // if (typeof window !== 'undefined') {
  //   localStorage.clear();
  // }
}; 