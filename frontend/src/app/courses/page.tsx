import { Typography, Container, Box, Grid } from '@mui/material'
import { CourseCard } from '../../components/CourseCard'

interface Course {
  id: number;
  title: string;
  category: string;
  price: string;
  description: string;
  rating: number;
  students: string;
  author: string;
  image: string;
}

const coursesData: Course[] = [
  {
    id: 1,
    title: 'Fundamentos de Data Science',
    category: 'DATA SCIENCE',
    price: 'R$ 189,90',
    description: 'Domine as competências essenciais de ciência de dados, incluindo análise, visualização e algoritmos iniciais.',
    rating: 4.8,
    students: '1.247',
    author: 'Lucas',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'UI/UX Design Masterclass',
    category: 'DESIGN',
    price: 'R$ 149,90',
    description: 'Torne-se um designer profissional. Aprenda princípios de design, pesquisa de utilizador e prototipagem no Figma.',
    rating: 4.9,
    students: '843',
    author: 'Lucas',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Estratégia de Negócios 101',
    category: 'BUSINESS',
    price: 'R$ 129,90',
    description: 'Compreenda os fundamentos do mercado. Desenvolva vantagens competitivas e lidere análises corporativas de sucesso.',
    rating: 4.5,
    students: '2.150',
    author: 'Lucas',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'UI/UX Design Masterclass',
    category: 'DESIGN',
    price: 'R$ 149,90',
    description: 'Torne-se um designer profissional. Aprenda princípios de design, pesquisa de utilizador e prototipagem no Figma.',
    rating: 4.9,
    students: '843',
    author: 'Lucas',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Estratégia de Negócios 101',
    category: 'BUSINESS',
    price: 'R$ 129,90',
    description: 'Compreenda os fundamentos do mercado. Desenvolva vantagens competitivas e lidere análises corporativas de sucesso.',
    rating: 4.5,
    students: '2.150',
    author: 'Lucas',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  },
];


export default function CoursesPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Catálogo de Cursos
        </Typography>
        <Grid container spacing={4}>
          {coursesData.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
            <CourseCard 
              course={course} 
            />
          </Grid>
        ))}
        </Grid>
      </Box>
    </Container>
  )
}
