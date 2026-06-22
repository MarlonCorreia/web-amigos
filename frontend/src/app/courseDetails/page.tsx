import { useParams } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Rating, 
  Stack 
} from '@mui/material'
import { 
  MenuBook, 
  PlayCircleOutlined, 
  AccessTime, 
  ExpandMore, 
  PeopleAlt 
} from '@mui/icons-material'
import { Link as RouterLink } from "react-router-dom";

const PRIMARY_COLOR = '#b83a14'

// Mock de Dados teste
const MOCK_COURSES_DATA: Record<string, any> = {
  "data-science": {
    category: "CIÊNCIA DE DADOS",
    title: "Fundamentos de Data Science",
    description: "Domine as habilidades essenciais de ciência de dados, incluindo análise de dados, visualização e machine learning. Aprenda a extrair insights valiosos e a tomar decisões baseadas em dados.",
    rating: 4.3,
    reviewsCount: 3,
    studentsCount: "1.247",
    instructor: "Sarah Johnson",
    price: "R$ 299,90",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1920&auto=format&fit=crop",
    stats: { modules: 4, lessons: 12, duration: "5h 30m" },
    modules: [
      {
        title: "Módulo 1: Fundamentos de Análise de Dados",
        description: "Introdução à análise de dados utilizando Python, pandas e NumPy para manipulação e exploração de dados.",
        lessons: [
          { name: "Python para Análise de Dados", duration: "25 min" },
          { name: "Básico de Pandas", duration: "30 min" },
          { name: "Limpeza de Dados (Data Cleaning)", duration: "28 min" },
        ]
      },
      { title: "Módulo 2: Visualização de Dados", description: "Aprenda a criar gráficos impactantes utilizando matplotlib, seaborn e plotly para comunicar seus insights.", lessons: [] },
      { title: "Módulo 3: Introdução ao Machine Learning", description: "Conceitos básicos de algoritmos de aprendizado de máquina, aprendizado supervisionado e técnicas de avaliação de modelos.", lessons: [] },
      { title: "Módulo 4: Análise Avançada", description: "Explore métodos estatísticos avançados e modelagem preditiva para problemas reais de ciência de dados.", lessons: [] },
    ],
    reviews: [
      { name: "Anônimo", date: "8 de Maio de 2026", rating: 5, comment: "Curso excelente! A seção de visualização de dados é excepcional e os instrutores respondem super rápido às dúvidas." },
      { name: "Anônimo", date: "8 de Maio de 2026", rating: 4, comment: "Conteúdo muito bom e módulos bem estruturados. A Sarah Johnson demonstra muito conhecimento. Só gostaria que tivesse mais projetos práticos reais." },
      { name: "Anônimo", date: "8 de Maio de 2026", rating: 4, comment: "Curso sólido com ótimos fundamentos. A parte de machine learning poderia ser um pouco mais aprofundada, mas no geral é muito informativo." }
    ]
  }
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const course = MOCK_COURSES_DATA[id || ''] || MOCK_COURSES_DATA['data-science']

  return (
    <Box sx={{ bgcolor: '#fff', pb: 8 }}>
      
      <Container sx={{ py: 6 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" sx={{ display: 'block', color: PRIMARY_COLOR, fontWeight: 'bold', letterSpacing: 1.5 }}>
              {course.category}
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, my: 1, color: '#1a1a1a' }}>
              {course.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.7 }}>
              {course.description}
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <Rating value={course.rating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                {course.rating} <Box component="span" sx={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>({course.reviewsCount} avaliações)</Box>
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: '#666' }}>
                <PeopleAlt fontSize="small" />
                <Typography variant="body2">{course.studentsCount} alunos</Typography>
              </Stack>
            </Stack>

            <Typography variant="body2" sx={{ mb: 4, color: '#555' }}>
              Instrutor(a): <Box component="span" sx={{ fontWeight: 'bold', color: PRIMARY_COLOR }}>{course.instructor}</Box>
            </Typography>

            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                {course.price}
              </Typography>
              <Button
                component={RouterLink}
                to={`/payment/${id}`} 
                variant="contained" 
                sx={{ 
                  bgcolor: PRIMARY_COLOR, 
                  '&:hover': { bgcolor: '#9c300f' },
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 'bold'
                }}
              >
                Matricule-se Agora
              </Button>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              component="img"
              src={course.image}
              alt={course.title}
              sx={{
                width: '100%',
                maxHeight: 380,
                objectFit: 'cover',
                borderRadius: 4,
                boxShadow: '0px 8px 24px rgba(0,0,0,0.1)'
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* --- STATS BAR --- */}
      <Container sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {[
            { icon: <MenuBook sx={{ color: PRIMARY_COLOR }} />, value: `${course.stats.modules} Módulos` },
            { icon: <PlayCircleOutlined sx={{ color: PRIMARY_COLOR }} />, value: `${course.stats.lessons} Aulas` },
            { icon: <AccessTime sx={{ color: PRIMARY_COLOR }} />, value: `${course.stats.duration} de Duração` },
          ].map((stat, idx) => (
            <Grid size={{ xs: 12, sm: 4 }} key={idx}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 2 }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {stat.icon}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- COURSE CONTENT --- */}
      <Container sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1a1a1a' }}>
          Conteúdo do Curso
        </Typography>

        {course.modules.map((mod: any, index: number) => (
          <Accordion 
            key={index} 
            defaultExpanded={index === 0} 
            disableGutters
            elevation={0}
            sx={{ 
              border: '1px solid #e0e0e0', 
              mb: 1.5, 
              borderRadius: '8px !important',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  {mod.description}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999', mt: 0.5 }}>
                  {mod.lessons.length > 0 ? `${mod.lessons.length} aulas` : '0 aulas'}
                </Typography>
              </Stack>
            </AccordionSummary>
            
            {mod.lessons.length > 0 && (
              <AccordionDetails sx={{ borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa', p: 0 }}>
                {mod.lessons.map((lesson: any, lIdx: number) => (
                  <Box 
                    key={lIdx} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      px: 3, 
                      py: 2,
                      borderBottom: lIdx === mod.lessons.length - 1 ? 'none' : '1px solid #eee'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <PlayCircleOutlined sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#333' }}>{lesson.name}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#888' }}>{lesson.duration}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </Container>

      {/* --- REVIEWS SECTION --- */}
      <Container>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Avaliações dos Alunos
          </Typography>
          <Button variant="outlined" sx={{ textTransform: 'none', color: '#333', borderColor: '#ccc', '&:hover': { borderColor: '#999' } }}>
            Ver Todas as Avaliações
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {course.reviews.map((review: any, idx: number) => (
            <Grid size={{ xs: 12, md: idx === 2 ? 12 : 6 }} key={idx}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                        {review.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {review.date}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} size="small" readOnly />
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6, mt: 2 }}>
                    {review.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

    </Box>
  )
}