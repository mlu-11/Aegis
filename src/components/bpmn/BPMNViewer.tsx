import React, { useRef, useEffect, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '../../styles/bpmn.css';
import { Box, Alert } from '@mui/material';
import { useIssueStore } from '../../stores/issueStore';
import type { BPMNElementStatus } from '../../types';

interface BPMNViewerProps {
  xml: string;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
  elementStatuses?: BPMNElementStatus[];
  className?: string;
  diagramId?: string;
}

const BPMNViewer: React.FC<BPMNViewerProps> = ({
  xml,
  onElementClick,
  elementStatuses = [],
  className = '',
  diagramId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnViewer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { issues } = useIssueStore();

  console.log('elementStatuses prop (deprecated):', elementStatuses);

  useEffect(() => {
    if (containerRef.current && xml) {
      if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
        containerRef.current.style.width = '100%';
        containerRef.current.style.height = '500px';
      }

      viewerRef.current = new BpmnViewer({
        container: containerRef.current,
      });

      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current
            .importXML(xml)
            .then((result: any) => {
              if (result.warnings && result.warnings.length > 0) {
                console.warn('BPMN import warnings:', result.warnings);
              }
              setError(null);
              setupEventListeners();
              
              setTimeout(() => {
                applyElementStyles();
              }, 100);
            })
            .catch((err: any) => {
              console.error('Error importing BPMN XML:', err);
              setError(`Failed to load BPMN diagram: ${err.message || 'Unknown error'}`);
            });
        }
      }, 100);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [xml]);

  useEffect(() => {
    applyElementStyles();
  }, [issues]);

  const setupEventListeners = () => {
    if (!viewerRef.current) return;

    const eventBus = viewerRef.current.get('eventBus') as any;

    eventBus.on('element.click', 1500, (event: any) => {
      const { element } = event;
      
      const clickableTypes = [
        'bpmn:Task',
        'bpmn:UserTask', 
        'bpmn:ServiceTask',
        'bpmn:ManualTask',
        'bpmn:BusinessRuleTask',
        'bpmn:ScriptTask',
        'bpmn:SendTask',
        'bpmn:ReceiveTask'
      ];
      
      if (element.businessObject && element.businessObject.id) {
        const elementType = element.type;
        const isClickableElement = clickableTypes.some(type => elementType.includes(type));
        
        if (isClickableElement) {
          event.preventDefault();
          event.stopPropagation();
          
          const elementId = element.businessObject.id;
          const elementName = element.businessObject.name || elementId;
          
          if (onElementClick) {
            onElementClick(elementId, elementType, elementName);
          }
        }
      }
    });
  };

  const applyElementStyles = () => {
    console.log('Applying styles to elements:');
    if (!viewerRef.current) return;

    try {
      const elementRegistry = viewerRef.current.get('elementRegistry') as any;
      const modeling = viewerRef.current.get('modeling') as any;

      if (!elementRegistry || !modeling) {
        console.warn('BPMN services not available yet');
        return;
      }

      const allElements = elementRegistry.getAll();
      
      allElements.forEach((element: any) => {
        if (element.businessObject && element.businessObject.id) {
          const elementId = element.businessObject.id;
          
          const linkedIssues = issues.filter(issue => 
            issue.linkedBPMNElements?.some(element => 
              element.elementId === elementId && 
              (!diagramId || element.diagramId === diagramId)
            )
          );
          
          if (linkedIssues.length > 0) {
            const completedIssues = linkedIssues.filter(issue => issue.status === 'DONE');
            const inProgressIssues = linkedIssues.filter(issue => issue.status === 'IN_PROGRESS');
            
            let colors;
            if (completedIssues.length === linkedIssues.length) {
              colors = { stroke: '#4caf50', fill: '#e8f5e9' };
            } else if (inProgressIssues.length > 0) {
              colors = { stroke: '#ff9800', fill: '#fff8e1' };
            } else {
              colors = { stroke: '#9e9e9e', fill: '#f5f5f5' };
            }
            
            try {
              modeling.setColor(element, colors);
            } catch (err) {
              console.warn(`Failed to apply style to element ${elementId}:`, err);
            }
          }
        }
      });
    } catch (err) {
      console.warn('Failed to apply element styles:', err);
    }
  };

  if (error) {
    return (
      <Box className={`w-full h-full flex items-center justify-center ${className}`}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className={`w-full h-full ${className}`} style={{ minHeight: '500px' }}>
      <div
        ref={containerRef}
        className="bpmn-container w-full h-full"
        style={{ 
          minHeight: '500px',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
    </Box>
  );
};

export default BPMNViewer;
