import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import UserMenu from './UserMenu';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar 
      position="static" 
      sx={{ 
        width: '100%', 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText', 
        boxShadow: 0, 
        borderRadius: 0, 
        margin: 0 
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}>
            <Typography 
              variant="h6" 
              color="text.primary"
              sx={{ fontWeight: 'bold' }} 
            >
              LOGO
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 600, color: 'white', letterSpacing: '0.5px', fontSize: '1.5rem' }}>
            LearnLab
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/courses" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Cursos
          </Button>
          
          <UserMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;