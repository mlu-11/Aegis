import { create } from 'zustand';
import type { Issue, IssueStatus, LinkedBPMNElement } from '../types';

interface IssueStore {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  getIssueById: (id: string) => Issue | undefined;
  getIssuesByProject: (projectId: string) => Issue[];
  getIssuesBySprint: (sprintId: string) => Issue[];
  getBacklogIssues: (projectId: string) => Issue[];
  updateIssueStatus: (id: string, status: IssueStatus) => void;
  assignIssueToSprint: (issueId: string, sprintId: string | undefined) => void;
  
  linkIssueToBPMN: (issueId: string, diagramId: string, elementId: string) => void;
  unlinkIssueFromBPMN: (issueId: string, diagramId: string, elementId: string) => void;
  getIssuesByBPMNElement: (elementId: string) => Issue[];
  getIssuesByBPMNDiagram: (diagramId: string) => Issue[];
  getBPMNElementsByIssue: (issueId: string) => LinkedBPMNElement[];
}

export const useIssueStore = create<IssueStore>((set, get) => ({
  issues: [],

  addIssue: (issueData) =>
    set((state) => ({
      issues: [
        ...state.issues,
        {
          ...issueData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? { ...issue, ...updates, updatedAt: new Date() }
          : issue
      ),
    })),

  deleteIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== id),
    })),

  getIssueById: (id) => {
    return get().issues.find((issue) => issue.id === id);
  },

  getIssuesByProject: (projectId) => {
    return get().issues.filter((issue) => issue.projectId === projectId);
  },

  getIssuesBySprint: (sprintId) => {
    return get().issues.filter((issue) => issue.sprintId === sprintId);
  },

  getBacklogIssues: (projectId) => {
    return get().issues.filter(
      (issue) => issue.projectId === projectId && !issue.sprintId
    );
  },

  updateIssueStatus: (id, status) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? { ...issue, status, updatedAt: new Date() }
          : issue
      ),
    })),

  assignIssueToSprint: (issueId, sprintId) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === issueId
          ? { ...issue, sprintId, updatedAt: new Date() }
          : issue
      ),
    })),

  linkIssueToBPMN: (issueId, diagramId, elementId) =>
    set((state) => ({
      issues: state.issues.map((issue) => {
        if (issue.id === issueId) {
          const linkedElements = issue.linkedBPMNElements || [];
          const newElement = { diagramId, elementId };
          const exists = linkedElements.some(
            (element) => element.diagramId === diagramId && element.elementId === elementId
          );
          if (!exists) {
            return {
              ...issue,
              linkedBPMNElements: [...linkedElements, newElement],
              updatedAt: new Date(),
            };
          }
        }
        return issue;
      }),
    })),

  unlinkIssueFromBPMN: (issueId, diagramId, elementId) =>
    set((state) => ({
      issues: state.issues.map((issue) => {
        if (issue.id === issueId) {
          const linkedElements = issue.linkedBPMNElements || [];
          return {
            ...issue,
            linkedBPMNElements: linkedElements.filter(
              (element) => !(element.diagramId === diagramId && element.elementId === elementId)
            ),
            updatedAt: new Date(),
          };
        }
        return issue;
      }),
    })),

  getIssuesByBPMNElement: (elementId) => {
    return get().issues.filter((issue) =>
      issue.linkedBPMNElements?.some((element) => element.elementId === elementId)
    );
  },

  getIssuesByBPMNDiagram: (diagramId) => {
    return get().issues.filter((issue) =>
      issue.linkedBPMNElements?.some((element) => element.diagramId === diagramId)
    );
  },

  getBPMNElementsByIssue: (issueId) => {
    const issue = get().issues.find((issue) => issue.id === issueId);
    return issue?.linkedBPMNElements || [];
  },
}));