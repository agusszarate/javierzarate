"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Link,
  Grid2 as Grid,
  Fab,
} from "@mui/material";
import { Shield, Home, Car, Briefcase, Heart, Check } from "lucide-react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0",
    },
    secondary: {
      main: "#00897b",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
    },
  },
});

const insuranceTypes = [
  {
    title: "Seguro de Hogar",
    icon: <Home />,
    description: "Protege tu hogar y pertenencias",
  },
  {
    title: "Seguro de Auto",
    icon: <Car />,
    description: "Cobertura integral para tus vehículos",
  },
  {
    title: "Seguro de Vida",
    icon: <Heart />,
    description: "Asegura el futuro financiero de tu familia",
  },
  {
    title: "Seguro de Negocios",
    icon: <Briefcase />,
    description: "Protege las operaciones de tu negocio",
  },
];

const razonesList = [
  "Cobertura personalizada adaptada a tus necesidades",
  "Tarifas competitivas y opciones de pago flexibles",
  "Soporte de reclamaciones 24/7",
  "Agentes experimentados y conocedores",
  "Descuentos disponibles para múltiples pólizas",
];

export default function EnhancedInsuranceLandingPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Formulario enviado");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAbout = (sectionName: string) => {
    const sectionId = document.getElementById(sectionName);
    const headerOffset = 94;
    const elementPosition = sectionId?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              Javier Zarate
            </Typography>
            <Button
              color="inherit"
              onClick={() => scrollToAbout("services-section")}
            >
              Servicios
            </Button>
            <Button
              color="inherit"
              onClick={() => {
                scrollToAbout("about-section");
              }}
            >
              Acerca de
            </Button>
            <Button
              color="inherit"
              onClick={() => scrollToAbout("contact-section")}
            >
              Contacto
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {/* Hero Section */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 8,
            textAlign: "center",
          }}
        >
          <Container>
            <Typography variant="h1" component="h1" gutterBottom>
              Protege lo que más importa
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              Soluciones de seguros integrales adaptadas a tus necesidades
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 2 }}
            >
              Obtén una Cotización Gratis
            </Button>
          </Container>
        </Box>
        {/* Main Content */}
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
          {/* About Us Section */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Acerca de Javier Zarate
            </Typography>
            <Typography variant="body1" component="p">
              En Javier Zarate, hemos estado protegiendo a individuos, familias
              y negocios por más de 25 años. Nuestro equipo de agentes
              experimentados está dedicado a encontrar la cobertura adecuada
              para tus necesidades únicas.
            </Typography>
            <Typography variant="body1" component="p">
              Nos enorgullecemos de nuestro enfoque personalizado, tarifas
              competitivas y servicio al cliente excepcional. Con Javier Zarate,
              no eres solo un número de póliza, eres parte de nuestra familia.
            </Typography>
          </Box>

          {/* Insurance Types Section */}
          <Box sx={{ mb: 8 }} id="services-section">
            <Typography variant="h2" component="h2" gutterBottom>
              Nuestros Servicios de Seguros
            </Typography>
            <Grid container spacing={4}>
              {insuranceTypes.map((type, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card sx={{ height: "100%" }}>
                    <CardMedia
                      sx={{
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      {React.cloneElement(type.icon, { size: 64 })}
                    </CardMedia>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {type.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Why Choose Us Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              id="about-section"
            >
              ¿Por qué elegir a Javier Zarate?
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
              <List>
                {razonesList.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <Check color={theme.palette.secondary.main} />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Contact Form Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              id={"contact-section"}
            >
              Solicitar cotización
            </Typography>
            <Grid container spacing={4}>
              <Grid size={12}>
                <Typography variant="body1" component="p">
                  ¿Listo para asegurar tu tranquilidad? Llena el siguiente
                  formulario rápido y me pondre en contacto contigo. Estoy aquí
                  para responder cualquier pregunta y ayudarte a encontrar la
                  cobertura perfecta para tus necesidades.
                </Typography>
                <Typography variant="body1" component="p">
                  No esperes hasta que sea demasiado tarde. Protege a ti mismo,
                  a tus seres queridos y tus bienes con Javier Zarate.
                </Typography>
              </Grid>
              <Grid size={12}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          Datos de Contacto
                        </Typography>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="name"
                          label="Nombre Completo"
                          name="name"
                          autoComplete="name"
                          autoFocus
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="email"
                          label="Correo Electrónico"
                          name="email"
                          autoComplete="email"
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          name="phone"
                          label="Número de Teléfono"
                          type="tel"
                          id="phone"
                          autoComplete="tel"
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          name="message"
                          label="Mensaje (Opcional)"
                          id="message"
                          multiline
                          rows={4.5}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          Datos para la Cotización
                        </Typography>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="vehicleMake"
                          label="Marca del Vehículo"
                          name="vehicleMake"
                          autoComplete="vehicle-make"
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="vehicleModel"
                          label="Modelo del Vehículo"
                          name="vehicleModel"
                          autoComplete="vehicle-model"
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="vehicleVersioon"
                          label="Version del Vehículo"
                          name="vehicleVersion"
                          autoComplete="vehicle-Version"
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="vehicleYear"
                          label="Año del Vehículo"
                          name="vehicleYear"
                          autoComplete="vehicle-year"
                        />
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="dni"
                          label="DNI del propietario"
                          name="dni"
                          autoComplete="dni"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="secondary"
                      size="large"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Solicitar Cotización
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={2}
              justifyContent="center"
              textAlign="left"
            >
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Javier Zarate
                </Typography>
                <Typography variant="body2">
                  Protegiendo lo que más importa desde 1998.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contáctanos
                </Typography>
                <Typography variant="body2">
                  Calle de los Seguros 123
                  <br />
                  Ciudad Segura, ST 12345
                  <br />
                  (555) 123-4567
                  <br />
                  info@safeguardinsurance.com
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Enlaces Rápidos
                </Typography>
                <Typography
                  variant="body2"
                  onClick={scrollToTop}
                  sx={{ cursor: "pointer" }}
                >
                  Inicio
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => scrollToAbout("services-section")}
                  sx={{ cursor: "pointer" }}
                >
                  Servicios
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => scrollToAbout("about-section")}
                  sx={{ cursor: "pointer" }}
                >
                  Acerca de
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => scrollToAbout("contact-section")}
                  sx={{ cursor: "pointer" }}
                >
                  Contacto
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Seguime
                </Typography>
                <Typography variant="body2">
                  <Link href="#" color="inherit" display="block">
                    LinkedIn
                  </Link>
                  <Link href="#" color="inherit" display="block">
                    Instagram
                  </Link>
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="body2" align="center" sx={{ mt: 4 }}>
              © {new Date().getFullYear()} Javier Zarate. Todos los derechos
              reservados.
            </Typography>
          </Container>
        </Box>
        {/* Scroll to Top Button */}
        <Fab
          color="secondary"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Box>
    </ThemeProvider>
  );
}
