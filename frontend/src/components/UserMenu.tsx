import { useState } from 'react';
import { MenuItem, Menu, IconButton, Tooltip, Divider, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Person from '@mui/icons-material/Person';
import { useAuth } from '../hooks/useAuth';

function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const close = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

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
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {isAuthenticated ? (
          [
            <Typography key="name" variant="body2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
              {user?.full_name ?? user?.email}
            </Typography>,
            <Divider key="divider" />,
            <MenuItem key="my-courses" component={Link} to="/my-courses" onClick={close}>
              Meus Cursos
            </MenuItem>,
            <MenuItem key="profile" component={Link} to="/profile" onClick={close}>
              Meu Perfil
            </MenuItem>,
            (user?.role === 'creator' || user?.role === 'admin') && (
              <MenuItem key="manage-courses" component={Link} to="/manage-courses" onClick={close}>
                Gerenciar Cursos
              </MenuItem>
            ),
            user?.role === 'admin' && (
              <MenuItem key="manage-users" component={Link} to="/manage-users" onClick={close}>
                Gerenciar Usuários
              </MenuItem>
            ),
            <MenuItem key="logout" onClick={handleLogout}>
              Sair
            </MenuItem>,
          ].filter(Boolean)
        ) : (
          [
            <MenuItem key="login" component={Link} to="/login" onClick={close}>
              Entrar
            </MenuItem>,
            <MenuItem key="register" component={Link} to="/register" onClick={close}>
              Cadastrar
            </MenuItem>,
          ]
        )}
      </Menu>
    </>
  );
}

export default UserMenu;
