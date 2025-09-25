import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useProjectStore } from '../stores/projectStore';
import { useIssueStore } from '../stores/issueStore';
import { useSprintStore } from '../stores/sprintStore';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import type { Project } from '../types';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const { issues, deleteIssue } = useIssueStore();
  const { sprints, deleteSprint } = useSprintStore();

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Seeding moved to global DataInitializer to avoid duplicate/racy initialization

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}/board`);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsProjectFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
  };

  const handleProjectFormSubmit = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const memberIds = [...projectData.memberIds];
      if (!memberIds.includes(projectData.ownerId)) {
        memberIds.push(projectData.ownerId);
      }

      const finalProjectData = {
        ...projectData,
        memberIds,
      };

      if (editingProject) {
        updateProject(editingProject.id, finalProjectData);
        showSnackbar('Project updated successfully!', 'success');
      } else {
        addProject(finalProjectData);
        showSnackbar('Project created successfully!', 'success');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again.', 'error');
    }
  };

  const confirmDeleteProject = () => {
    if (deletingProject) {
      try {
        const projectId = deletingProject.id;

        const relatedIssues = issues.filter(issue => issue.projectId === projectId);
        const relatedSprints = sprints.filter(sprint => sprint.projectId === projectId);

        relatedIssues.forEach(issue => {
          deleteIssue(issue.id);
        });

        relatedSprints.forEach(sprint => {
          deleteSprint(sprint.id);
        });

        deleteProject(projectId);

        showSnackbar(
          `Project "${deletingProject.name}" and ${relatedIssues.length} issues, ${relatedSprints.length} sprints deleted successfully!`,
          'success'
        );
      } catch (error) {
        showSnackbar('An error occurred while deleting the project.', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" component="h1" fontWeight="bold">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          onClick={handleCreateProject}
        >
          Create Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box className="text-center py-16">
          <Typography variant="h6" color="text.secondary" className="mb-4">
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mb-6">
            Create your first project to get started with task management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateProject}
          >
            Create Your First Project
          </Button>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onClick={handleProjectClick}
            />
          ))}
        </Box>
      )}

      {/* 项目表单对话框 */}
      <ProjectForm
        open={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSubmit={handleProjectFormSubmit}
        initialData={editingProject}
        mode={editingProject ? 'edit' : 'create'}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"?`}
        warningMessage={
          deletingProject ?
            `This will permanently delete ${issues.filter(i => i.projectId === deletingProject.id).length} issues and ${sprints.filter(s => s.projectId === deletingProject.id).length} sprints.` :
            "All associated issues, sprints, and data will be permanently lost."
        }
      />

      {/* 成功/错误提示 */}
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
    </Container>
  );
};

export default ProjectList;