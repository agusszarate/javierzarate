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
  Slide,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
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
            sx={{ 
              flexGrow: 1, 
              fontWeight: "bold",
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            Javier Zarate
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              color="inherit"
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => {
                scrollTo("about-section");
              }}
            >
              Acerca de
            </Button>
            <Button
              color="inherit"
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => scrollTo("services-section")}
            >
              Servicios
            </Button>
            <Button 
              color="inherit" 
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => scrollTo("contact-section")}
            >
              Pedir cotizacion
            </Button>
          </Box>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton
              color="inherit"
              edge="start"
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'rotate(90deg)',
                }
              }}
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
          display: { xs: "block", sm: "none" },
        }}
        SlideProps={{
          direction: "down"
        }}
      >
        <Slide direction="down" in={mobileOpen} mountOnEnter unmountOnExit>
          <List
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <ListItem
              sx={{ 
                justifyContent: "center", 
                textAlign: "center",
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => {
                scrollTo("about-section");
                setMobileOpen(false);
              }}
            >
              <ListItemText primary="Acerca de" />
            </ListItem>
            <ListItem
              component="li"
              sx={{ 
                justifyContent: "center", 
                textAlign: "center",
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => {
                scrollTo("services-section");
                setMobileOpen(false);
              }}
            >
              <ListItemText primary="Servicios" />
            </ListItem>
            <ListItem
              sx={{ 
                justifyContent: "center", 
                textAlign: "center",
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => {
                scrollTo("contact-section");
                setMobileOpen(false);
              }}
            >
              <ListItemText primary="Pedir cotizacion" />
            </ListItem>
          </List>
        </Slide>
      </Drawer>
      <Toolbar />
    </>
  );
};

export default Header;
