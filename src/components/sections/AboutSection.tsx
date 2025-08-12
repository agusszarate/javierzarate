'use client'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Clock, Users, Award, Heart } from 'lucide-react'

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Cobertura personalizada",
    description: "Adaptada a tus necesidades específicas"
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Soporte 24/7",
    description: "Atención para reclamaciones en cualquier momento"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Servicio personalizado",
    description: "No sos solo un número de póliza"
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: "Tarifas competitivas",
    description: "Los mejores precios del mercado"
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "25+ años de experiencia",
    description: "Protegiendo familias y negocios"
  }
]

export function AboutSection() {
  return (
    <section id="about-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Acerca de Javier Zarate
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              Soy Javier Zarate y estuve protegiendo hogares, familias, autos y
              negocios por más de 25 años. Estoy dedicado a encontrar la cobertura
              adecuada para tus necesidades.
            </p>
            <p className="text-lg text-muted-foreground">
              Me destaco por mi enfoque personalizado, tarifas competitivas y servicio
              al cliente excepcional. Conmigo, no sos solo un número de póliza, sos
              parte de una familia.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-12">
            ¿Por qué elegir a Javier Zarate?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}