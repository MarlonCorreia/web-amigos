import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import { apiRequest } from '../../api/client'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function PaymentPage() {
  const { transactionID } = useParams<{ transactionID: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('idle')

  async function handleApprove() {
    setStatus('loading')
    try {
      await apiRequest('/webhooks/gateway', {
        method: 'POST',
        body: JSON.stringify({ transaction_id: transactionID }),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          {status === 'success' ? (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Pagamento aprovado!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Seu acesso ao curso foi liberado.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/courses')}>
                Ver meus cursos
              </Button>
            </>
          ) : status === 'error' ? (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Falha no pagamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Não foi possível processar o pagamento. Tente novamente.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => setStatus('idle')}>
                Tentar novamente
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Confirmar Pagamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Clique abaixo para aprovar o pagamento e liberar o acesso ao curso.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Transação: {transactionID}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                disabled={status === 'loading'}
                onClick={handleApprove}
                startIcon={status === 'loading' ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {status === 'loading' ? 'Processando...' : 'Aprovar Pagamento'}
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  )
}
