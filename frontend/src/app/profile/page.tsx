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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Chip,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  DeleteForever as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, deleteMe } from '../../api/users';

export default function ProfilePage() {
  const { isAuthenticated, user, loading: authLoading, logout, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user) {
        setFullName(user.full_name);
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password.length < 6) {
      setError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    try {
      setSubmitting(true);
      const data: { full_name: string; password?: string } = {
        full_name: fullName,
      };
      if (password) {
        data.password = password;
      }

      await updateProfile(data);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Update local context
      if (user) {
        updateLocalUser({
          ...user,
          full_name: fullName,
        });
      }
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Falha ao atualizar perfil. Verifique os dados inseridos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);
      await deleteMe();
      setDeleteDialogOpen(false);
      logout();
      navigate('/');
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      setError(err.message || 'Falha ao excluir conta. Se você for um criador, certifique-se de não possuir cursos ativos.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Get Role Badge Details
  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', color: 'error' as const };
      case 'creator':
        return { label: 'Criador de Conteúdo', color: 'warning' as const };
      default:
        return { label: 'Estudante', color: 'success' as const };
    }
  };

  const roleDetails = getRoleDetails(user.role);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Voltar ao Início
        </Button>
      </Box>

      {/* Header Info Card */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              <PersonIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: '700', mb: 0.5, color: '#1a202c' }}>
                {fullName || user.full_name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                {user.email}
              </Typography>
              <Chip label={roleDetails.label} color={roleDetails.color} sx={{ fontWeight: '600' }} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Error/Success Feedbacks */}
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

      {/* Main Settings Card */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: '700', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" /> Configurações de Perfil
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mt: 1, color: 'text.secondary' }}>
                  Alterar Senha (deixe em branco para não alterar)
                </Typography>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  placeholder="Mínimo 6 caracteres"
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  placeholder="Confirme a nova senha"
                />
              </Grid>

              <Grid xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.2,
                    fontWeight: '600',
                  }}
                >
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(211, 47, 47, 0.2)',
          backgroundColor: 'rgba(211, 47, 47, 0.01)',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: '700', color: 'error.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" /> Zona de Perigo
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            A exclusão da sua conta é permanente e removerá todas as suas matrículas, reviews, histórico de cursos e dados pessoais do nosso sistema de forma irreversível.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
              },
            }}
          >
            Excluir Minha Conta
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-profile-dialog-title"
        aria-describedby="delete-profile-dialog-description"
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle id="delete-profile-dialog-title" sx={{ fontWeight: '700' }}>
          Excluir Sua Conta Permanentemente?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-profile-dialog-description">
            Você tem certeza absoluta que deseja excluir a sua conta? Esta ação NÃO poderá ser desfeita e você perderá acesso imediato a todos os cursos adquiridos.
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
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
