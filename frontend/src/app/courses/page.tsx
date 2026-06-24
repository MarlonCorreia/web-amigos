import { useEffect, useState } from 'react'
import { Typography, Container, Box, Grid, CircularProgress, Alert } from '@mui/material'
import { CourseCard } from '../../components/CourseCard'
import { listCourses, type CourseSimpleResponse } from '../../api/courses'

interface CourseCardData {
  id: string | number;
  title: string;
  category: string;
  price: string;
  description: string;
  rating: number;
  students: string;
  author: string;
  image: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      try {
        setError(null)
        setLoading(true)
        const data = await listCourses()
        
        // Map backend response (snake_case) to the props format expected by CourseCard
        const mappedData: CourseCardData[] = data.map((c: CourseSimpleResponse) => ({
          id: c.id,
          title: c.title,
          category: 'CURSO ONLINE',
          price: c.price > 0 ? `R$ ${c.price.toFixed(2).replace('.', ',')}` : 'Gratuito',
          description: c.description,
          rating: 4.8, // Default rating fallback
          students: `${c.access_duration_days} dias de acesso`,
          author: 'LearnLab',
          image: c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        }))
        
        setCourses(mappedData)
      } catch (err) {
        console.error('Erro ao buscar catálogo de cursos:', err)
        setError('Não foi possível carregar o catálogo de cursos. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
          Catálogo de Cursos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Descubra nossos cursos online e impulsione sua carreira de tecnologia hoje mesmo.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Nenhum curso disponível no momento. Volte em breve!
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
