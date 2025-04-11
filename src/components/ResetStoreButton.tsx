import { useApiConfig } from '@/store/apiConfigStore';

export function ResetStoreButton() {
  const reset = useApiConfig(state => state.reset);
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the application? This will clear your preferences.')) {
      reset();
      window.location.reload();
    }
  };
  
  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Reset Application
    </button>
  );
} 