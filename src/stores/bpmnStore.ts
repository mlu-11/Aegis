import { create } from 'zustand';
import type { BPMNDiagram, BPMNElement, BPMNElementStatus, Issue } from '../types';
import { calculateElementStatus } from '../utils/bpmnUtils';

interface BPMNStore {
  diagrams: BPMNDiagram[];
  elements: BPMNElement[];
  elementStatuses: BPMNElementStatus[];
  
  addDiagram: (diagram: Omit<BPMNDiagram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDiagram: (id: string, updates: Partial<BPMNDiagram>) => void;
  deleteDiagram: (id: string) => void;
  getDiagramsByProject: (projectId: string) => BPMNDiagram[];
  
  addElement: (element: Omit<BPMNElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<BPMNElement>) => void;
  deleteElement: (id: string) => void;
  getElementsByDiagram: (diagramId: string) => BPMNElement[];
  
  linkIssueToElement: (elementId: string, issueId: string) => void;
  unlinkIssueFromElement: (elementId: string, issueId: string) => void;
  updateElementStatus: (elementId: string, status: Omit<BPMNElementStatus, 'elementId'>) => void;
  getElementStatus: (elementId: string) => BPMNElementStatus | undefined;
  
  getElementsWithLinkedIssues: (diagramId: string) => BPMNElement[];
  updateElementStatusesFromIssues: (issues: Issue[]) => void;
}

export const useBPMNStore = create<BPMNStore>((set, get) => ({
  diagrams: [],
  elements: [],
  elementStatuses: [],
  
  addDiagram: (diagram) => {
    const newDiagram: BPMNDiagram = {
      ...diagram,
      id: `diagram-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      diagrams: [...state.diagrams, newDiagram],
    }));
  },
  
  updateDiagram: (id, updates) => {
    set((state) => ({
      diagrams: state.diagrams.map((diagram) =>
        diagram.id === id
          ? { ...diagram, ...updates, updatedAt: new Date() }
          : diagram
      ),
    }));
  },
  
  deleteDiagram: (id) => {
    set((state) => ({
      diagrams: state.diagrams.filter((diagram) => diagram.id !== id),
      elements: state.elements.filter((element) => element.diagramId !== id),
      elementStatuses: state.elementStatuses.filter((status) => {
        const element = state.elements.find((el) => el.elementId === status.elementId);
        return element?.diagramId !== id;
      }),
    }));
  },
  
  getDiagramsByProject: (projectId) => {
    return get().diagrams.filter((diagram) => diagram.projectId === projectId);
  },
  
  addElement: (element) => {
    const newElement: BPMNElement = {
      ...element,
      id: `element-${Date.now()}`,
    };
    set((state) => ({
      elements: [...state.elements, newElement],
    }));
  },
  
  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      ),
    }));
  },
  
  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((element) => element.id !== id),
      elementStatuses: state.elementStatuses.filter((status) => {
        const element = state.elements.find((el) => el.id === id);
        return element?.elementId !== status.elementId;
      }),
    }));
  },
  
  getElementsByDiagram: (diagramId) => {
    return get().elements.filter((element) => element.diagramId === diagramId);
  },
  
  linkIssueToElement: (elementId, issueId) => {
    set((state) => {
      return {
        elements: state.elements.map((element) =>
          element.elementId === elementId
            ? {
                ...element,
                linkedIssueIds: [...element.linkedIssueIds, issueId],
              }
            : element
        ),
      }
    });
  },
  
  unlinkIssueFromElement: (elementId, issueId) => {
    set((state) => {
      return {
        elements: state.elements.map((element) =>
          element.elementId === elementId
            ? {
                ...element,
                linkedIssueIds: element.linkedIssueIds.filter((id) => id !== issueId),
              }
            : element
        ),
      }
    });
  },
  
  updateElementStatus: (elementId, status) => {
    const newStatus: BPMNElementStatus = {
      ...status,
      elementId,
    };
    
    set((state) => {
      const existingIndex = state.elementStatuses.findIndex(
        (s) => s.elementId === elementId
      );
      
      if (existingIndex >= 0) {
        const updatedStatuses = [...state.elementStatuses];
        updatedStatuses[existingIndex] = newStatus;
        return { elementStatuses: updatedStatuses };
      } else {
        return { elementStatuses: [...state.elementStatuses, newStatus] };
      }
    });
  },
  
  getElementStatus: (elementId) => {
    return get().elementStatuses.find((status) => status.elementId === elementId);
  },
  
  getElementsWithLinkedIssues: (diagramId) => {
    return get().elements.filter((element) => 
      element.diagramId === diagramId && element.linkedIssueIds.length > 0
    );
  },
  
  updateElementStatusesFromIssues: (issues) => {
    const { elements } = get();
    const updatedStatuses: BPMNElementStatus[] = [];
    
    elements.forEach((element) => {
      if (element.linkedIssueIds.length > 0) {
        const linkedIssues = issues.filter((issue) => 
          element.linkedIssueIds.includes(issue.id)
        );
        
        if (linkedIssues.length > 0) {
          const status = calculateElementStatus(element.elementId, linkedIssues);
          updatedStatuses.push(status);
        }
      }
    });
    
    set((state) => {
      const newStatuses = [...state.elementStatuses];
      
      updatedStatuses.forEach((newStatus) => {
        const existingIndex = newStatuses.findIndex(
          (s) => s.elementId === newStatus.elementId
        );
        
        if (existingIndex >= 0) {
          newStatuses[existingIndex] = newStatus;
        } else {
          newStatuses.push(newStatus);
        }
      });
      
      return { elementStatuses: newStatuses };
    });
  },
}));
