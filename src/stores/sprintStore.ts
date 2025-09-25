import { create } from 'zustand';
import type { Sprint } from '../types';

interface SprintStore {
  sprints: Sprint[];
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  getSprintById: (id: string) => Sprint | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];
  getActiveSprint: (projectId: string) => Sprint | undefined;
  addIssueToSprint: (sprintId: string, issueId: string) => void;
  removeIssueFromSprint: (sprintId: string, issueId: string) => void;
  canStartSprint: (projectId: string) => boolean;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],

  addSprint: (sprintData) =>
    set((state) => ({
      sprints: [
        ...state.sprints,
        {
          ...sprintData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateSprint: (id, updates) =>
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === id
          ? { ...sprint, ...updates, updatedAt: new Date() }
          : sprint
      ),
    })),

  deleteSprint: (id) =>
    set((state) => ({
      sprints: state.sprints.filter((sprint) => sprint.id !== id),
    })),

  getSprintById: (id) => {
    return get().sprints.find((sprint) => sprint.id === id);
  },

  getSprintsByProject: (projectId) => {
    return get().sprints.filter((sprint) => sprint.projectId === projectId);
  },

  getActiveSprint: (projectId) => {
    return get().sprints.find(
      (sprint) => sprint.projectId === projectId && sprint.status === 'ACTIVE'
    );
  },

  addIssueToSprint: (sprintId, issueId) =>
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              issueIds: [...sprint.issueIds, issueId],
              updatedAt: new Date(),
            }
          : sprint
      ),
    })),

  removeIssueFromSprint: (sprintId, issueId) =>
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              issueIds: sprint.issueIds.filter((id) => id !== issueId),
              updatedAt: new Date(),
            }
          : sprint
      ),
    })),

  canStartSprint: (projectId) => {
    const activeSprint = get().getActiveSprint(projectId);
    return !activeSprint;
  },
}));