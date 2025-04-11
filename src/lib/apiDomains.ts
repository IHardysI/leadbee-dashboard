import { useApiConfig } from "@/store/apiConfigStore";

export const getCurrentDomain = (): string => {
  const store = useApiConfig.getState();
  const domain = store.currentProject.domain;
  
  // Ensure domain has protocol prefix
  if (domain && !domain.startsWith('http')) {
    return `https://${domain}`;
  }
  
  return domain;
}; 