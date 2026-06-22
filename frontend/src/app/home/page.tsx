
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router-dom";

export default function HomePage() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",

        backgroundImage:
          "url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1920&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255,255,255,0.82)",
        }}
      />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.05,
              mb: 3,

              fontSize: {
                xs: "3rem",
                sm: "4rem",
                md: "5rem",
              },
            }}
          >
            Aprenda com
            Especialistas da Industria
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              fontSize: {
                xs: "1rem",
                md: "1.1rem",
              },
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            junte-se a milhares de alunos e profissionais que estão transformando 
            suas carreiras com nossos cursos online de alta qualidade, ministrados 
            por especialistas do setor.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexWrap: "wrap",
            }}
          >
            <Button
              component={RouterLink}
              to="/courses"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,

                backgroundColor: "#A23A0E",

                "&:hover": {
                  backgroundColor: "#8A2F0B",
                },
              }}
            >
              Buscar Cursos
            </Button>

            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,

                borderColor: "#D1D5DB",
                color: "#374151",

                "&:hover": {
                  borderColor: "#9CA3AF",
                  backgroundColor: "white",
                },
              }}
            >
              Começar Agora
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}