import { MenuItem, Menu, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import Person from '@mui/icons-material/Person';

interface UserMenuProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: (el: null | HTMLElement) => void;
}

function UserMenu({ anchorEl, setAnchorEl }: UserMenuProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'user-menu' : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Minha Conta" placement="bottom">
        <IconButton
          aria-label="Minha Conta"
          aria-controls={id}
          aria-haspopup="true"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          color="inherit"
          sx={{ p: 1 }}
        >
          <Person sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={id}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          component={Link}
          to="/login"
          sx={{ px: 2, py: 1.5 }}
          onClick={handleClose}
        >
          Entrar
        </MenuItem>
        <MenuItem
          component={Link}
          to="/register"
          sx={{ px: 2, py: 1.5 }}
          onClick={handleClose}
        >
          Cadastrar
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;