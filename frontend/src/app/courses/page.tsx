import { Typography, Container, Box } from '@mui/material'

export default function CoursesPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Catálogo de Cursos
        </Typography>
        <Typography variant="body1">
          Lista de cursos disponíveis
        </Typography>
      </Box>
    </Container>
  )
}
