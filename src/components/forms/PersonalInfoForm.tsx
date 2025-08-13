'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { useEffect, useRef } from 'react'

export function PersonalInfoForm() {
    const { state, actions } = useQuoteForm()
    const { personalInfo } = state

    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const handleInputChange = (field: string, value: string) => {
        actions.setPersonalInfo({ [field]: value })
    }

    const handlePostalChange = (value: string) => {
        // Only allow digits
        const digits = value.replace(/[^0-9]/g, '')
        actions.setPostalCode(digits)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (digits.length < 4) {
            // Too short to query
            return
        }
        debounceRef.current = setTimeout(async () => {
            try {
                actions.startZoneLookup()
                const res = await fetch(`/api/activar/zones?postal_code=${digits}`)
                if (!res.ok) throw new Error('Respuesta inválida')
                const data = await res.json()
                const zone = data?.data?.[0]
                if (zone?.id) {
                    actions.setZoneSuccess(zone.id)
                } else {
                    actions.setZoneError('No se encontró zona')
                }
            } catch {
                actions.setZoneError('Error buscando zona')
            }
        }, 600)
    }

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

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
                {state.quoteType === 'Activar_app' && (
                    <div className="space-y-1">
                        <Label htmlFor="postalCode">Código Postal *</Label>
                        <Input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            inputMode="numeric"
                            value={state.postalCode}
                            onChange={(e) => handlePostalChange(e.target.value)}
                            placeholder="Ej: 1878"
                            required
                        />
                        <p className="text-xs ml-1">
                            {state.zoneStatus === 'idle' &&
                                !state.postalCode &&
                                'Requerido para cotizar'}
                            {state.zoneStatus === 'loading' && 'Buscando zona...'}
                            {state.zoneStatus === 'error' && (
                                <span className="text-red-500">{state.zoneError}</span>
                            )}
                            {state.zoneStatus === 'ready' && state.zoneId && (
                                <span className="text-green-600">Zona OK (ID {state.zoneId})</span>
                            )}
                        </p>
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
