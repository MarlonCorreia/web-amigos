import { useState } from 'react';
import { MenuItem, Menu, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import Person from '@mui/icons-material/Person';

function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Minha Conta" placement="bottom">
        <IconButton
          aria-label="Minha Conta"
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="true"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          color="inherit"
        >
          <Person sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem component={Link} to="/login" onClick={() => setAnchorEl(null)}>
          Entrar
        </MenuItem>
        <MenuItem component={Link} to="/register" onClick={() => setAnchorEl(null)}>
          Cadastrar
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;
