'use client'
import React from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Body from '@/components/body'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ModernMain from '@/components/ModernMain'

const theme = createTheme({
    palette: {
        primary: {
            main: '#023269',
        },
        secondary: {
            main: '#11a636',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 600,
        },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: { defaultProps: { disableElevation: true } },
        MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    },
})

export default function Main() {
    // Feature flag for modern version - set to true to use new shadcn/ui version
    const useModernVersion = true

    const scrollTo = (sectionName: string) => {
        const sectionId = document.getElementById(sectionName)
        const headerOffset = useModernVersion ? 80 : 94
        const elementPosition = sectionId?.getBoundingClientRect().top || 0
        const offsetPosition = elementPosition + window.scrollY - headerOffset

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
        })
    }

    if (useModernVersion) {
        return <ModernMain />
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header scrollTo={scrollTo} />
            <Body />
            <Footer scrollTo={scrollTo} />
        </ThemeProvider>
    )
}
