import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Add, DirectionsRun, List } from '@mui/icons-material';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useIssueStore } from '../stores/issueStore';
import { useProjectStore } from '../stores/projectStore';
import { useSprintStore } from '../stores/sprintStore';
import { useUserStore } from '../stores/userStore';
import type { IssueStatus, Issue } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import IssueForm from '../components/IssueForm';
import IssueDetailModal from '../components/IssueDetailModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { updateIssueStatus, addIssue, updateIssue, deleteIssue, getIssuesBySprint, getIssuesByProject } = useIssueStore();
  const { currentProject } = useProjectStore();
  const { getActiveSprint } = useSprintStore();

  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  if (!currentProject) {
    return (
      <Box className="py-8">
        <Typography variant="h6">Project not found</Typography>
      </Box>
    );
  }

  const activeSprint = getActiveSprint(currentProject.id);
  
  const sprintIssues = activeSprint 
    ? getIssuesBySprint(activeSprint.id) 
    : getIssuesByProject(currentProject.id).filter(issue => !issue.sprintId);
  
  const todoIssues = sprintIssues.filter(issue => issue.status === 'TO_DO');
  const inProgressIssues = sprintIssues.filter(issue => issue.status === 'IN_PROGRESS');
  const doneIssues = sprintIssues.filter(issue => issue.status === 'DONE');

  const handleCreateIssue = () => {
    setEditingIssue(null);
    setIsIssueFormOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;
    
    updateIssueStatus(issueId, newStatus);
    showSnackbar('Issue status updated!', 'success');
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsIssueFormOpen(true);
  };

  const handleViewIssue = (issue: Issue) => {
    setViewingIssue(issue);
  };

  const handleDeleteIssue = (issue: Issue) => {
    setDeletingIssue(issue);
  };

  const handleIssueFormSubmit = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingIssue) {
        updateIssue(editingIssue.id, issueData);
        showSnackbar('Issue updated successfully!', 'success');
        setIsIssueFormOpen(false);
      } else {
        const issueDataWithSprint = {
          ...issueData,
          sprintId: activeSprint?.id || issueData.sprintId
        };
        addIssue(issueDataWithSprint);
        showSnackbar('Issue created successfully!', 'success');
        setIsIssueFormOpen(false);
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again.', 'error');
    }
  };

  const confirmDeleteIssue = () => {
    if (deletingIssue) {
      try {
        deleteIssue(deletingIssue.id);
        showSnackbar('Issue deleted successfully!', 'success');
      } catch (error) {
        showSnackbar('An error occurred while deleting the issue.', 'error');
      }
    }
  };

  const handleIssueStatusChange = (issueId: string, newStatus: string) => {
    updateIssueStatus(issueId, newStatus as IssueStatus);
    showSnackbar('Issue status updated!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box className="flex justify-end gap-2 mb-6">
        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          onClick={handleCreateIssue}
        >
          Create Issue
        </Button>
      </Box>

      {activeSprint ? (
        <Paper className="p-4 mb-6 bg-blue-50">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-3">
              <DirectionsRun color="primary" />
              <Box>
                <Typography variant="h6" className="mb-1">
                  {activeSprint.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSprint.startDate.toLocaleDateString()} - {activeSprint.endDate.toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box className="flex items-center gap-4">
              <Box className="text-center">
                <Typography variant="h6" color="primary">
                  {sprintIssues.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Issues
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={sprintIssues.length > 0 ? (doneIssues.length / sprintIssues.length) * 100 : 0}
                sx={{ width: 100, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper className="p-4 mb-6 bg-gray-50">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-3">
              <DirectionsRun color="disabled" />
              <Box>
                <Typography variant="h6" className="mb-1">
                  No Active Sprint
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a sprint to work on time-boxed iterations.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<DirectionsRun />}
              onClick={() => navigate(`/project/${projectId}/sprints`)}
            >
              Start Sprint
            </Button>
          </Box>
        </Paper>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <KanbanColumn
            title="To Do"
            status="TO_DO"
            issues={todoIssues}
            count={todoIssues.length}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            onViewIssue={handleViewIssue}
          />
          <KanbanColumn
            title="In Progress"
            status="IN_PROGRESS"
            issues={inProgressIssues}
            count={inProgressIssues.length}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            onViewIssue={handleViewIssue}
          />
          <KanbanColumn
            title="Done"
            status="DONE"
            issues={doneIssues}
            count={doneIssues.length}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            onViewIssue={handleViewIssue}
          />
        </Box>
      </DndContext>

      <IssueForm
        open={isIssueFormOpen}
        onClose={() => setIsIssueFormOpen(false)}
        onSubmit={handleIssueFormSubmit}
        initialData={editingIssue}
        mode={editingIssue ? 'edit' : 'create'}
        projectId={projectId || ''}
      />

      <IssueDetailModal
        open={Boolean(viewingIssue)}
        onClose={() => setViewingIssue(null)}
        issue={viewingIssue}
        onEdit={handleEditIssue}
        onDelete={handleDeleteIssue}
        onStatusChange={handleIssueStatusChange}
      />

      <DeleteConfirmDialog
        open={Boolean(deletingIssue)}
        onClose={() => setDeletingIssue(null)}
        onConfirm={confirmDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to delete "${deletingIssue?.title}"?`}
        warningMessage="This action cannot be undone."
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoard;
