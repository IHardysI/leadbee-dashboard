import { useApiConfig } from '@/store/apiConfigStore';
// Import other stores here
// import { useExampleStore } from '@/components/shared/store/exampleStore';

/**
 * Resets all Zustand stores to their initial state
 * Add additional store resets here as needed
 */
export const resetAllStores = () => {
  // Reset API config store
  useApiConfig.getState().reset();
  
  // Add other store resets here
  // useExampleStore.getState().someResetFunction();
  
  // Clear localStorage for specific stores
  if (typeof window !== 'undefined') {
    localStorage.removeItem('api-config-store');
    // Add other store keys as needed
    // localStorage.removeItem('other-store-key');
  }
}; 