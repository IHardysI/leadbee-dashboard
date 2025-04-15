import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Project = {
  id: number;
  name: string;
  domain: string;
};

type ApiConfigState = {
  version: number;
  currentProject: Project;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  updateProjects: (projects: Project[]) => void;
  reset: () => void;
};

const formatProjectName = (domain: string): string => {
  const match = domain.match(/python-platforma-(.*?)\.(dev\.)?reflectai\.pro/);
  if (match && match[1]) {
    return match[1]
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return domain;
};

const domainsList = [
  'python-platforma-leadbee-freelance.dev.reflectai.pro',
  'python-platforma-leadbee-foreign-cards.dev.reflectai.pro',
  'python-platforma-marketplace-analytics.dev.reflectai.pro',
  'python-platforma-leadbee-beauty.dev.reflectai.pro',
  'python-platforma-max-personal.dev.reflectai.pro',
  
  // 'python-platforma-leadbee-keywords.dev.reflectai.pro',
  // 'python-platforma-csz-bot.dev.reflectai.pro',
  // 'python-platforma-leadbee-bot.dev.reflectai.pro',
  // 'python-platforma-leadbee-soul.dev.reflectai.pro',
  // 'python-platforma-marketplace-leadgen.dev.reflectai.pro',
  // 'python-platforma-marketplaces.dev.reflectai.pro',
];

const initialProjects: Project[] = domainsList.map((domain, index) => ({
  id: index + 1,
  name: formatProjectName(domain),
  domain: domain
}));

export const useApiConfig = create<ApiConfigState>()(
  persist(
    (set) => ({
      version: 1,
      currentProject: initialProjects[0],
      projects: initialProjects,
      setCurrentProject: (project) => set({ currentProject: project }),
      updateProjects: (projects) => set({ projects }),
      reset: () => {
        set({ 
          version: 1,
          currentProject: initialProjects[0], 
          projects: initialProjects 
        });
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('api-config-store');
        }
      },
    }),
    {
      name: 'api-config-store',
      partialize: (state) => ({
        version: state.version,
        currentProject: state.currentProject,
        projects: state.projects
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.version !== 1) {
          state.reset();
        }
      }
    }
  )
); 