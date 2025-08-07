"use client";
import React from "react";
import {
  Typography,
  Container,
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
  Grow,
  Fade,
  Slide,
  Zoom,
} from "@mui/material";
import { Home, Car, Briefcase, Heart, Check } from "lucide-react";
import Form from "./form";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const insuranceTypes = [
  {
    title: "Seguro de Auto",
    icon: <Car />,
    description: "Cobertura integral para tus vehículos",
  },
  {
    title: "Seguro de Hogar",
    icon: <Home />,
    description: "Protegé tu hogar y pertenencias",
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
  const heroAnimation = useScrollAnimation(0.1, 100);
  const aboutAnimation = useScrollAnimation(0.1, 200);
  const whyChooseAnimation = useScrollAnimation(0.1, 300);
  const servicesAnimation = useScrollAnimation(0.1, 400);

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
        ref={heroAnimation.ref}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container>
          <Fade in={heroAnimation.inView} timeout={600}>
            <Typography variant="h1" component="h1" gutterBottom>
              PROTEGÉ LO QUE MÁS IMPORTA
            </Typography>
          </Fade>
          <Fade in={heroAnimation.inView} timeout={800} style={{ transitionDelay: '200ms' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Soluciones de seguros integrales adaptadas a tus necesidades
            </Typography>
          </Fade>
          <Zoom in={heroAnimation.inView} timeout={600} style={{ transitionDelay: '400ms' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                mt: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                }
              }}
              onClick={() => scrollToAbout("contact-section")}
            >
              Obtené tu cotización
            </Button>
          </Zoom>
        </Container>
      </Box>
      {/* Main Content */}
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
        {/* About me Section */}
        <Box 
          ref={aboutAnimation.ref}
          sx={{ mb: 4 }} 
          id="about-section"
        >
          <Slide direction="right" in={aboutAnimation.inView} timeout={600}>
            <Typography variant="h2" component="h2" gutterBottom>
              Acerca de Javier Zarate
            </Typography>
          </Slide>
          <Fade in={aboutAnimation.inView} timeout={800} style={{ transitionDelay: '200ms' }}>
            <Typography variant="body1" component="p">
              Soy Javier Zarate y estuve protegiendo hogares, familias, autos y
              negocios por más de 25 años. Estoy dedicado a encontrar la cobertura
              adecuada para tus necesidades.
            </Typography>
          </Fade>
          <Fade in={aboutAnimation.inView} timeout={800} style={{ transitionDelay: '400ms' }}>
            <Typography variant="body1" component="p">
              Me destaco por mi enfoque personalizado, tarifas competitivas y
              servicio al cliente excepcional. Conmigo, no sos solo un número de
              póliza, sos parte de una familia.
            </Typography>
          </Fade>
        </Box>

        {/* Why Choose Us Section */}
        <Box 
          ref={whyChooseAnimation.ref}
          sx={{ mb: 8 }}
        >
          <Slide direction="left" in={whyChooseAnimation.inView} timeout={600}>
            <Typography variant="h2" component="h2" gutterBottom>
              ¿Por qué elegir a Javier Zarate?
            </Typography>
          </Slide>
          <Grow in={whyChooseAnimation.inView} timeout={800} style={{ transitionDelay: '200ms' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <List>
                {razonesList.map((item, index) => (
                  <React.Fragment key={index}>
                    <Fade 
                      in={whyChooseAnimation.inView} 
                      timeout={600}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <ListItem>
                        <ListItemIcon>
                          <Check color={"secondary.main"} />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    </Fade>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grow>
        </Box>

        {/* Insurance Types Section */}
        <Box 
          ref={servicesAnimation.ref}
          sx={{ mb: 8 }} 
          id="services-section"
        >
          <Fade in={servicesAnimation.inView} timeout={600}>
            <Typography variant="h2" component="h2" gutterBottom>
              Servicios de Seguros
            </Typography>
          </Fade>
          <Grid container spacing={4}>
            {insuranceTypes.map((type, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Zoom 
                  in={servicesAnimation.inView} 
                  timeout={600}
                  style={{ transitionDelay: `${200 + index * 150}ms` }}
                >
                  <Card 
                    sx={{ 
                      height: "100%",
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardMedia
                      sx={{
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: "primary.dark",
                        }
                      }}
                    >
                      {React.cloneElement(type.icon, { 
                        size: 64,
                        style: { 
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
                      })}
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
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Form Section */}
        <Form />
      </Container>
    </Box>
  );
}
