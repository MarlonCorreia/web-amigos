import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import AuthCard from '../../components/AuthCard'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      subtitle="Faça login para continuar sua jornada de aprendizado"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          width: '100%',
          maxWidth: 380,
          mx: 'auto',
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          id="email"
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          id="password"
          label="Senha"
          variant="outlined"
          fullWidth
          required
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="alternar visibilidade da senha"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mt: 0.5, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Não tem uma conta?{' '}
          <MuiLink
            component={Link}
            to="/register"
            sx={{ color: 'primary.main', fontWeight: 500, textDecoration: 'none' }}
          >
            Cadastrar
          </MuiLink>
        </Typography>
      </Box>
    </AuthCard>
  )
}
