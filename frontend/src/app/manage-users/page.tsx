import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Chip,
  Tooltip,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  School as StudentIcon,
  Create as CreatorIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { listUsers, updateUserRole, deleteUser } from '../../api/users';
import type { UserResponse } from '../../types/user';

export default function ManageUsersPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/courses');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      setError('Falha ao carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'creator' | 'student') => {
    try {
      setError(null);
      setSuccess(null);
      await updateUserRole(userId, newRole);
      setSuccess('Papel do usuário atualizado com sucesso.');
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      console.error('Erro ao atualizar papel:', err);
      setError(err.message || 'Falha ao atualizar papel do usuário.');
    }
  };

  const handleDeleteClick = (targetUser: UserResponse) => {
    setUserToDelete(targetUser);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      await deleteUser(userToDelete.id);
      setSuccess(`Usuário ${userToDelete.full_name} excluído com sucesso.`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(err.message || 'Falha ao excluir usuário. Verifique se ele possui cursos ativos.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const creatorCount = users.filter((u) => u.role === 'creator').length;
  const studentCount = users.filter((u) => u.role === 'student').length;

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Voltar ao Início
        </Button>
        <Typography variant="h4" sx={{ fontWeight: '700' }}>
          Gerenciamento de Usuários
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Usuários
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: '700' }}>
                  {totalUsers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: 'error.light',
                  color: 'error.main',
                  display: 'flex',
                }}
              >
                <AdminIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Administradores
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: '700', color: 'error.main' }}>
                  {adminCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: 'warning.light',
                  color: 'warning.main',
                  display: 'flex',
                }}
              >
                <CreatorIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Criadores (Creators)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: '700', color: 'warning.main' }}>
                  {creatorCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: 'success.light',
                  color: 'success.main',
                  display: 'flex',
                }}
              >
                <StudentIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estudantes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: '700', color: 'success.main' }}>
                  {studentCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search and Table Area */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
          <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar usuário por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }} aria-label="user list table">
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '600' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: '600' }}>E-mail</TableCell>
                <TableCell sx={{ fontWeight: '600' }}>Papel (Role)</TableCell>
                <TableCell sx={{ fontWeight: '600' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Nenhum usuário encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === user?.id;

                  return (
                    <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: '500' }}>
                            {u.full_name}
                          </Typography>
                          {isSelf && (
                            <Chip
                              label="Você"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                e.target.value as 'admin' | 'creator' | 'student'
                              )
                            }
                            sx={{
                              borderRadius: '8px',
                              '& .MuiSelect-select': {
                                py: 1,
                              },
                            }}
                          >
                            <MenuItem value="student">
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                <StudentIcon fontSize="small" color="action" />
                                Estudante
                              </Stack>
                            </MenuItem>
                            <MenuItem value="creator">
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                <CreatorIcon fontSize="small" color="action" />
                                Creator
                              </Stack>
                            </MenuItem>
                            <MenuItem value="admin">
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                <AdminIcon fontSize="small" color="action" />
                                Admin
                              </Stack>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={isSelf ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                          placement="top"
                        >
                          <span>
                            <IconButton
                              color="error"
                              disabled={isSelf}
                              onClick={() => handleDeleteClick(u)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: '700' }}>
          Excluir Usuário?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Você tem certeza que deseja excluir permanentemente o usuário{' '}
            <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email})?
            <br />
            Esta ação excluirá todos os seus dados de progresso, reviews e inscrições e não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            disabled={deleting}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Excluir Usuário
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
