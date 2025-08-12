'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { CheckCircle, Star, Shield, Clock, Loader2 } from 'lucide-react'

export function QuoteResults() {
  const { state, actions } = useQuoteForm()
  const [confirmingContact, setConfirmingContact] = useState(false)

  if (!state.showQuote || !state.quoteResult) {
    return null
  }

  const handleConfirmContact = async () => {
    setConfirmingContact(true)
    try {
      // Update contact status in Google Sheets
      await fetch('/api/activar/updateContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: state.personalInfo.email, 
          phone: state.personalInfo.phone 
        }),
      })

      // Send email notification
      const emailBody = `
        Solicitud de Cotización de Seguro por Días:

        Nombre: ${state.personalInfo.name}
        Email: ${state.personalInfo.email}
        Teléfono: ${state.personalInfo.phone}
        
        Vehículo:
        Marca: ${state.activarMarca.name}
        Modelo: ${state.activarModelo.model}
        Año: ${state.activarYear}
        Sección: ${state.activarSeccion}
        
        Mensaje adicional:
        ${state.personalInfo.message}
      `

      await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.EMAIL_TO_SEND,
          subject: 'Cotización Seguro por Días solicitada',
          text: emailBody,
        }),
      })

      actions.setSuccess(true)
      setTimeout(() => {
        actions.setSuccess(false)
        actions.setShowQuote(false)
        actions.setQuoteResult(null)
      }, 3000)
    } catch (error) {
      console.error('Error confirming contact:', error)
    } finally {
      setConfirmingContact(false)
    }
  }

  const { quoteResult, activarMarca, activarModelo, activarYear } = state

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="border-secondary bg-gradient-to-br from-secondary/5 to-secondary/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl text-secondary">¡Tu cotización está lista!</CardTitle>
          <CardDescription className="text-lg">
            Seguro por días para {activarMarca.name} {activarModelo.model} {activarYear}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* On-Off Coverage Options */}
      {quoteResult.on_off && quoteResult.on_off.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Opciones de Cobertura On-Off
          </h3>
          
          <div className="grid gap-4">
            {quoteResult.on_off.map((option: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`${
                  option.recommended 
                    ? 'border-secondary bg-secondary/5 shadow-lg' 
                    : 'border-border'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            Cobertura {option.coverage}
                          </h4>
                          {option.recommended && (
                            <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3" />
                              Recomendada
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{option.description}</p>
                        <div className="text-sm space-y-1">
                          <p><strong>Responsabilidad Civil:</strong> ${option.responsabilidad_civil?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">${option.premio}</div>
                        <div className="text-sm text-muted-foreground">por día</div>
                      </div>
                    </div>

                    {option.items && option.items.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 text-sm">Incluye:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                          {option.items.map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Garage Coverage */}
      {quoteResult.garage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Cobertura de Garage
          </h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Cobertura de Garage</h4>
                  <p className="text-muted-foreground mb-3">{quoteResult.garage.description}</p>
                  {quoteResult.garage.prima_mensual && (
                    <p className="text-sm"><strong>Prima mensual:</strong> ${quoteResult.garage.prima_mensual}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">${quoteResult.garage.premio}</div>
                  <div className="text-sm text-muted-foreground">total</div>
                </div>
              </div>

              {quoteResult.garage.items && quoteResult.garage.items.length > 0 && (
                <div>
                  <p className="font-medium mb-2 text-sm">Incluye:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                    {quoteResult.garage.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Request */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold mb-2">¿Te interesa alguna de estas opciones?</h4>
            <p className="text-muted-foreground mb-4">
              Para confirmar tu seguro y recibir más información detallada, solicita que te contactemos.
            </p>
            <Button
              onClick={handleConfirmContact}
              disabled={confirmingContact || state.success}
              size="lg"
              className="w-full md:w-auto"
            >
              {confirmingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando solicitud...
                </>
              ) : state.success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Solicitud enviada!
                </>
              ) : (
                'Solicitar Contacto'
              )}
            </Button>
            
            {state.success && (
              <p className="text-sm text-secondary mt-2">
                Te contactaremos pronto para finalizar tu seguro
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}