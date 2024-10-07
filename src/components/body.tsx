"use client";
import React from "react";
import {
  Typography,
  Container,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid2 as Grid,
} from "@mui/material";
import { Home, Car, Briefcase, Heart, Check } from "lucide-react";

const insuranceTypes = [
  {
    title: "Seguro de Hogar",
    icon: <Home />,
    description: "Protegé tu hogar y pertenencias",
  },
  {
    title: "Seguro de Auto",
    icon: <Car />,
    description: "Cobertura integral para tus vehículos",
  },
  {
    title: "Seguro de Vida",
    icon: <Heart />,
    description: "Asegurá el futuro financiero de tu familia",
  },
  {
    title: "Seguro de Negocios",
    icon: <Briefcase />,
    description: "Protegé las operaciones de tu negocio",
  },
];

const razonesList = [
  "Cobertura personalizada adaptada a tus necesidades",
  "Tarifas competitivas y opciones de pago flexibles",
  "Soporte de reclamaciones 24/7",
  "Agente experimentado y conocedor",
  "Descuentos disponibles para múltiples pólizas",
];

export default function Body() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      vehicleMake: formData.get("vehicleMake"),
      vehicleModel: formData.get("vehicleModel"),
      vehicleVersion: formData.get("vehicleVersion"),
      vehicleYear: formData.get("vehicleYear"),
      dni: formData.get("dni"),
    };

    const emailBody = `
    Solicitud de Cotización:

    Nombre: ${fData.name}
    Email: ${fData.email}
    Teléfono: ${fData.phone}
    DNI: ${fData.dni}
    
    Vehículo:
    Marca: ${fData.vehicleMake}
    Modelo: ${fData.vehicleModel}
    Versión: ${fData.vehicleVersion}
    Año: ${fData.vehicleYear}
    
    Mensaje adicional:
    ${fData.message}
  `;
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: process.env.EMAIL_TO_SEND,
          subject: "Cotizacion solicitada",
          text: emailBody,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Correo enviado correctamente");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error enviando el correo:", error);
    }
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
            PROTEGÉ LO QUE MÁS IMPORTA
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Soluciones de seguros integrales adaptadas a tus necesidades
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => scrollToAbout("contact-section")}
          >
            Obtené tu cotización
          </Button>
        </Container>
      </Box>
      {/* Main Content */}
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
        {/* About me Section */}
        <Box sx={{ mb: 4 }} id="about-section">
          <Typography variant="h2" component="h2" gutterBottom>
            Acerca de Javier Zarate
          </Typography>
          <Typography variant="body1" component="p">
            Soy Javier Zarate y estuve protegiendo hogares, familias, autos y
            negocios por más de 25 años. Estoy dedicado a encontrar la cobertura
            adecuada para tus necesidades.
          </Typography>
          <Typography variant="body1" component="p">
            Me destaco por mi enfoque personalizado, tarifas competitivas y
            servicio al cliente excepcional. Conmigo, no sos solo un número de
            póliza, sos parte de una familia.
          </Typography>
        </Box>

        {/* Why Choose Us Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            ¿Por qué elegir a Javier Zarate?
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            <List>
              {razonesList.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Check color={"secondary.main"} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Insurance Types Section */}
        <Box sx={{ mb: 8 }} id="services-section">
          <Typography variant="h2" component="h2" gutterBottom>
            Servicios de Seguros
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
                ¿Listo para asegurar tu tranquilidad? Llená el siguiente
                formulario rápido y me voy a poner en contacto con vos. Estoy
                acá para responder cualquier pregunta y ayudarte a encontrar la
                cobertura perfecta para tus necesidades.
              </Typography>
              <Typography variant="body1" component="p">
                ¡No esperes hasta que sea demasiado tarde! Protegete a vos, a
                tus seres queridos y tus bienes con Javier Zarate.
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
                        label="Versión del Vehículo"
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
    </Box>
  );
}
