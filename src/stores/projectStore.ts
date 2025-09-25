import { create } from 'zustand';
import type { Project } from '../types';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  getProjectById: (id: string) => Project | undefined;
  deleteProjectWithCascade: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,

  addProject: (projectData) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),

  setCurrentProject: (project) =>
    set({ currentProject: project }),

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id);
  },

  deleteProjectWithCascade: (id) => {
    get().deleteProject(id);
  },
}));