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

const Footer: React.FC<ComponentProps> = ({ scrollTo }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
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
            textAlign="center"
          >
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h6" gutterBottom>
                Javier Zarate
              </Typography>
              <Typography variant="body2">
                Protegiendo lo que más importa desde 1999.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contactame
              </Typography>
              <Typography variant="body2">
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
              <Typography variant="h6" gutterBottom>
                Enlaces Rápidos
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={scrollToTop}
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  Inicio
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("about-section")}
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  Acerca de
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("services-section")}
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  Servicios
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  color="inherit"
                  onClick={() => scrollTo("contact-section")}
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  Contacto
                </Link>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h6" gutterBottom>
                Seguime
              </Typography>
              <Typography variant="body2">
                <Link
                  href="https://www.linkedin.com/in/javier-z%C3%A1rate-b1911a78/"
                  color="inherit"
                  display="block"
                  target="_blank"
                  sx={{ cursor: "pointer", textDecoration: "none" }}
                >
                  LinkedIn
                </Link>
                {/* <Link href="#" color="inherit" display="block">
                    Instagram
                  </Link> */}
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
    </>
  );
};

export default Footer;
