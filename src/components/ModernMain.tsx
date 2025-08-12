'use client'
import React from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ModernHeader } from '@/components/layout/ModernHeader'
import { ModernFooter } from '@/components/layout/ModernFooter'

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
                
                {/* Quote Section Placeholder - Will be replaced with modern form */}
                <section id="quote-section" className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Solicitar Cotización
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Completa el formulario y recibe tu cotización personalizada
                            </p>
                        </div>
                        
                        {/* This will be replaced with the modernized quote form */}
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 text-center">
                                <p className="text-muted-foreground">
                                    🚧 Modern Quote Form Component - Coming in Phase 4
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This will replace the current 990+ line form with a modern, modular component
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <ModernFooter onScrollTo={scrollTo} />
        </div>
    )
}