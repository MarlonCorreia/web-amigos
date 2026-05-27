import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import UserMenu from './UserMenu';
import LogoIcon from './icons/LogoIcon';

function Navbar() {
  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main', boxShadow: 0, borderRadius: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
          <LogoIcon sx={{ fontSize: 36 }} />
          <Typography sx={{ fontWeight: 600, color: 'white', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
            LearnLab
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/courses" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Cursos
          </Button>
          <UserMenu />
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
