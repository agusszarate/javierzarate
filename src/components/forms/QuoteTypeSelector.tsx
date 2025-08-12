'use client'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuoteForm, QuoteType } from '@/contexts/QuoteFormContext'
import { Bike, Car, Home, Heart, Briefcase } from 'lucide-react'

const quoteTypes: { value: QuoteType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'Activar_app',
    label: 'Seguro por días (Moto/Cuatri)',
    description: 'Cotización automática con Activar.app',
    icon: <Bike className="w-4 h-4" />
  },
  {
    value: 'Vehiculo',
    label: 'Seguro de Auto',
    description: 'Cobertura integral para vehículos',
    icon: <Car className="w-4 h-4" />
  },
  {
    value: 'Hogar',
    label: 'Seguro de Hogar',
    description: 'Protección para tu hogar',
    icon: <Home className="w-4 h-4" />
  },
  {
    value: 'Vida',
    label: 'Seguro de Vida',
    description: 'Protección familiar',
    icon: <Heart className="w-4 h-4" />
  },
  {
    value: 'Negocios',
    label: 'Seguro de Negocios',
    description: 'Cobertura comercial',
    icon: <Briefcase className="w-4 h-4" />
  }
]

export function QuoteTypeSelector() {
  const { state, actions } = useQuoteForm()

  const selectedType = quoteTypes.find(type => type.value === state.quoteType)

  return (
    <div className="space-y-3">
      <Label>Tipo de Cotización</Label>
      <Select
        value={state.quoteType}
        onValueChange={(value: QuoteType) => actions.setQuoteType(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedType && (
              <div className="flex items-center gap-2">
                {selectedType.icon}
                <span>{selectedType.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {quoteTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-3 py-1">
                {type.icon}
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {state.quoteType === 'Activar_app' && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-secondary font-medium mb-1">
            <Bike className="w-4 h-4" />
            Cotización Automática Disponible
          </div>
          <p className="text-muted-foreground">
            Conectado con Activar.app para cotizaciones instantáneas de seguros de moto y cuatriciclo
          </p>
        </div>
      )}
    </div>
  )
}