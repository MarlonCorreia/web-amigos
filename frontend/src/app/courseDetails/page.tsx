import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
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
  Stack,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  TextField,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  MenuBook,
  PlayCircleOutlined,
  AccessTime,
  ExpandMore,
  PeopleAlt,
  LockOutlined,
  ArrowBack,
  CheckCircle,
  Delete,
  QuestionAnswer,
} from '@mui/icons-material'

import { useAuth } from '../../contexts/AuthContext'
import {
  getCourseDetails,
  getCourseModules,
  getModuleLessons,
  getCourseContent,
  getEnrollmentStatus,
  enrollInCourse,
  getCourseReviews,
  type CourseResponse,
} from '../../api/courses'
import { createReview, updateReview, deleteReview } from '../../api/reviews'
import type { CourseReview } from '../../types/review'
import { getComments, createComment, deleteComment } from '../../api/comments'
import type { LessonComment } from '../../types/comment'

const PRIMARY_COLOR = '#C2410C'

interface MappedLesson {
  id: string
  title: string
  description: string
  youtubeId: string
  durationMinutes: number
  position: number
  isFree: boolean
}

interface MappedModule {
  id: string
  title: string
  position: number
  lessons: MappedLesson[]
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useAuth()

  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [modules, setModules] = useState<MappedModule[]>([])
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [activeLesson, setActiveLesson] = useState<MappedLesson | null>(null)

  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userRating, setUserRating] = useState<number>(5)
  const [userComment, setUserComment] = useState<string>('')
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)

  const [comments, setComments] = useState<LessonComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!id) return

    async function loadData() {
      try {
        setError(null)
        setLoading(true)

        // 1. Fetch course details
        const details = await getCourseDetails(id)
        setCourse(details)

        // 2. Fetch reviews
        try {
          const courseReviews = await getCourseReviews(id)
          setReviews(courseReviews)
        } catch (revErr) {
          console.warn('Erro ao carregar avaliações:', revErr)
        }

        // 3. Check enrollment & fetch content
        let enrolled = false
        if (isAuthenticated) {
          try {
            const status = await getEnrollmentStatus(id)
            if (status && status.Status === 'active') {
              enrolled = true
              setIsEnrolled(true)
            }
          } catch (statusErr) {
            // If 404, user is simply not enrolled
            console.log('Sem matrícula ativa para este curso.')
          }
        }

        if (enrolled) {
          // If enrolled, load private content in one call
          const content = await getCourseContent(id)

          const mappedMods: MappedModule[] = (content.Modules || []).map((m: any) => ({
            id: m.ID,
            title: m.Title,
            position: m.Position,
            lessons: (m.Lessons || []).map((l: any) => ({
              id: l.ID,
              title: l.Title,
              description: l.Description,
              youtubeId: l.YoutubeID,
              durationMinutes: l.DurationMinutes,
              position: l.Position,
              isFree: l.IsFree,
            })),
          }))

          // Sort modules and lessons by position
          mappedMods.sort((a, b) => a.position - b.position)
          mappedMods.forEach(m => m.lessons.sort((a, b) => a.position - b.position))

          setModules(mappedMods)

          // Select the first lesson as default playing
          if (mappedMods.length > 0 && mappedMods[0].lessons.length > 0) {
            setActiveLesson(mappedMods[0].lessons[0])
          }
        } else {
          // If not enrolled or logged out, build syllabus from public modules & lessons
          const publicMods = await getCourseModules(id)

          const mappedMods: MappedModule[] = await Promise.all(
            publicMods.map(async (mod) => {
              const lessons = await getModuleLessons(mod.id)
              return {
                id: mod.id,
                title: mod.title,
                position: mod.position,
                lessons: lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  description: l.description,
                  youtubeId: l.youtube_id,
                  durationMinutes: l.duration_minutes,
                  position: l.position,
                  isFree: l.is_free,
                })),
              }
            })
          )

          mappedMods.sort((a, b) => a.position - b.position)
          mappedMods.forEach(m => m.lessons.sort((a, b) => a.position - b.position))

          setModules(mappedMods)

          // Default active lesson: first free lesson or first lesson (which will show as locked)
          let defaultLesson: MappedLesson | null = null
          for (const m of mappedMods) {
            const free = m.lessons.find((l) => l.isFree)
            if (free) {
              defaultLesson = free
              break
            }
          }
          if (!defaultLesson && mappedMods.length > 0 && mappedMods[0].lessons.length > 0) {
            defaultLesson = mappedMods[0].lessons[0]
          }
          setActiveLesson(defaultLesson)
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do curso:', err)
        setError('Erro ao carregar informações do curso. Verifique se o servidor está ativo.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, isAuthenticated, authLoading])

  useEffect(() => {
    if (!activeLesson || (!isEnrolled && !activeLesson.isFree && user?.role !== 'admin' && user?.role !== 'creator')) return
    setComments([])
    setCommentError(null)
    getComments(activeLesson.id)
      .then(setComments)
      .catch(() => setComments([]))
  }, [activeLesson, isEnrolled])

  useEffect(() => {
    setActiveTab(0)
  }, [activeLesson?.id])

  async function handleEnroll() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!id) return

    try {
      setError(null)
      setEnrolling(true)
      const res = await enrollInCourse(id)
      navigate(`/payment/${res.transaction_id}`)
    } catch (err) {
      console.error('Erro ao matricular-se:', err)
      setError('Falha ao iniciar processo de matrícula. Tente novamente.')
    } finally {
      setEnrolling(false)
    }
  }

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !course) {
    return (
      <Container sx={{ py: 6 }}>
        <Button startIcon={<ArrowBack />} component={RouterLink} to="/courses" sx={{ mb: 3 }}>
          Voltar para cursos
        </Button>
        <Alert severity="error">{error || 'Curso não encontrado.'}</Alert>
      </Container>
    )
  }

  const hasAccess = (lesson: MappedLesson) => {
    return isEnrolled || lesson.isFree || user?.role === 'admin' || user?.role === 'creator'
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

    setReviewError(null)
    setReviewSubmitting(true)

    try {
      if (isEditingReview && editingReviewId) {
        await updateReview(editingReviewId, {
          rating: userRating,
          comment: userComment,
        })

        setReviews(prev => prev.map(r => r.id === editingReviewId ? {
          ...r,
          rating: userRating,
          comment: userComment,
          updated_at: new Date().toISOString()
        } : r))

        setIsEditingReview(false)
        setEditingReviewId(null)
      } else {
        await createReview({
          course_id: id,
          rating: userRating,
          comment: userComment,
        })

        const courseReviews = await getCourseReviews(id)
        setReviews(courseReviews)

        setUserComment('')
        setUserRating(5)
      }
    } catch (err) {
      console.error('Erro ao salvar avaliacao:', err)
      setReviewError(err instanceof Error ? err.message : 'Erro ao processar sua avaliacao.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleReviewDelete = async (reviewId: string) => {
    if (!window.confirm('Tem certeza de que deseja remover sua avaliação?')) {
      return
    }

    setReviewError(null)
    setReviewSubmitting(true)

    try {
      await deleteReview(reviewId)

      setReviews(prev => prev.filter(r => r.id !== reviewId))

      setUserComment('')
      setUserRating(5)
      setIsEditingReview(false)
      setEditingReviewId(null)
    } catch (err) {
      console.error('Erro ao excluir avaliacao:', err)
      setReviewError('Erro ao excluir sua avaliação.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleStartEditReview = (review: CourseReview) => {
    setIsEditingReview(true)
    setEditingReviewId(review.id)
    setUserRating(review.rating)
    setUserComment(review.comment)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLesson || !newComment.trim()) return
    setCommentSubmitting(true)
    setCommentError(null)
    try {
      await createComment(activeLesson.id, newComment.trim())
      setNewComment('')
      const fresh = await getComments(activeLesson.id)
      setComments(fresh)
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Erro ao enviar comentário')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentID: string) => {
    try {
      await deleteComment(commentID)
      setComments(prev => prev.filter(c => c.id !== commentID))
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Erro ao deletar comentário')
    }
  }

  // Count total lessons & duration
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalDuration = modules.reduce((sum, m) => sum + m.lessons.reduce((d, l) => d + l.durationMinutes, 0), 0)

  // Calculate average rating from reviews
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 5.0

  return (
    <Box sx={{ bgcolor: '#fff', pb: 8 }}>
      {/* HEADER SECTION */}
      <Box sx={{ bgcolor: 'background.default', borderBottom: '1px solid #e5e7eb', py: 4 }}>
        <Container>
          <Breadcrumbs sx={{ mb: 2 }}>
            <MuiLink component={RouterLink} to="/courses" color="inherit" underline="hover">
              Cursos
            </MuiLink>
            <Typography color="text.primary">{course.title}</Typography>
          </Breadcrumbs>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mt: 2, color: '#111827' }}>
            {course.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
            <Rating value={avgRating} readOnly precision={0.1} size="small" />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {avgRating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({reviews.length} avaliações)
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* LEFT SIDE: Video Player / Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Inline Video Player */}
            {activeLesson ? (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Aula em Exibição: {activeLesson.title}
                </Typography>

                {hasAccess(activeLesson) ? (
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%', // 16:9 Aspect Ratio
                      bgcolor: '#000',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    {activeLesson.youtubeId ? (
                      <iframe
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 0,
                        }}
                        src={`https://www.youtube.com/embed/${activeLesson.youtubeId}`}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        <PlayCircleOutlined sx={{ fontSize: 64, mb: 1, color: PRIMARY_COLOR }} />
                        <Typography variant="body1">Link do vídeo não cadastrado para esta aula.</Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%',
                      bgcolor: '#1f2937',
                      borderRadius: 3,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <LockOutlined sx={{ fontSize: 56, mb: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Conteúdo Bloqueado
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#d1d5db', mb: 3, maxWidth: 400 }}>
                        Esta aula é exclusiva para alunos matriculados. Clique em "Matricule-se Agora" para liberar todo o curso.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEnroll}
                        disabled={enrolling}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Matricule-se Agora
                      </Button>
                    </Box>
                  </Box>
                )}

                {hasAccess(activeLesson) && (
                  <Box sx={{ mt: 3 }}>
                    <Tabs
                      value={activeTab}
                      onChange={(_e, v) => setActiveTab(v)}
                      sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                    >
                      <Tab label="Descrição" />
                      <Tab label={`Dúvidas (${comments.length})`} icon={<QuestionAnswer sx={{ fontSize: 16 }} />} iconPosition="end" />
                    </Tabs>

                    {/* Tab 0: Descrição */}
                    {activeTab === 0 && (
                      <Box>
                        {activeLesson.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {activeLesson.description}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma descrição disponível para esta aula.
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Tab 1: Dúvidas */}
                    {activeTab === 1 && (
                      <Box>
                        {commentError && (
                          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommentError(null)}>
                            {commentError}
                          </Alert>
                        )}

                        {/* Formulário novo comentário */}
                        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="Pergunte ou comente algo sobre esta aula..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            disabled={commentSubmitting || !newComment.trim()}
                            sx={{ bgcolor: PRIMARY_COLOR }}
                          >
                            {commentSubmitting ? 'Enviando...' : 'Enviar'}
                          </Button>
                        </Box>

                        {/* Lista de comentários */}
                        {comments.length === 0 ? (
                          <Alert severity="info">Nenhum comentário ainda. Seja o primeiro a perguntar!</Alert>
                        ) : (
                          <Stack spacing={2}>
                            {comments.map(comment => (
                              <Card key={comment.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ pb: '12px !important' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                          {comment.user?.full_name ?? 'Usuário'}
                                        </Typography>
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                      </Typography>
                                    </Box>
                                    {(comment.user_id === user?.id || user?.role === 'admin' || user?.role === 'creator') && (
                                      <Tooltip title="Deletar comentário">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDeleteComment(comment.id)}
                                          sx={{ color: 'text.secondary' }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {comment.content}
                                  </Typography>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Se não tem acesso, mostrar descrição simples como antes */}
                {!hasAccess(activeLesson) && activeLesson.description && (
                  <Card variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Descrição da aula:
                      </Typography>
                      <Typography variant="body2">{activeLesson.description}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : null}

            {/* Course Description */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#111827' }}>
                Sobre este curso
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                {course.description}
              </Typography>
            </Box>

            {/* CURRICULUM ACCORDIONS */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#111827' }}>
                Conteúdo do Curso
              </Typography>

              {modules.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Nenhum módulo cadastrado para este curso ainda.
                </Alert>
              ) : (
                modules.map((mod, index) => (
                  <Accordion
                    key={mod.id}
                    defaultExpanded={index === 0}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: '1px solid #e5e7eb',
                      mb: 1.5,
                      borderRadius: '8px !important',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111827' }}>
                          Módulo {mod.position}: {mod.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mod.lessons.length} aulas • {mod.lessons.reduce((acc, l) => acc + l.durationMinutes, 0)} min
                        </Typography>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ borderTop: '1px solid #e5e7eb', bgcolor: '#f9fafb', p: 0 }}>
                      {mod.lessons.length === 0 ? (
                        <Box sx={{ px: 3, py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma aula cadastrada neste módulo.
                          </Typography>
                        </Box>
                      ) : (
                        mod.lessons.map((lesson) => {
                          const isCurrentlyPlaying = activeLesson?.id === lesson.id
                          const playable = hasAccess(lesson)

                          return (
                            <Box
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 3,
                                py: 2,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                bgcolor: isCurrentlyPlaying ? '#fff7ed' : 'transparent',
                                '&:hover': {
                                  bgcolor: isCurrentlyPlaying ? '#ffedd5' : '#f3f4f6',
                                },
                                '&:last-child': {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                {playable ? (
                                  <PlayCircleOutlined sx={{ color: isCurrentlyPlaying ? PRIMARY_COLOR : '#6b7280', fontSize: 20 }} />
                                ) : (
                                  <LockOutlined sx={{ color: '#9ca3af', fontSize: 20 }} />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isCurrentlyPlaying ? 'bold' : 'normal',
                                    color: isCurrentlyPlaying ? PRIMARY_COLOR : '#374151',
                                  }}
                                >
                                  {lesson.title}
                                </Typography>
                                {lesson.isFree && !isEnrolled && (
                                  <Box
                                    component="span"
                                    sx={{
                                      fontSize: '0.75rem',
                                      bgcolor: '#d1fae5',
                                      color: '#065f46',
                                      px: 1,
                                      py: 0.2,
                                      borderRadius: 1,
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Grátis
                                  </Box>
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {lesson.durationMinutes} min
                              </Typography>
                            </Box>
                          )
                        })
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          </Grid>

          {/* RIGHT SIDE: Buy Box & Stats */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                position: 'sticky',
                top: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
              }}
            >
              <Box
                component="img"
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                alt={course.title}
                sx={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 4 }}>
                {isEnrolled ? (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', color: '#10b981', mb: 1 }}>
                      <CheckCircle />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Matrícula Ativa
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Você já tem acesso vitalício a este curso.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: 'extrabold', color: '#111827', mb: 1 }}>
                      R$ {course.price.toFixed(2).replace('.', ',')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Acesso garantido por {course.access_duration_days} dias.
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      disabled={enrolling}
                      onClick={handleEnroll}
                      sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1rem', mb: 3 }}
                    >
                      {enrolling ? <CircularProgress size={24} color="inherit" /> : 'Matricule-se Agora'}
                    </Button>
                  </>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Course Stats */}
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <MenuBook sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {modules.length} Módulos
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PlayCircleOutlined sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {totalLessons} Aulas
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <AccessTime sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {totalDuration} minutos de duração
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PeopleAlt sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Estude no seu próprio ritmo
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* REVIEWS SECTION */}
      <Container sx={{ mt: 4 }}>
        <Divider sx={{ my: 6 }} />

        {/* Avaliação do Usuário Logado & Matriculado (CRUD) */}
        {isEnrolled && user && (
          <Box sx={{ mb: 6 }}>
            {(() => {
              const myReview = reviews.find((r) => r.user_id === user.id)
              const showForm = !myReview || isEditingReview

              if (showForm) {
                return (
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3, border: '1px solid #e5e7eb', bgcolor: '#fbfbfb' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {isEditingReview ? 'Editar sua Avaliação' : 'Avaliar este Curso'}
                    </Typography>

                    {reviewError && (
                      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {reviewError}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleReviewSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Sua nota:
                        </Typography>
                        <Rating
                          value={userRating}
                          onChange={(_, val) => setUserRating(val || 5)}
                          size="large"
                        />
                      </Box>
                      <TextField
                        label="O que você achou do curso? Deixe seu comentário (opcional)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Ex: Excelente material, muito prático e direto ao ponto!"
                      />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {isEditingReview && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsEditingReview(false)
                              setEditingReviewId(null)
                              setUserComment('')
                              setUserRating(5)
                            }}
                            disabled={reviewSubmitting}
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={reviewSubmitting}
                        >
                          {reviewSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                )
              } else {
                return (
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3, border: '1px solid #fed7aa', bgcolor: '#fff7ed' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#c2410c' }}>
                            Sua Avaliação
                          </Typography>
                          <Chip label="Você" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Publicado em {new Date(myReview.created_at).toLocaleDateString('pt-BR')}
                          {myReview.updated_at !== myReview.created_at && ' (editado)'}
                        </Typography>
                      </Box>
                      <Rating value={myReview.rating} readOnly size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, color: 'text.primary', lineHeight: 1.6 }}>
                      "{myReview.comment}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStartEditReview(myReview)}
                        disabled={reviewSubmitting}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleReviewDelete(myReview.id)}
                        disabled={reviewSubmitting}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </Card>
                )
              }
            })()}
          </Box>
        )}

        {/* Lista de Outras Avaliações */}
        {(() => {
          const myReview = user ? reviews.find((r) => r.user_id === user.id) : null
          const listReviews = myReview ? reviews.filter((r) => r.user_id !== user.id) : reviews
          const title = myReview ? `Outras Avaliações (${listReviews.length})` : `Avaliações dos Alunos (${reviews.length})`

          return (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, color: '#111827' }}>
                {title}
              </Typography>

              {listReviews.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {myReview
                    ? "Nenhum outro aluno avaliou este curso ainda."
                    : "Este curso ainda não possui avaliações. Seja o primeiro a avaliar!"}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {listReviews.map((review) => (
                    <Grid size={{ xs: 12, md: 6 }} key={review.id}>
                      <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', border: '1px solid #e5e7eb' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111827' }}>
                                {review.user?.full_name ?? 'Aluno Anônimo'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.created_at).toLocaleDateString('pt-BR')}
                              </Typography>
                            </Box>
                            <Rating value={review.rating} readOnly size="small" />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{review.comment}"
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )
        })()}
      </Container>
    </Box>
  )
}