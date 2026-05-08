import { Typography, Container, Box } from '@mui/material'

function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Bem-vindo à Plataforma de Cursos
        </Typography>
        <Typography variant="body1">
          Página inicial
        </Typography>
      </Box>
    </Container>
  )
}

export default Home
