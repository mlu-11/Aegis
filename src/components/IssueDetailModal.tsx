import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Close,
  BugReport,
  Task as TaskIcon,
  Person,
  Schedule,
  CalendarToday,
  Assignment,
  AccountTree,
  Visibility,
  OpenInNew,
} from '@mui/icons-material';
import { useUserStore } from '../stores/userStore';
import { useSprintStore } from '../stores/sprintStore';
import { useBPMNStore } from '../stores/bpmnStore';
import type { Issue } from '../types';

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  onEdit: (issue: Issue) => void;
  onDelete: (issue: Issue) => void;
  onStatusChange: (issueId: string, newStatus: string) => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  open,
  onClose,
  issue,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { getUserById } = useUserStore();
  const { getSprintById } = useSprintStore();
  const { diagrams } = useBPMNStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!issue) return null;

  const assignee = issue.assigneeId ? getUserById(issue.assigneeId) : null;
  const reporter = getUserById(issue.reporterId);
  const sprint = issue.sprintId ? getSprintById(issue.sprintId) : null;

  const linkedBPMNElements = issue.linkedBPMNElements || [];
  const linkedDiagrams = linkedBPMNElements.reduce((acc, element) => {
    const diagram = diagrams.find(d => d.id === element.diagramId);
    if (diagram && !acc.some(d => d.id === diagram.id)) {
      acc.push(diagram);
    }
    return acc;
  }, [] as typeof diagrams);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(issue);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(issue);
    handleMenuClose();
  };

  const getTypeIcon = () => {
    switch (issue.type) {
      case 'BUG':
        return <BugReport fontSize="small" color="error" />;
      case 'USER_STORY':
        return <Person fontSize="small" color="primary" />;
      case 'TASK':
      default:
        return <TaskIcon fontSize="small" color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_DO':
        return 'default';
      case 'IN_PROGRESS':
        return 'primary';
      case 'DONE':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(issue.id, newStatus);
  };

  const handleViewBPMNDiagram = (diagramId: string) => {
    navigate(`/project/${issue.projectId}/bpmn/${diagramId}/view`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-start justify-between">
          <Box className="flex items-center gap-2 flex-1">
            {getTypeIcon()}
            <Typography variant="h6" component="div" className="flex-1">
              {issue.title}
            </Typography>
          </Box>
          <Box className="flex items-center gap-1">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box className="space-y-6">
          <Box className="flex items-center gap-4 flex-wrap">
            <Box className="flex items-center gap-2">
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={issue.status.replace('_', ' ')}
                color={getStatusColor(issue.status) as any}
                size="small"
                onClick={() => {
                  const statuses = ['TO_DO', 'IN_PROGRESS', 'DONE'];
                  const currentIndex = statuses.indexOf(issue.status);
                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                  handleStatusChange(nextStatus);
                }}
                className="cursor-pointer"
              />
            </Box>

            <Box className="flex items-center gap-2">
              <Typography variant="body2" color="text.secondary">
                Priority:
              </Typography>
              <Chip
                label={issue.priority}
                color={getPriorityColor(issue.priority) as any}
                size="small"
                variant="outlined"
              />
            </Box>

            <Box className="flex items-center gap-2">
              <Typography variant="body2" color="text.secondary">
                Type:
              </Typography>
              <Chip
                label={issue.type.replace('_', ' ')}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" className="mb-2">
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" className="whitespace-pre-wrap">
              {issue.description || 'No description provided.'}
            </Typography>
          </Box>

          <Divider />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box>
              <Typography variant="subtitle2" className="mb-2">
                Assignment Details
              </Typography>
              <Box className="space-y-3">
                <Box className="flex items-center gap-2">
                  <Assignment fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Assignee:
                  </Typography>
                  {assignee ? (
                    <Box className="flex items-center gap-1">
                      <Avatar src={assignee.avatar} sx={{ width: 20, height: 20 }} />
                      <Typography variant="body2">{assignee.name}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </Box>

                <Box className="flex items-center gap-2">
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Reporter:
                  </Typography>
                  {reporter && (
                    <Box className="flex items-center gap-1">
                      <Avatar src={reporter.avatar} sx={{ width: 20, height: 20 }} />
                      <Typography variant="body2">{reporter.name}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" className="mb-2">
                Project Details
              </Typography>
              <Box className="space-y-3">
                {issue.estimatedHours && (
                  <Box className="flex items-center gap-2">
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Estimated:
                    </Typography>
                    <Typography variant="body2">{issue.estimatedHours}h</Typography>
                  </Box>
                )}

                {sprint && (
                  <Box className="flex items-center gap-2">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Sprint:
                    </Typography>
                    <Typography variant="body2">{sprint.name}</Typography>
                  </Box>
                )}

                <Box className="flex items-center gap-2">
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Created:
                  </Typography>
                  <Typography variant="body2">
                    {issue.createdAt.toLocaleDateString()}
                  </Typography>
                </Box>

                {issue.updatedAt.getTime() !== issue.createdAt.getTime() && (
                  <Box className="flex items-center gap-2">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Updated:
                    </Typography>
                    <Typography variant="body2">
                      {issue.updatedAt.toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Divider />

          {linkedDiagrams.length > 0 && (
            <Box>
              <Typography variant="subtitle2" className="mb-2 flex items-center gap-2">
                <AccountTree fontSize="small" />
                Related BPMN Diagrams ({linkedDiagrams.length})
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {linkedDiagrams.map((diagram) => {
                  const elementsInDiagram = linkedBPMNElements.filter(
                    (element) => element.diagramId === diagram.id
                  );
                  return (
                    <Card key={diagram.id} variant="outlined" className="hover:shadow-md transition-shadow">
                      <CardContent className="pb-2">
                        <Box className="flex items-start justify-between mb-2">
                          <Typography variant="subtitle2" className="font-medium">
                            {diagram.name}
                          </Typography>
                          <Chip
                            label={`${elementsInDiagram.length} element${elementsInDiagram.length !== 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        {diagram.description && (
                          <Typography variant="body2" color="text.secondary" className="mb-2">
                            {diagram.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Elements: {elementsInDiagram.map(el => el.elementId).join(', ')}
                        </Typography>
                      </CardContent>
                      <CardActions className="pt-0">
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewBPMNDiagram(diagram.id)}
                          color="primary"
                        >
                          View Diagram
                        </Button>
                        <Button
                          size="small"
                          startIcon={<OpenInNew />}
                          onClick={() => navigate(`/project/${issue.projectId}/bpmn/${diagram.id}`)}
                          variant="outlined"
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}

          {linkedDiagrams.length > 0 && <Divider />}

          <Box>
            <Typography variant="subtitle2" className="mb-2">
              Quick Actions
            </Typography>
            <Box className="flex gap-2">
              <Button
                size="small"
                variant={issue.status === 'TO_DO' ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange('TO_DO')}
                disabled={issue.status === 'TO_DO'}
              >
                To Do
              </Button>
              <Button
                size="small"
                variant={issue.status === 'IN_PROGRESS' ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={issue.status === 'IN_PROGRESS'}
              >
                In Progress
              </Button>
              <Button
                size="small"
                variant={issue.status === 'DONE' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => handleStatusChange('DONE')}
                disabled={issue.status === 'DONE'}
              >
                Done
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={handleEdit} variant="outlined" startIcon={<Edit />}>
          Edit Issue
        </Button>
      </DialogActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Issue</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Issue</ListItemText>
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default IssueDetailModal;