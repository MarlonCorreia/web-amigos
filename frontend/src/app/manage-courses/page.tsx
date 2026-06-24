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
  CardMedia,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutlined as PlayCircleOutlineIcon,
  Publish as PublishIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

import { useAuth } from '../../contexts/AuthContext'
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getCourseModules,
  getModuleLessons,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  type CourseSimpleResponse,
  type ModuleResponse,
  type LessonResponse,
} from '../../api/courses'

type ViewType = 'list' | 'courseForm' | 'curriculum'

export default function ManageCoursesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Navigation and active item states
  const [view, setView] = useState<ViewType>('list')
  const [activeCourse, setActiveCourse] = useState<CourseSimpleResponse | null>(null)

  // API Lists
  const [courses, setCourses] = useState<CourseSimpleResponse[]>([])
  const [modules, setModules] = useState<ModuleResponse[]>([])
  const [lessonsByModule, setLessonsByModule] = useState<{ [moduleId: string]: LessonResponse[] }>({})

  // General state
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseThumbnail, setCourseThumbnail] = useState('')
  const [coursePrice, setCoursePrice] = useState('199.90')
  const [courseDuration, setCourseDuration] = useState('365')
  const [courseGatewayId, setCourseGatewayId] = useState('prod_learnlab')
  const [courseShouldPublish, setCourseShouldPublish] = useState(true)
  const [isEditingCourse, setIsEditingCourse] = useState(false)

  // Module Dialog State
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleResponse | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [modulePosition, setModulePosition] = useState(1)

  // Lesson Dialog State
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null)
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [lessonYoutubeId, setLessonYoutubeId] = useState('')
  const [lessonDuration, setLessonDuration] = useState(15)
  const [lessonPosition, setLessonPosition] = useState(1)
  const [lessonIsFree, setLessonIsFree] = useState(false)

  // Authorization checks
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login')
      } else if (user?.role !== 'creator' && user?.role !== 'admin') {
        navigate('/courses')
      }
    }
  }, [isAuthenticated, user, authLoading, navigate])

  // Load user courses
  const fetchCourses = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      // List all courses (published and draft)
      const data = await listCourses(false)
      // If admin, show all. If creator, filter by creator_id
      const userCourses = user.role === 'admin'
        ? data
        : data.filter(c => c.creator_id === user.id)
      setCourses(userCourses)
    } catch (err) {
      console.error('Erro ao buscar cursos:', err)
      setError('Falha ao carregar a lista de cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'creator' || user?.role === 'admin')) {
      fetchCourses()
    }
  }, [isAuthenticated, user])

  // Load modules and lessons for curriculum view
  const loadCurriculum = async (course: CourseSimpleResponse) => {
    try {
      setLoading(true)
      setError(null)
      const modulesData = await getCourseModules(course.id)
      
      // Sort modules by position
      const sortedModules = [...modulesData].sort((a, b) => a.position - b.position)
      setModules(sortedModules)

      // Fetch lessons for each module
      const lessonsMap: { [moduleId: string]: LessonResponse[] } = {}
      await Promise.all(
        sortedModules.map(async (mod) => {
          try {
            const lessonsData = await getModuleLessons(mod.id)
            lessonsMap[mod.id] = [...lessonsData].sort((a, b) => a.position - b.position)
          } catch (err) {
            console.error(`Erro ao buscar aulas do modulo ${mod.id}:`, err)
            lessonsMap[mod.id] = []
          }
        })
      )
      setLessonsByModule(lessonsMap)
    } catch (err) {
      console.error('Erro ao carregar ementa:', err)
      setError('Falha ao carregar os módulos e aulas do curso.')
    } finally {
      setLoading(false)
    }
  }

  // Course operations
  const handlePublish = async (courseId: string) => {
    try {
      setError(null)
      setSuccess(null)
      await publishCourse(courseId)
      setSuccess('Curso publicado com sucesso!')
      fetchCourses()
    } catch (err) {
      console.error('Erro ao publicar:', err)
      setError('Falha ao publicar o curso.')
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await deleteCourse(courseId)
      setSuccess('Curso excluído com sucesso!')
      fetchCourses()
    } catch (err) {
      console.error('Erro ao excluir curso:', err)
      setError(
        err instanceof Error
          ? `Falha ao excluir o curso: ${err.message}`
          : 'Falha ao excluir o curso. Verifique se existem alunos matriculados neste curso.'
      )
    }
  }

  const handleOpenCourseForm = (course: CourseSimpleResponse | null) => {
    setError(null)
    setSuccess(null)
    if (course) {
      setIsEditingCourse(true)
      setActiveCourse(course)
      setCourseTitle(course.title)
      setCourseDescription(course.description)
      setCourseThumbnail(course.thumbnail_url)
      setCoursePrice(course.price.toString())
      setCourseDuration(course.access_duration_days.toString())
      // Get detailed product gateway id
      setCourseGatewayId('')
      fetchGatewayProductId(course.id)
    } else {
      setIsEditingCourse(false)
      setActiveCourse(null)
      setCourseTitle('')
      setCourseDescription('')
      setCourseThumbnail('')
      setCoursePrice('199.90')
      setCourseDuration('365')
      setCourseGatewayId('prod_learnlab')
      setCourseShouldPublish(true)
    }
    setView('courseForm')
  }

  const fetchGatewayProductId = async (courseId: string) => {
    try {
      const details = await getCourseDetails(courseId)
      setCourseGatewayId(details.gateway_product_id)
    } catch (err) {
      console.error('Erro ao obter detalhes adicionais do curso:', err)
      setCourseGatewayId('prod_learnlab')
    }
  }

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const numPrice = parseFloat(coursePrice)
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Por favor, informe um preço de venda válido (maior ou igual a zero).')
      setSubmitting(false)
      return
    }

    const numDuration = parseInt(courseDuration, 10)
    if (isNaN(numDuration) || numDuration < 1) {
      setError('Por favor, informe uma duração de acesso válida em dias (no mínimo 1 dia).')
      setSubmitting(false)
      return
    }

    try {
      if (isEditingCourse && activeCourse) {
        await updateCourse(activeCourse.id, {
          title: courseTitle,
          description: courseDescription,
          thumbnail_url: courseThumbnail,
          gateway_product_id: courseGatewayId,
          price: numPrice,
          access_duration_days: numDuration,
        })
        setSuccess('Curso atualizado com sucesso!')
      } else {
        const newCourse = await createCourse({
          creator: user.id,
          title: courseTitle,
          description: courseDescription,
          thumbnail_url: courseThumbnail,
          gateway_product_id: courseGatewayId,
          price: numPrice,
          access_duration_days: numDuration,
        })

        if (courseShouldPublish && newCourse.id) {
          try {
            await publishCourse(newCourse.id)
          } catch (pubErr) {
            console.error('Erro ao publicar após criar:', pubErr)
          }
        }
        setSuccess('Curso criado com sucesso!')
      }

      setTimeout(() => {
        setView('list')
        fetchCourses()
      }, 1000)
    } catch (err) {
      console.error('Erro ao salvar curso:', err)
      setError(err instanceof Error ? err.message : 'Falha ao salvar curso.')
    } finally {
      setSubmitting(false)
    }
  }

  // Module actions
  const handleOpenModuleDialog = (module: ModuleResponse | null) => {
    setError(null)
    if (module) {
      setEditingModule(module)
      setModuleTitle(module.title)
      setModulePosition(module.position)
    } else {
      setEditingModule(null)
      setModuleTitle('')
      // Default to next position
      const nextPos = modules.length > 0 ? Math.max(...modules.map(m => m.position)) + 1 : 1
      setModulePosition(nextPos)
    }
    setModuleDialogOpen(true)
  }

  const handleModuleSubmit = async () => {
    if (!activeCourse) return
    if (!moduleTitle.trim()) {
      setError('O título do módulo é obrigatório.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (editingModule) {
        await updateModule(editingModule.id, {
          title: moduleTitle,
          position: modulePosition,
        })
      } else {
        await createModule(activeCourse.id, {
          title: moduleTitle,
          position: modulePosition,
        })
      }

      setModuleDialogOpen(false)
      loadCurriculum(activeCourse)
    } catch (err) {
      console.error('Erro ao salvar modulo:', err)
      setError('Falha ao salvar o módulo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!activeCourse) return
    if (!window.confirm('Tem certeza de que deseja excluir este módulo e todas as suas lições?')) {
      return
    }

    try {
      setError(null)
      await deleteModule(moduleId)
      loadCurriculum(activeCourse)
    } catch (err) {
      console.error('Erro ao excluir modulo:', err)
      setError('Falha ao excluir o módulo.')
    }
  }

  // Lesson actions
  const handleOpenLessonDialog = (moduleId: string, lesson: LessonResponse | null) => {
    setError(null)
    setTargetModuleId(moduleId)
    if (lesson) {
      setEditingLesson(lesson)
      setLessonTitle(lesson.title)
      setLessonDescription(lesson.description)
      setLessonYoutubeId(lesson.youtube_id)
      setLessonDuration(lesson.duration_minutes)
      setLessonPosition(lesson.position)
      setLessonIsFree(lesson.is_free)
    } else {
      setEditingLesson(null)
      setLessonTitle('')
      setLessonDescription('')
      setLessonYoutubeId('')
      setLessonDuration(15)
      // Default to next position in module
      const moduleLessons = lessonsByModule[moduleId] || []
      const nextPos = moduleLessons.length > 0 ? Math.max(...moduleLessons.map(l => l.position)) + 1 : 1
      setLessonPosition(nextPos)
      setLessonIsFree(false)
    }
    setLessonDialogOpen(true)
  }

  const handleLessonSubmit = async () => {
    if (!activeCourse || !targetModuleId) return
    if (!lessonTitle.trim()) {
      setError('O título da aula é obrigatório.')
      return
    }
    if (!lessonYoutubeId.trim()) {
      setError('O ID do YouTube é obrigatório.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        title: lessonTitle,
        description: lessonDescription,
        youtube_id: lessonYoutubeId,
        duration_minutes: Number(lessonDuration),
        position: Number(lessonPosition),
        is_free: lessonIsFree,
      }

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload)
      } else {
        await createLesson(targetModuleId, payload)
      }

      setLessonDialogOpen(false)
      loadCurriculum(activeCourse)
    } catch (err) {
      console.error('Erro ao salvar aula:', err)
      setError('Falha ao salvar a aula.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!activeCourse) return
    if (!window.confirm('Tem certeza de que deseja excluir esta aula?')) {
      return
    }

    try {
      setError(null)
      await deleteLesson(lessonId)
      loadCurriculum(activeCourse)
    } catch (err) {
      console.error('Erro ao excluir aula:', err)
      setError('Falha ao excluir a aula.')
    }
  }

  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit" underline="hover">
          Home
        </MuiLink>
        {view !== 'list' ? (
          <MuiLink
            component="span"
            onClick={() => setView('list')}
            sx={{ cursor: 'pointer', color: 'inherit' }}
            underline="hover"
          >
            Gerenciar Cursos
          </MuiLink>
        ) : (
          <Typography color="text.primary">Gerenciar Cursos</Typography>
        )}
        {view === 'courseForm' && (
          <Typography color="text.primary">{isEditingCourse ? 'Editar Curso' : 'Criar Curso'}</Typography>
        )}
        {view === 'curriculum' && (
          <Typography color="text.primary">Grade Curricular: {activeCourse?.title}</Typography>
        )}
      </Breadcrumbs>

      {/* Global Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* 2. List View */}
      {view === 'list' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>
                Painel do Criador
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gerencie seus cursos cadastrados, ementas e preços de venda.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCourseForm(null)}
              sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
            >
              Criar Novo Curso
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : courses.length === 0 ? (
            <Card variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Nenhum curso cadastrado ainda.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOpenCourseForm(null)}
                sx={{ textTransform: 'none' }}
              >
                Cadastrar o primeiro curso
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                        alt={course.title}
                      />
                      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                        <Chip
                          label={course.is_published ? 'Publicado' : 'Rascunho'}
                          color={course.is_published ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 'bold', backdropFilter: 'blur(4px)', bgcolor: course.is_published ? 'rgba(46, 125, 50, 0.9)' : 'rgba(100, 116, 139, 0.9)', color: 'white' }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1, color: '#1f2937', lineBreak: 'anywhere' }}>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '40px',
                        }}
                      >
                        {course.description}
                      </Typography>

                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {course.price === 0 ? 'Grátis' : `R$ ${course.price.toFixed(2)}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Acesso: {course.access_duration_days} dias
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="Editar Metadados">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCourseForm(course)}
                              sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Grade Curricular">
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<SettingsIcon />}
                              onClick={() => {
                                setActiveCourse(course)
                                setView('curriculum')
                                loadCurriculum(course)
                              }}
                              sx={{ textTransform: 'none', borderRadius: 2, flexGrow: 1 }}
                            >
                              Grade
                            </Button>
                          </Tooltip>

                          {!course.is_published && (
                            <Tooltip title="Publicar Curso">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handlePublish(course.id)}
                                sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}
                              >
                                <PublishIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Excluir Curso">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCourse(course.id)}
                              sx={{ border: '1px solid #fee2e2', borderRadius: 2 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* 3. Course Form View */}
      {view === 'courseForm' && (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setView('list')}
              sx={{ textTransform: 'none', mb: 2, color: 'text.secondary' }}
            >
              Voltar ao painel
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#111827' }}>
              {isEditingCourse ? 'Editar Curso' : 'Criar Novo Curso'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Preencha os metadados principais do curso.
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleCourseSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Título do Curso"
                  variant="outlined"
                  fullWidth
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
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
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Descreva os objetivos do curso, conteúdo programático, etc."
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  label="URL da Thumbnail (Imagem de Capa)"
                  variant="outlined"
                  fullWidth
                  required
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
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
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
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
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
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
                  value={courseGatewayId}
                  onChange={(e) => setCourseGatewayId(e.target.value)}
                  placeholder="Identificador no provedor de pagamento (Ex: prod_docker)"
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                {!isEditingCourse && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={courseShouldPublish}
                        onChange={(e) => setCourseShouldPublish(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Publicar curso imediatamente (torná-lo visível no catálogo)"
                  />
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setView('list')}
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
                    {submitting ? 'Salvando...' : isEditingCourse ? 'Salvar Alterações' : 'Criar Curso'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 4. Curriculum View */}
      {view === 'curriculum' && activeCourse && (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setView('list')}
                sx={{ textTransform: 'none', mb: 2, color: 'text.secondary' }}
              >
                Voltar ao painel
              </Button>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                Grade Curricular: {activeCourse.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Estruture seu curso criando módulos e cadastrando as aulas com os vídeos correspondentes.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModuleDialog(null)}
              sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Novo Módulo
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : modules.length === 0 ? (
            <Card variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Nenhum módulo criado para este curso.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOpenModuleDialog(null)}
                sx={{ textTransform: 'none' }}
              >
                Criar primeiro módulo
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {modules.map((mod) => {
                const lessons = lessonsByModule[mod.id] || []
                return (
                  <Accordion
                    key={mod.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: '#f9fafb',
                        px: 3,
                        py: 1,
                        flexDirection: 'row',
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Módulo {mod.position}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {mod.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mr: 2 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenModuleDialog(mod)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteModule(mod.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: '#ffffff' }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Aulas ({lessons.length})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenLessonDialog(mod.id, null)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Adicionar Aula
                        </Button>
                      </Box>

                      {lessons.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
                          Nenhuma aula neste módulo.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {lessons.map((les) => (
                            <Box
                              key={les.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                border: '1px solid #f3f4f6',
                                borderRadius: 2.5,
                                bgcolor: '#fbfbfb',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                                <PlayCircleOutlineIcon color="action" />
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
                                      {les.position}. {les.title}
                                    </Typography>
                                    {les.is_free && (
                                      <Chip
                                        label="Grátis"
                                        color="success"
                                        size="small"
                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Duração: {les.duration_minutes} min | ID YouTube: {les.youtube_id}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton size="small" onClick={() => handleOpenLessonDialog(mod.id, les)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteLesson(les.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>
          )}
        </Box>
      )}

      {/* 5. Module CRUD Dialog */}
      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Título do Módulo"
              variant="outlined"
              fullWidth
              required
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Ex: Módulo 1: Introdução ao Curso"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Posição (Ordem de Exibição)"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={modulePosition}
              onChange={(e) => setModulePosition(Number(e.target.value))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setModuleDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleModuleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. Lesson CRUD Dialog */}
      <Dialog open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingLesson ? 'Editar Aula' : 'Nova Aula'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Título da Aula"
              variant="outlined"
              fullWidth
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Ex: Configurando o Ambiente"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Descrição"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="Descreva o que será ensinado nesta aula."
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="ID do Vídeo no YouTube"
              variant="outlined"
              fullWidth
              required
              value={lessonYoutubeId}
              onChange={(e) => setLessonYoutubeId(e.target.value)}
              placeholder="Ex: dQw4w9WgXcQ"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Duração (minutos)"
                  variant="outlined"
                  type="number"
                  fullWidth
                  required
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Posição (Ordem no Módulo)"
                  variant="outlined"
                  type="number"
                  fullWidth
                  required
                  value={lessonPosition}
                  onChange={(e) => setLessonPosition(Number(e.target.value))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Checkbox
                  checked={lessonIsFree}
                  onChange={(e) => setLessonIsFree(e.target.checked)}
                  color="success"
                />
              }
              label="Definir como Aula Grátis (Qualquer pessoa pode assistir sem se matricular)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setLessonDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleLessonSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
