import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import DataInitializer from './components/DataInitializer';
import ProjectList from './pages/ProjectList';
import ProjectContainer from './pages/ProjectContainer';
import ProjectDetail from './pages/ProjectDetail';
import KanbanBoard from './pages/KanbanBoard';
import Backlog from './pages/Backlog';
import SprintList from './pages/SprintList';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import BPMNList from './pages/BPMNList';
import BPMNEditor from './pages/BPMNEditor';
import BPMNViewerPage from './pages/BPMNViewer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DataInitializer />
        <Layout>
          <Routes>
            {/* ProjectList */}
            <Route path="/" element={<ProjectList />} />

            {/* ProjectContainer */}
            <Route path="/project/:projectId" element={<ProjectContainer />}>
              {/* ProjectDetail */}
              <Route index element={<ProjectDetail />} />
              
              {/* KanbanBoard */}
              <Route path="board" element={<KanbanBoard />} />

              {/* Backlog */}
              <Route path="backlog" element={<Backlog />} />

              {/* SprintList */}
              <Route path="sprints" element={<SprintList />} />

              {/* IssueList */}
              <Route path="issues" element={<IssueList />} />
              
              {/* IssueDetail */}
              <Route path="issues/:issueId" element={<IssueDetail />} />

              {/* BPMNList */}
              <Route path="bpmn" element={<BPMNList />} />
              <Route path="bpmn/:diagramId" element={<BPMNEditor />} />
              <Route path="bpmn/:diagramId/view" element={<BPMNViewerPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
