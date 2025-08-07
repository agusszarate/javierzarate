import React from "react";
import {
  Box,
  Container,
  Grid2 as Grid,
  Typography,
  Link,
  Fab,
  Fade,
  Slide,
} from "@mui/material";
import { ArrowUpward as ArrowUpwardIcon } from "@mui/icons-material";
import { ComponentProps } from "@/app/dto/component.dto";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Footer: React.FC<ComponentProps> = ({ scrollTo }) => {
  const footerAnimation = useScrollAnimation(0.1, 300);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* Footer */}
      <Box
        ref={footerAnimation.ref}
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
          <Fade in={footerAnimation.inView} timeout={800}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              textAlign="center"
            >
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="right" in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '100ms' }}>
                  <Typography variant="h6" gutterBottom>
                    Javier Zarate
                  </Typography>
                </Slide>
                <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '200ms' }}>
                  <Typography variant="body2">
                    Protegiendo lo que más importa desde 1999.
                  </Typography>
                </Fade>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="right" in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '200ms' }}>
                  <Typography variant="h6" gutterBottom>
                    Contactame
                  </Typography>
                </Slide>
                <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '300ms' }}>
                  <Typography variant="body2">
                    +54 11 6952-0847
                    <br />
                    javierzarateaseguros@gmail.com
                  </Typography>
                </Fade>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="left" in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '300ms' }}>
                  <Typography variant="h6" gutterBottom>
                    Enlaces Rápidos
                  </Typography>
                </Slide>
                <Typography variant="body2">
                  <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '400ms' }}>
                    <Link
                      color="inherit"
                      onClick={scrollToTop}
                      sx={{ 
                        cursor: "pointer", 
                        textDecoration: "none",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          color: 'secondary.main',
                        }
                      }}
                    >
                      Inicio
                    </Link>
                  </Fade>
                </Typography>
                <Typography variant="body2">
                  <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '500ms' }}>
                    <Link
                      color="inherit"
                      onClick={() => scrollTo("about-section")}
                      sx={{ 
                        cursor: "pointer", 
                        textDecoration: "none",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          color: 'secondary.main',
                        }
                      }}
                    >
                      Acerca de
                    </Link>
                  </Fade>
                </Typography>
                <Typography variant="body2">
                  <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '600ms' }}>
                    <Link
                      color="inherit"
                      onClick={() => scrollTo("services-section")}
                      sx={{ 
                        cursor: "pointer", 
                        textDecoration: "none",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          color: 'secondary.main',
                        }
                      }}
                    >
                      Servicios
                    </Link>
                  </Fade>
                </Typography>
                <Typography variant="body2">
                  <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '700ms' }}>
                    <Link
                      color="inherit"
                      onClick={() => scrollTo("contact-section")}
                      sx={{ 
                        cursor: "pointer", 
                        textDecoration: "none",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          color: 'secondary.main',
                        }
                      }}
                    >
                      Contacto
                    </Link>
                  </Fade>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Slide direction="left" in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '400ms' }}>
                  <Typography variant="h6" gutterBottom>
                    Seguime
                  </Typography>
                </Slide>
                <Typography variant="body2">
                  <Fade in={footerAnimation.inView} timeout={600} style={{ transitionDelay: '800ms' }}>
                    <Link
                      href="https://www.linkedin.com/in/javier-z%C3%A1rate-b1911a78/"
                      color="inherit"
                      display="block"
                      target="_blank"
                      sx={{ 
                        cursor: "pointer", 
                        textDecoration: "none",
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          color: 'secondary.main',
                        }
                      }}
                    >
                      LinkedIn
                    </Link>
                  </Fade>
                </Typography>
              </Grid>
            </Grid>
          </Fade>
          <Fade in={footerAnimation.inView} timeout={800} style={{ transitionDelay: '900ms' }}>
            <Typography variant="body2" align="center" sx={{ mt: 4 }}>
              © {new Date().getFullYear()} Javier Zarate. Todos los derechos
              reservados.
            </Typography>
          </Fade>
        </Container>
      </Box>
      {/* Scroll to Top Button */}
      <Fab
        color="secondary"
        aria-label="scroll back to top"
        onClick={scrollToTop}
        sx={{ 
          position: "fixed", 
          bottom: 16, 
          right: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.1)',
            boxShadow: 8,
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.05)',
          },
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-10px)' },
            '60%': { transform: 'translateY(-5px)' },
          },
          animation: 'bounce 2s infinite ease-in-out',
        }}
      >
        <ArrowUpwardIcon />
      </Fab>
    </>
  );
};

export default Footer;
