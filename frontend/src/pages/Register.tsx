import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import AuthCard from '../components/AuthCard'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleToggleVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar cadastro
    console.log('Cadastro:', { fullName, email, password })
  }

  return (
      <AuthCard
        title="Crie sua conta"
        subtitle="Comece sua jornada de aprendizado hoje"
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
          <TextField
            id="fullName"
            label="Nome Completo"
            type="text"
            variant="outlined"
            fullWidth
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Fulano Júnior"
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

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
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            id="password"
            label="Senha"
            variant="outlined"
            fullWidth
            required
            autoComplete="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="No mínimo 8 caracteres"
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="alternar visibilidade da senha"
                      onClick={handleToggleVisibility}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 0.5,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cadastrar
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'text.secondary', mt: 0.5 }}
          >
            Já tem uma conta?{' '}
            <MuiLink
              component={Link}
              to="/login"
              sx={{ color: 'primary.main', fontWeight: 500, textDecoration: 'none' }}
            >
              Entrar
            </MuiLink>
          </Typography>
      </Box>
    </AuthCard>
  )
}

export default Register