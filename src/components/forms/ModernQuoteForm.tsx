'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuoteFormProvider, useQuoteForm } from '@/contexts/QuoteFormContext'
import { PersonalInfoForm } from './PersonalInfoForm'
import { QuoteTypeSelector } from './QuoteTypeSelector'
import { MotorcycleSelector } from './MotorcycleSelector'
import { QuoteResults } from './QuoteResults'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'

function ModernQuoteFormContent() {
  const { state, actions } = useQuoteForm()

  const handleTraditionalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (state.quoteType === 'Activar_app') {
      return // Handled separately
    }

    actions.setLoading(true)
    
    try {
      const emailBody = `
        Solicitud de Cotización de ${state.quoteType}:

        Nombre: ${state.personalInfo.name}
        Email: ${state.personalInfo.email}
        Teléfono: ${state.personalInfo.phone}
        ${state.personalInfo.dni ? `DNI: ${state.personalInfo.dni}` : ''}
        
        ${state.quoteType === 'Vehiculo' ? `
        Vehículo:
        Marca: ${state.marca.nome}
        Modelo: ${state.modelo.nome}
        Año: ${state.año.nome}` : ''}
        
        Mensaje adicional:
        ${state.personalInfo.message}
      `

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.EMAIL_TO_SEND,
          subject: 'Cotización solicitada',
          text: emailBody,
        }),
      })

      if (response.ok) {
        // Save to Google Sheets
        await fetch('/api/saveToSheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteType: state.quoteType,
            formData: {
              name: state.personalInfo.name,
              email: state.personalInfo.email,
              phone: state.personalInfo.phone,
              message: state.personalInfo.message,
              vehicleMake: state.marca.nome,
              vehicleModel: state.modelo.nome,
              vehicleYear: state.año.nome,
              dni: state.personalInfo.dni,
            },
          }),
        })

        actions.setSuccess(true)
        setTimeout(() => {
          actions.setSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Error sending quote request:', error)
    } finally {
      actions.setLoading(false)
    }
  }

  const isFormValid = () => {
    const { personalInfo } = state
    return personalInfo.name && personalInfo.email && personalInfo.phone
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quote Results - Show when available */}
      {state.showQuote && <QuoteResults />}
      
      {/* Main Form - Hide when showing results */}
      {!state.showQuote && (
        <form onSubmit={handleTraditionalSubmit} className="space-y-8">
          {/* Quote Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Seguro</CardTitle>
              <CardDescription>
                Selecciona el tipo de seguro que necesitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteTypeSelector />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Completa tus datos para procesar la cotización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm />
            </CardContent>
          </Card>

          {/* Vehicle/Motorcycle Specific Forms */}
          {state.quoteType === 'Activar_app' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏍️ Datos del Vehículo
                  <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    Cotización Automática
                  </span>
                </CardTitle>
                <CardDescription>
                  Selecciona los datos de tu moto o cuatriciclo para obtener una cotización instantánea
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MotorcycleSelector />
              </CardContent>
            </Card>
          )}

          {/* Traditional Vehicle Form would go here */}
          {state.quoteType === 'Vehiculo' && (
            <Card>
              <CardHeader>
                <CardTitle>🚗 Datos del Vehículo</CardTitle>
                <CardDescription>
                  Completa la información de tu vehículo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    🚧 Formulario de vehículos tradicionales
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Por ahora, usa el formulario de contacto general
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Insurance Types */}
          {['Hogar', 'Vida', 'Negocios'].includes(state.quoteType) && (
            <Card>
              <CardHeader>
                <CardTitle>📋 Información Adicional</CardTitle>
                <CardDescription>
                  Para seguros de {state.quoteType.toLowerCase()}, nos pondremos en contacto contigo para 
                  una consulta personalizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                  <p className="text-primary font-medium mb-2">
                    Consulta Personalizada Requerida
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Los seguros de {state.quoteType.toLowerCase()} requieren una evaluación detallada. 
                    Completa tus datos y te contactaremos para brindarte la mejor cotización.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button for non-Activar forms */}
          {state.quoteType !== 'Activar_app' && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid() || state.loading}
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando solicitud...
                    </>
                  ) : state.success ? (
                    <>
                      ✅ ¡Solicitud enviada!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Solicitar Cotización
                    </>
                  )}
                </Button>
                
                {state.success && (
                  <p className="text-center text-sm text-secondary mt-3">
                    Hemos recibido tu solicitud. Te contactaremos pronto.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </form>
      )}
    </div>
  )
}

export function ModernQuoteForm() {
  return (
    <QuoteFormProvider>
      <ModernQuoteFormContent />
    </QuoteFormProvider>
  )
}