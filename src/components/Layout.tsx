import React from 'react';
import { Link } from 'react-router';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { Home } from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Aegis Project Management
            </Link>
          </Typography>

          <Button
            component={Link}
            to="/"
            startIcon={<Home />}
            color="inherit"
          >
            Projects
          </Button>
        </Toolbar>
      </AppBar>

      <main>
        {children}
      </main>
    </Box>
  );
};

export default Layout;