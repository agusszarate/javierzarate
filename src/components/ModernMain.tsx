'use client'
import React from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ModernHeader } from '@/components/layout/ModernHeader'
import { ModernFooter } from '@/components/layout/ModernFooter'
import { ModernQuoteForm } from '@/components/forms/ModernQuoteForm'

export default function ModernMain() {
    const scrollTo = (sectionName: string) => {
        const sectionId = document.getElementById(sectionName)
        const headerOffset = 80 // Adjusted for fixed header
        const elementPosition = sectionId?.getBoundingClientRect().top || 0
        const offsetPosition = elementPosition + window.scrollY - headerOffset

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
        })
    }

    const scrollToQuote = () => {
        scrollTo('quote-section')
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ModernHeader onScrollTo={scrollTo} />
            
            {/* Add top padding to account for fixed header */}
            <main className="pt-16">
                <HeroSection onScrollToQuote={scrollToQuote} />
                <AboutSection />
                <ServicesSection />
                
                {/* Modern Quote Section */}
                <section id="quote-section" className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Solicitar Cotización
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Completa el formulario y recibe tu cotización personalizada. 
                                Para motos y cuatriciclos, obtén una cotización instantánea.
                            </p>
                        </div>
                        
                        <ModernQuoteForm />
                    </div>
                </section>
            </main>
            
            <ModernFooter onScrollTo={scrollTo} />
        </div>
    )
}