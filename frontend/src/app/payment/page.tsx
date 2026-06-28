import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Stack,
  CardMedia,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import PixIcon from '@mui/icons-material/Pix'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SecurityIcon from '@mui/icons-material/Security'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { apiRequest } from '../../api/client'
import { getCourseDetails, type CourseResponse } from '../../api/courses'

type StatusType = 'loading' | 'pending' | 'success' | 'error'

interface TransactionStatusResponse {
  transaction_id: string
  status: string
  course_id: string
}

export default function PaymentPage() {
  const { transactionID } = useParams<{ transactionID: string }>()
  const navigate = useNavigate()

  // Checkout states
  const [status, setStatus] = useState<StatusType>('loading')
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  
  // Simulation states
  const [simulating, setSimulating] = useState(false)
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch initial transaction info & course details
  const fetchTransactionAndCourse = async () => {
    if (!transactionID) return
    
    try {
      setStatus('loading')
      setErrorMsg(null)

      // 1. Fetch transaction status to get course_id
      const txData = await apiRequest<TransactionStatusResponse>(
        `/webhooks/gateway/status?transaction_id=${transactionID}`
      )

      if (txData.status === 'active') {
        setStatus('success')
        // Get course details for summary
        const courseData = await getCourseDetails(txData.course_id)
        setCourse(courseData)
        return
      }

      // 2. Load course details using course_id from status
      const courseData = await getCourseDetails(txData.course_id)
      setCourse(courseData)
      
      // 3. Build QR Code pointing directly to backend GET activation URL
      const activationUrl = `http://localhost:8080/webhooks/gateway?transaction_id=${transactionID}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activationUrl)}`
      setQrCodeUrl(qrUrl)
      setStatus('pending')

    } catch (err) {
      console.error('Erro ao buscar transação/curso:', err)
      setErrorMsg('Falha ao processar as informações do checkout. Verifique a conexão com o servidor.')
      setStatus('error')
    }
  }

  // Polling database status
  const startPolling = () => {
    if (pollingRef.current) return
    
    pollingRef.current = setInterval(async () => {
      if (!transactionID) return
      try {
        const txData = await apiRequest<TransactionStatusResponse>(
          `/webhooks/gateway/status?transaction_id=${transactionID}`
        )
        if (txData.status === 'active') {
          setStatus('success')
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar status no polling:', err)
      }
    }, 2000)
  }

  useEffect(() => {
    fetchTransactionAndCourse()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [transactionID])

  // Start polling when transaction is pending
  useEffect(() => {
    if (status === 'pending') {
      startPolling()
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [status])

  // Simulate payment by hitting the GET activation endpoint directly
  const handleSimulatePayment = async () => {
    if (!transactionID || simulating) return
    setSimulating(true)
    setErrorMsg(null)
    
    try {
      // Fetch the backend automatic GET activation endpoint
      const response = await fetch(
        `http://localhost:8080/webhooks/gateway?transaction_id=${transactionID}`
      )
      
      if (!response.ok) {
        throw new Error('Falha na simulação do gateway do banco.')
      }

      // Polling will detect the activation and update UI automatically!
    } catch (err) {
      console.error('Erro ao simular pagamento:', err)
      setErrorMsg('Falha ao simular o pagamento Pix.')
      setSimulating(false)
    }
  }

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Carregando informações do pedido...
        </Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {status === 'success' ? (
        <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center', mt: 4 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 5, borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#111827' }}>
              Matrícula Confirmada!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Seu pagamento via Pix foi processado com sucesso. O curso <strong>"{course?.title}"</strong> já foi totalmente liberado em sua conta!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate(`/courseDetails/${course?.id}`)}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1rem', textTransform: 'none', borderRadius: 2 }}
            >
              Começar a Estudar Agora
            </Button>
          </Paper>
        </Box>
      ) : status === 'error' ? (
        <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center', mt: 4 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 5, borderRadius: 4, border: '1px solid #fee2e2', bgcolor: '#fef2f2' }}>
            <ErrorOutlineIcon sx={{ fontSize: 72, color: '#ef4444', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#991b1b' }}>
              Erro no Checkout
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {errorMsg || 'Não foi possível carregar as informações do seu pedido de compra.'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/courses')}
                sx={{ py: 1.2, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Catálogo de Cursos
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={fetchTransactionAndCourse}
                sx={{ py: 1.2, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Tentar Novamente
              </Button>
            </Stack>
          </Paper>
        </Box>
      ) : (
        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          {/* LEFT COLUMN: Payment Pix details */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PixIcon sx={{ color: '#32bcad', fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    Pagamento Instantâneo Pix
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liberação imediata assim que o pagamento for detectado.
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                Escaneie o QR Code abaixo usando o aplicativo do seu banco para aprovar o pagamento.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    bgcolor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    mb: 2,
                  }}
                >
                  {qrCodeUrl ? (
                    <Box component="img" src={qrCodeUrl} alt="QR Code Pix" sx={{ width: 220, height: 220, display: 'block' }} />
                  ) : (
                    <Box sx={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={30} />
                    </Box>
                  )}
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                  <CircularProgress size={14} color="inherit" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Aguardando confirmação do pagamento...
                  </Typography>
                </Stack>
                
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', wordBreak: 'break-all', textAlign: 'center', px: 2 }}>
                  ID da Transação: {transactionID}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Pix Simulation (Checkout Debugger) */}
              <Box sx={{ p: 2.5, bgcolor: '#f0fdf4', borderRadius: 3, border: '1px dashed #bbf7d0' }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <QrCodeScannerIcon sx={{ color: '#15803d' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#166534' }}>
                    Simulador Integrado do Celular
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Para fins de teste e demonstração local, clique no botão abaixo para simular o escaneamento do QR Code pelo celular. Isso ativa a matrícula imediatamente no banco de dados.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={simulating}
                  onClick={handleSimulatePayment}
                  startIcon={simulating ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}
                >
                  {simulating ? 'Processando Simulação...' : 'Simular Escaneamento do QR Code'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #e5e7eb', bgcolor: '#f9fafb' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#111827' }}>
                Resumo da Compra
              </Typography>

              {course && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <CardMedia
                    component="img"
                    image={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
                    alt={course.title}
                    sx={{ width: 90, height: 60, borderRadius: 1.5, objectFit: 'cover' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111827', lineHeight: 1.3 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Acesso por {course.access_duration_days} dias
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal do curso
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    R$ {course ? course.price.toFixed(2).replace('.', ',') : '0,00'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Taxa do Gateway (Simulado)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                    Grátis
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111827' }}>
                    Total a pagar
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    R$ {course ? course.price.toFixed(2).replace('.', ',') : '0,00'}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <SecurityIcon sx={{ fontSize: 20 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  Ambiente de checkout 100% criptografado e seguro. Liberação vitalícia integrada ao banco local.
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArrowBackIcon />}
                fullWidth
                onClick={() => navigate('/courses')}
                sx={{ mt: 4, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Desistir e voltar ao catálogo
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}
