'use client'
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
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import { ComponentProps } from '@/types/common'

const Header: React.FC<ComponentProps> = ({ scrollTo }) => {
    const [mobileOpen, setMobileOpen] = useState<boolean>(false)
    const [elev, setElev] = useState(0)
    useEffect(() => {
        const onScroll = () => setElev(window.scrollY > 4 ? 4 : 0)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])
    return (
        <>
            <AppBar position="fixed" color="primary" elevation={elev}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 'bold' }}
                    >
                        Javier Zarate
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button
                            color="inherit"
                            onClick={() => {
                                scrollTo('about-section')
                            }}
                        >
                            Acerca de
                        </Button>
                        <Button color="inherit" onClick={() => scrollTo('services-section')}>
                            Servicios
                        </Button>
                        <Button color="inherit" onClick={() => scrollTo('contact-section')}>
                            Pedir cotizacion
                        </Button>
                    </Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
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
                    display: { xs: 'block', sm: 'none' },
                }}
            >
                <List
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                    }}
                >
                    <ListItem
                        sx={{ justifyContent: 'center', textAlign: 'center' }}
                        onClick={() => scrollTo('about-section')}
                    >
                        <ListItemText primary="Acerca de" />
                    </ListItem>
                    <ListItem
                        component="li"
                        sx={{ justifyContent: 'center', textAlign: 'center' }}
                        onClick={() => scrollTo('services-section')}
                    >
                        <ListItemText primary="Servicios" />
                    </ListItem>
                    <ListItem
                        sx={{ justifyContent: 'center', textAlign: 'center' }}
                        onClick={() => scrollTo('contact-section')}
                    >
                        <ListItemText primary="Pedir cotizacion" />
                    </ListItem>
                </List>
            </Drawer>
            <Toolbar />
        </>
    )
}

export default Header
