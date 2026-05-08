import { Paper, Box, Typography, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import LogoIcon from './icons/LogoIcon'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        px: { xs: 2, sm: 3 },
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: '#FFFFFF',
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Stack direction="column" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
          <LogoIcon sx={{ fontSize: 44, mb: 0.5 }} />
          <Typography
            component="h2"
            variant="h5"
            sx={{ color: 'text.primary', letterSpacing: '-0.01em', fontWeight: 600 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography component="p" variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Paper>
    </Box>
  )
}

export default AuthCard
