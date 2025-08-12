'use client'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Car, Briefcase, Heart, Bike } from 'lucide-react'

const services = [
  {
    title: 'Seguro de Moto',
    icon: <Bike className="w-8 h-8" />,
    description: 'Cobertura integral para motocicletas y cuatriciclos',
    features: ['Cotización automática', 'Activar.app integrado', 'Seguro por días'],
    highlighted: true
  },
  {
    title: 'Seguro de Auto',
    icon: <Car className="w-8 h-8" />,
    description: 'Protección completa para tu vehículo',
    features: ['Cobertura integral', 'Terceros completos', 'Responsabilidad civil']
  },
  {
    title: 'Seguro de Hogar',
    icon: <Home className="w-8 h-8" />,
    description: 'Protegé tu hogar y pertenencias',
    features: ['Incendio y robo', 'Responsabilidad civil', 'Cristales']
  },
  {
    title: 'Seguro de Vida',
    icon: <Heart className="w-8 h-8" />,
    description: 'Asegurá el futuro financiero de tu familia',
    features: ['Muerte natural', 'Muerte accidental', 'Invalidez total']
  },
  {
    title: 'Seguro de Negocios',
    icon: <Briefcase className="w-8 h-8" />,
    description: 'Protegé las operaciones de tu negocio',
    features: ['Responsabilidad civil', 'Incendio comercial', 'Robo y hurto']
  }
]

export function ServicesSection() {
  return (
    <section id="services-section" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Servicios de Seguros
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos una amplia gama de seguros para proteger lo que más te importa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                service.highlighted 
                  ? 'border-secondary bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-lg' 
                  : 'hover:shadow-lg'
              }`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    service.highlighted 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">
                    {service.title}
                    {service.highlighted && (
                      <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {service.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                          service.highlighted ? 'bg-secondary' : 'bg-primary'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}