'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface HeroSectionProps {
  onScrollToQuote: () => void
}

export function HeroSection({ onScrollToQuote }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgba(255,255,255,0.05)"><path d="M0 .5H31.5V32"/></svg>')] opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Protegé Lo Que{' '}
            <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
              Más Importa
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Cotizá tu seguro de moto en segundos con nuestro sistema automático
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onScrollToQuote}
              className="text-lg px-8 py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Cotizar Ahora
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Cotización Instantánea</h3>
                <p className="text-sm text-primary-foreground/80">Resultados en segundos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold mb-1">Cobertura Completa</h3>
                <p className="text-sm text-primary-foreground/80">Múltiples opciones</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="font-semibold mb-1">25+ Años</h3>
                <p className="text-sm text-primary-foreground/80">De experiencia</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}