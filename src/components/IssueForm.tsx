import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { useUserStore } from '../stores/userStore';
import { useSprintStore } from '../stores/sprintStore';
import type { Issue, IssueType, IssueStatus, Priority } from '../types';

interface IssueFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Issue | null;
  mode: 'create' | 'edit';
  projectId: string;
}

const IssueForm: React.FC<IssueFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  projectId,
}) => {
  const { users, currentUser } = useUserStore();
  const { getSprintsByProject } = useSprintStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK' as IssueType,
    status: 'TO_DO' as IssueStatus,
    priority: 'MEDIUM' as Priority,
    assigneeId: '',
    reporterId: currentUser?.id || '',
    projectId: projectId,
    sprintId: '',
    estimatedHours: 0,
  });

  const projectSprints = getSprintsByProject(projectId);
  const availableSprints = projectSprints.filter(sprint => sprint.status !== 'COMPLETED');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        type: initialData.type,
        status: initialData.status,
        priority: initialData.priority,
        assigneeId: initialData.assigneeId || '',
        reporterId: initialData.reporterId,
        projectId: initialData.projectId,
        sprintId: initialData.sprintId || '',
        estimatedHours: initialData.estimatedHours || 0,
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        type: 'TASK',
        status: 'TO_DO',
        priority: 'MEDIUM',
        assigneeId: '',
        reporterId: currentUser?.id || '',
        projectId: projectId,
        sprintId: '',
        estimatedHours: 0,
      });
    }
  }, [initialData, mode, projectId, currentUser, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.reporterId) {
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId || undefined,
      reporterId: formData.reporterId,
      projectId: formData.projectId,
      sprintId: formData.sprintId || undefined,
      estimatedHours: formData.estimatedHours || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'TASK',
      status: 'TO_DO',
      priority: 'MEDIUM',
      assigneeId: '',
      reporterId: currentUser?.id || '',
      projectId: projectId,
      sprintId: '',
      estimatedHours: 0,
    });
    onClose();
  };

  const getIssueTypeColor = (type: IssueType) => {
    switch (type) {
      case 'BUG':
        return 'error';
      case 'USER_STORY':
        return 'primary';
      case 'TASK':
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
      default:
        return 'default';
    }
  };

  const assignee = formData.assigneeId ? users.find(u => u.id === formData.assigneeId) : null;
  const reporter = users.find(u => u.id === formData.reporterId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New Issue' : 'Edit Issue'}
        </DialogTitle>

        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Issue Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              variant="outlined"
            />

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth required>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IssueType })}
                  label="Issue Type"
                  renderValue={(value) => (
                    <Box className="flex items-center gap-2">
                      <Chip
                        label={value.replace('_', ' ')}
                        size="small"
                        color={getIssueTypeColor(value) as any}
                        variant="outlined"
                      />
                    </Box>
                  )}
                >
                  <MenuItem value="TASK">
                    <Chip label="Task" size="small" color="default" variant="outlined" />
                  </MenuItem>
                  <MenuItem value="BUG">
                    <Chip label="Bug" size="small" color="error" variant="outlined" />
                  </MenuItem>
                  <MenuItem value="USER_STORY">
                    <Chip label="User Story" size="small" color="primary" variant="outlined" />
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  label="Priority"
                  renderValue={(value) => (
                    <Box className="flex items-center gap-2">
                      <Chip
                        label={value}
                        size="small"
                        color={getPriorityColor(value) as any}
                        variant="outlined"
                      />
                    </Box>
                  )}
                >
                  <MenuItem value="LOW">
                    <Chip label="Low" size="small" color="default" variant="outlined" />
                  </MenuItem>
                  <MenuItem value="MEDIUM">
                    <Chip label="Medium" size="small" color="info" variant="outlined" />
                  </MenuItem>
                  <MenuItem value="HIGH">
                    <Chip label="High" size="small" color="warning" variant="outlined" />
                  </MenuItem>
                  <MenuItem value="URGENT">
                    <Chip label="Urgent" size="small" color="error" variant="outlined" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                  label="Status"
                >
                  <MenuItem value="TO_DO">To Do</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="DONE">Done</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.5 }}
                variant="outlined"
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  label="Assignee"
                  renderValue={(value) => {
                    if (!value) return <em>Unassigned</em>;
                    const user = users.find(u => u.id === value);
                    return user ? (
                      <Box className="flex items-center gap-2">
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        {user.name}
                      </Box>
                    ) : value;
                  }}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box className="flex items-center gap-2">
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        {user.name} ({user.email})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Reporter</InputLabel>
                <Select
                  value={formData.reporterId}
                  onChange={(e) => setFormData({ ...formData, reporterId: e.target.value })}
                  label="Reporter"
                  renderValue={(value) => {
                    const user = users.find(u => u.id === value);
                    return user ? (
                      <Box className="flex items-center gap-2">
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        {user.name}
                      </Box>
                    ) : value;
                  }}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box className="flex items-center gap-2">
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
                        {user.name} ({user.email})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {availableSprints.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Sprint</InputLabel>
                <Select
                  value={formData.sprintId}
                  onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
                  label="Sprint"
                >
                  <MenuItem value="">
                    <em>Backlog (No Sprint)</em>
                  </MenuItem>
                  {availableSprints.map((sprint) => (
                    <MenuItem key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box className="flex items-center gap-4 pt-2">
              {assignee && (
                <Box className="flex items-center gap-2">
                  <Typography variant="caption" color="text.secondary">
                    Assignee:
                  </Typography>
                  <Box className="flex items-center gap-1">
                    <Avatar src={assignee.avatar} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2">{assignee.name}</Typography>
                  </Box>
                </Box>
              )}

              {reporter && (
                <Box className="flex items-center gap-2">
                  <Typography variant="caption" color="text.secondary">
                    Reporter:
                  </Typography>
                  <Box className="flex items-center gap-1">
                    <Avatar src={reporter.avatar} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2">{reporter.name}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.title.trim() || !formData.reporterId}
          >
            {mode === 'create' ? 'Create Issue' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IssueForm;