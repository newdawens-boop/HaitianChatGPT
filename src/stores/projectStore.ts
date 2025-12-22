import { create } from 'zustand';
import { Project, ProjectState } from '@/types/project';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: new Map(),
  currentProjectId: null,
  
  addProject: (project: Project) => set((state) => {
    const newProjects = new Map(state.projects);
    newProjects.set(project.id, project);
    return { projects: newProjects };
  }),
  
  updateProject: (id: string, updates: Partial<Project>) => set((state) => {
    const project = state.projects.get(id);
    if (!project) return state;
    
    const newProjects = new Map(state.projects);
    newProjects.set(id, { ...project, ...updates });
    return { projects: newProjects };
  }),
  
  setCurrentProjectId: (id: string | null) => set({ currentProjectId: id }),
  
  getProject: (id: string) => get().projects.get(id),
}));
