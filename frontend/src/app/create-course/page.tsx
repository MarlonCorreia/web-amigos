import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  FormControlLabel,
  Checkbox,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useAuth } from '../../contexts/AuthContext'
import { createCourse, publishCourse } from '../../api/courses'

export default function CreateCoursePage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [price, setPrice] = useState('199.90')
  const [accessDurationDays, setAccessDurationDays] = useState('365')
  const [gatewayProductId, setGatewayProductId] = useState('prod_learnlab')
  const [shouldPublish, setShouldPublish] = useState(true)

  // Request status states
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Access control check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login')
      } else if (user?.role !== 'creator' && user?.role !== 'admin') {
        navigate('/courses')
      }
    }
  }, [isAuthenticated, user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    // Form validation
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Por favor, informe um preço de venda válido (maior ou igual a zero).')
      setSubmitting(false)
      return
    }

    const numDuration = parseInt(accessDurationDays, 10)
    if (isNaN(numDuration) || numDuration < 1) {
      setError('Por favor, informe uma duração de acesso válida em dias (no mínimo 1 dia).')
      setSubmitting(false)
      return
    }

    try {
      // 1. Create the course
      const newCourse = await createCourse({
        creator: user.id,
        title,
        description,
        thumbnail_url: thumbnailUrl,
        gateway_product_id: gatewayProductId,
        price: numPrice,
        access_duration_days: numDuration,
      })

      let successMessage = 'Curso criado com sucesso!'

      // 2. Publish immediately if checked
      if (shouldPublish && newCourse.id) {
        try {
          await publishCourse(newCourse.id)
          successMessage = 'Curso criado e publicado com sucesso!'
        } catch (pubErr) {
          console.error('Erro ao publicar curso criado:', pubErr)
          successMessage = 'Curso criado, mas houve uma falha ao publicá-lo automaticamente.'
        }
      }

      setSuccess(successMessage)

      // Reset form
      setTitle('')
      setDescription('')
      setThumbnailUrl('')
      setPrice('199.90')
      setAccessDurationDays('365')
      setGatewayProductId('prod_learnlab')

      // Redirect back to catalog after delay
      setTimeout(() => {
        navigate('/courses')
      }, 1500)

    } catch (err) {
      console.error('Erro ao criar curso:', err)
      setError(err instanceof Error ? err.message : 'Falha ao conectar com o servidor para criar o curso.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Double check role authorization before rendering
  if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
    return null
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit" underline="hover">
          Home
        </MuiLink>
        <MuiLink component={Link} to="/courses" color="inherit" underline="hover">
          Cursos
        </MuiLink>
        <Typography color="text.primary">Criar Curso</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/courses"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', mb: 2, color: 'text.secondary' }}
        >
          Voltar ao catálogo
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#111827' }}>
          Criar Novo Curso
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Preencha as informações gerais do curso para disponibilizá-lo para venda na plataforma.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <TextField
              label="Título do Curso"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Docker para Iniciantes"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Descrição do Curso"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os objetivos do curso, conteúdo programático, etc."
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="URL da Thumbnail (Imagem de Capa)"
              variant="outlined"
              fullWidth
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Ex: https://images.unsplash.com/photo-..."
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Preço de Venda (R$)"
                  variant="outlined"
                  fullWidth
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  slotProps={{ 
                    inputLabel: { shrink: true },
                    htmlInput: { step: '0.01', min: '0' } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Duração do Acesso (dias)"
                  variant="outlined"
                  fullWidth
                  required
                  type="number"
                  value={accessDurationDays}
                  onChange={(e) => setAccessDurationDays(e.target.value)}
                  slotProps={{ 
                    inputLabel: { shrink: true },
                    htmlInput: { min: '1' } 
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="ID de Produto no Gateway de Pagamento"
              variant="outlined"
              fullWidth
              required
              value={gatewayProductId}
              onChange={(e) => setGatewayProductId(e.target.value)}
              placeholder="Identificador no provedor de pagamento (Ex: prod_docker)"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldPublish}
                  onChange={(e) => setShouldPublish(e.target.checked)}
                  color="primary"
                />
              }
              label="Publicar curso imediatamente (torná-lo visível no catálogo de vendas)"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                component={Link}
                to="/courses"
                variant="outlined"
                disabled={submitting}
                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {submitting ? 'Cadastrando...' : 'Cadastrar Curso'}
              </Button>
            </Box>

          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
