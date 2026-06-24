import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import { useAuth } from '../../contexts/AuthContext'
import { getUserEnrollments } from '../../api/users'
import type { Enrollment } from '../../types/enrollment'
import { CourseCard } from '../../components/CourseCard'

export default function MyCoursesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchEnrollments() {
      try {
        setError(null)
        setLoadingEnrollments(true)
        const data = await getUserEnrollments()
        // GORM GetActiveEnrollmentsByUser returns only active ones
        setEnrollments(data)
      } catch (err) {
        console.error('Erro ao buscar matrículas:', err)
        setError('Não foi possível carregar seus cursos. Verifique se o servidor está ativo.')
      } finally {
        setLoadingEnrollments(false)
      }
    }

    fetchEnrollments()
  }, [isAuthenticated])

  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null // O useEffect redirecionará para /login
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit" underline="hover">
          Home
        </MuiLink>
        <Typography color="text.primary">Meus Cursos</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, color: '#111827' }}>
          Meus Cursos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acesse aqui as aulas e conteúdos dos cursos que você já adquiriu.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loadingEnrollments ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : enrollments.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 8,
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: '1px dashed #e5e7eb',
          }}
        >
          <SchoolIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Você ainda não possui cursos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 450 }}>
            Explore o nosso catálogo completo de cursos online, escolha os que mais combinam com você e comece a estudar agora mesmo!
          </Typography>
          <Button
            component={Link}
            to="/courses"
            variant="contained"
            color="primary"
            sx={{ px: 4, py: 1.5, fontWeight: 'bold', textTransform: 'none' }}
          >
            Explorar Catálogo
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {enrollments.map((enrollment) => {
            const course = enrollment.Course
            // Map the backend model to CourseCard format
            const mappedCourse = {
              id: course.ID,
              title: course.Title,
              category: 'CONTEÚDO LIBERADO',
              price: 'Adquirido',
              description: course.Description,
              rating: 5.0,
              students: 'Acesso Ativo',
              author: 'LearnLab',
              image: course.ThumbnailURL || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
            }

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={enrollment.ID}>
                <CourseCard course={mappedCourse} />
              </Grid>
            )
          })}
        </Grid>
      )}
    </Container>
  )
}
