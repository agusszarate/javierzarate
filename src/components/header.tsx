"use client";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Correct import for MenuIcon
import React, { useState } from "react";
import { ComponentProps } from "@/app/dto/component.dto";

const Header: React.FC<ComponentProps> = ({ scrollTo }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Javier Zarate
          </Typography>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Button
              color="inherit"
              onClick={() => {
                scrollTo("about-section");
              }}
            >
              Acerca de
            </Button>
            <Button
              color="inherit"
              onClick={() => scrollTo("services-section")}
            >
              Servicios
            </Button>
            <Button color="inherit" onClick={() => scrollTo("contact-section")}>
              Cotizar
            </Button>
          </Box>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
        }}
      >
        <List
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <ListItem
            sx={{ justifyContent: "center", textAlign: "center" }}
            onClick={() => scrollTo("about-section")}
          >
            <ListItemText primary="Acerca de" />
          </ListItem>
          <ListItem
            component="li"
            sx={{ justifyContent: "center", textAlign: "center" }}
            onClick={() => scrollTo("services-section")}
          >
            <ListItemText primary="Servicios" />
          </ListItem>
          <ListItem
            sx={{ justifyContent: "center", textAlign: "center" }}
            onClick={() => scrollTo("contact-section")}
          >
            <ListItemText primary="Contacto" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar />
    </>
  );
};

export default Header;
