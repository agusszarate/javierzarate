'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQuoteForm } from '@/contexts/QuoteFormContext'

export function PersonalInfoForm() {
  const { state, actions } = useQuoteForm()
  const { personalInfo } = state

  const handleInputChange = (field: string, value: string) => {
    actions.setPersonalInfo({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={personalInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Tu nombre completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Teléfono *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+54 11 1234-5678"
            required
          />
        </div>
        {state.quoteType === 'Vehiculo' && (
          <div className="space-y-2">
            <Label htmlFor="dni">DNI del Propietario *</Label>
            <Input
              id="dni"
              name="dni"
              type="text"
              value={personalInfo.dni || ''}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              placeholder="12.345.678"
              required
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje (Opcional)</Label>
        <Textarea
          id="message"
          name="message"
          value={personalInfo.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Información adicional o consultas específicas..."
          rows={4}
        />
      </div>
    </div>
  )
}