'use client'
import { motion } from 'framer-motion'
import { Shield, Mail, Phone, MapPin, Clock } from 'lucide-react'

interface ModernFooterProps {
  onScrollTo: (sectionName: string) => void
}

export function ModernFooter({ onScrollTo }: ModernFooterProps) {
  const handleNavClick = (sectionName: string) => {
    if (sectionName === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onScrollTo(sectionName)
    }
  }

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Javier Zarate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Más de 25 años protegiendo familias y negocios con seguros personalizados 
              y un servicio excepcional.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-semibold">Enlaces Rápidos</h3>
            <nav className="space-y-2">
              {[
                { label: 'Inicio', section: 'hero' },
                { label: 'Acerca de', section: 'about-section' },
                { label: 'Servicios', section: 'services-section' },
                { label: 'Cotizar', section: 'quote-section' },
              ].map((link) => (
                <button
                  key={link.section}
                  onClick={() => handleNavClick(link.section)}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-semibold">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">contacto@javierzarate.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Buenos Aires, Argentina</span>
              </div>
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="font-semibold">Horarios</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Lun - Vie: 9:00 - 18:00</p>
                  <p className="text-muted-foreground">Sáb: 9:00 - 13:00</p>
                  <p className="text-muted-foreground">Dom: Cerrado</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-secondary">Emergencias 24/7</p>
              <p>Para reclamaciones urgentes</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Javier Zarate - Productor de Seguros. 
            Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sitio web desarrollado para brindar el mejor servicio en seguros
          </p>
        </motion.div>
      </div>
    </footer>
  )
}