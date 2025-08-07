import React from "react";
import {
  Box,
  Container,
  Grid2 as Grid,
  Typography,
  Link,
  Fab,
} from "@mui/material";
import { ArrowUpward as ArrowUpwardIcon } from "@mui/icons-material";
import { ComponentProps } from "@/app/dto/component.dto";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Footer: React.FC<ComponentProps> = ({ scrollTo }) => {
  const footerAnimation = useScrollAnimation(0.1);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* Footer */}
      <Box
        ref={footerAnimation.ref}
        component="footer"
        className={`fade-in ${footerAnimation.isVisible ? 'visible' : ''}`}
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
            textAlign="center"
          >
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                className={`slide-in-left delay-1 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                Javier Zarate
              </Typography>
              <Typography 
                variant="body2"
                className={`fade-in delay-2 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                Protegiendo lo que más importa desde 1999.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                className={`slide-in-left delay-2 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                Contactame
              </Typography>
              <Typography 
                variant="body2"
                className={`fade-in delay-3 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                {/* Calle de los Seguros 123
                  <br />
                  Ciudad Segura, ST 12345
                  <br /> */}
                +54 11 6952-0847
                <br />
                javierzarateaseguros@gmail.com
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                className={`slide-in-right delay-3 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                Enlaces Rápidos
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={scrollToTop}
                  sx={{ 
                    cursor: "pointer", 
                    textDecoration: "none",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: 'secondary.main',
                    }
                  }}
                  className={`fade-in delay-4 ${footerAnimation.isVisible ? 'visible' : ''}`}
                >
                  Inicio
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("about-section")}
                  sx={{ 
                    cursor: "pointer", 
                    textDecoration: "none",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: 'secondary.main',
                    }
                  }}
                  className={`fade-in delay-5 ${footerAnimation.isVisible ? 'visible' : ''}`}
                >
                  Acerca de
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("services-section")}
                  sx={{ 
                    cursor: "pointer", 
                    textDecoration: "none",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: 'secondary.main',
                    }
                  }}
                  className={`fade-in delay-6 ${footerAnimation.isVisible ? 'visible' : ''}`}
                >
                  Servicios
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("contact-section")}
                  sx={{ 
                    cursor: "pointer", 
                    textDecoration: "none",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: 'secondary.main',
                    }
                  }}
                  className={`fade-in delay-7 ${footerAnimation.isVisible ? 'visible' : ''}`}
                >
                  Contacto
                </Link>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                className={`slide-in-right delay-4 ${footerAnimation.isVisible ? 'visible' : ''}`}
              >
                Seguime
              </Typography>
              <Typography variant="body2">
                <Link
                  href="https://www.linkedin.com/in/javier-z%C3%A1rate-b1911a78/"
                  color="inherit"
                  display="block"
                  target="_blank"
                  sx={{ 
                    cursor: "pointer", 
                    textDecoration: "none",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: 'secondary.main',
                    }
                  }}
                  className={`fade-in delay-8 ${footerAnimation.isVisible ? 'visible' : ''}`}
                >
                  LinkedIn
                </Link>
                {/* <Link href="#" color="inherit" display="block">
                    Instagram
                  </Link> */}
              </Typography>
            </Grid>
          </Grid>
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ mt: 4 }}
            className={`fade-in delay-9 ${footerAnimation.isVisible ? 'visible' : ''}`}
          >
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
        sx={{ 
          position: "fixed", 
          bottom: 16, 
          right: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.1)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.05)',
          },
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-10px)' },
            '60%': { transform: 'translateY(-5px)' },
          }
        }}
      >
        <ArrowUpwardIcon />
      </Fab>
    </>
  );
};

export default Footer;
