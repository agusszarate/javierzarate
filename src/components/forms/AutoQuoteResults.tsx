'use client'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { CheckCircle, Car, Shield, ArrowLeft, CreditCard } from 'lucide-react'

export function AutoQuoteResults() {
  const { state, actions } = useQuoteForm()

  if (!state.showQuote || !state.quoteResult) {
    return null
  }

  const { quoteResult } = state
  const isMeridional = state.quoteType === 'Vehiculo'

  const handleBackToForm = () => {
    actions.setShowQuote(false)
    actions.setQuoteResult(null)
  }

  // Handle Meridional results
  if (isMeridional && quoteResult.success) {
    const { results, metadata, inputsEcho } = quoteResult

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card className="border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">¡Cotización de Auto Lista!</CardTitle>
            <CardDescription className="text-lg">
              {results.length} opcion{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''} de Meridional Seguros
            </CardDescription>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>🚗 {inputsEcho.mode === 'byPlate' ? `Patente: ${inputsEcho.licensePlate}` : 
                `${inputsEcho.vehicle?.brand} ${inputsEcho.vehicle?.model} ${inputsEcho.vehicle?.year}`}</span>
              <span>💳 {inputsEcho.paymentMethod}</span>
              <span>⏱️ {Math.round(metadata.durationMs / 1000)}s</span>
            </div>
          </CardHeader>
        </Card>

        {/* Quote Plans */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Planes Disponibles
          </h3>
          
          <div className="grid gap-4">
            {results.map((plan: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`${
                  index === 0 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {plan.planName}
                          </h4>
                          {index === 0 && (
                            <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                              Destacado
                            </div>
                          )}
                        </div>
                        {plan.details && (
                          <p className="text-muted-foreground mb-3 text-sm">{plan.details}</p>
                        )}
                        {plan.franchise && (
                          <div className="text-sm">
                            <span className="font-medium">Franquicia:</span> {plan.franchise}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-primary">
                          ${plan.monthly.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.currency} / mes
                        </div>
                      </div>
                    </div>

                    {/* Additional plan features could go here */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Cotización automatizada por Meridional Seguros</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold mb-2">¿Te interesa algún plan?</h4>
              <p className="text-muted-foreground mb-4">
                Para contratar tu seguro y obtener más información, te contactaremos pronto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleBackToForm}
                  variant="outline"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Nueva Cotización
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    // Could trigger contact form or redirect to Meridional
                    window.open('https://meridionalseguros.seg.ar/', '_blank')
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Contactar Meridional
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debug info for development */}
        {quoteResult.debug && process.env.NODE_ENV === 'development' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p><strong>Steps:</strong> {quoteResult.debug.steps?.join(' → ')}</p>
              <p><strong>Trace ID:</strong> {metadata.traceId}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    )
  }

  // Handle Meridional error results  
  if (isMeridional && !quoteResult.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <CardTitle className="text-red-800">Error en la Cotización</CardTitle>
            <CardDescription>
              {quoteResult.message || 'No se pudo obtener la cotización'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleBackToForm} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Intentar Nuevamente
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // For other quote types, don't render anything (use default QuoteResults)
  return null
}