'use client'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { Loader2, Car } from 'lucide-react'

export function VehicleSelector() {
    const { state, actions } = useQuoteForm()
    
    const handleModeToggle = (checked: boolean) => {
        const newMode = checked ? 'byVehicle' : 'byPlate'
        actions.setVehicleInfo({ 
            mode: newMode,
            // Clear fields when switching modes
            licensePlate: '',
            year: undefined,
            brand: '',
            model: '',
            version: ''
        })
    }

    const handleQuote = async () => {
        actions.setLoading(true)
        
        try {
            // Build payload based on mode
            const basePayload = {
                mode: state.vehicleInfo.mode,
                paymentMethod: state.vehicleInfo.paymentMethod,
                usage: { isParticular: state.vehicleInfo.flags.isParticular },
                flags: {
                    isZeroKm: state.vehicleInfo.flags.isZeroKm,
                    hasGNC: state.vehicleInfo.flags.hasGNC,
                },
                owner: {
                    documentType: 'DNI',
                    documentNumber: state.personalInfo.dni || '',
                    birthDate: state.personalInfo.birthDate || '',
                    email: state.personalInfo.email,
                    phone: state.personalInfo.phone,
                },
                location: { postalCode: state.postalCode },
                debug: false,
            }

            let payload
            if (state.vehicleInfo.mode === 'byPlate') {
                payload = {
                    ...basePayload,
                    licensePlate: state.vehicleInfo.licensePlate,
                }
            } else {
                payload = {
                    ...basePayload,
                    vehicle: {
                        year: state.vehicleInfo.year,
                        brand: state.vehicleInfo.brand,
                        model: state.vehicleInfo.model,
                        version: state.vehicleInfo.version,
                    },
                }
            }

            const response = await fetch('/api/meridional/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const quoteData = await response.json()
                actions.setQuoteResult(quoteData)
                actions.setShowQuote(true)
            } else {
                const errorData = await response.json()
                console.error('Quote error:', errorData)
                // TODO: Show error to user
            }
        } catch (error) {
            console.error('Error getting Meridional quote:', error)
            // TODO: Show error to user
        } finally {
            actions.setLoading(false)
        }
    }

    const isFormValid = () => {
        const { vehicleInfo } = state
        const baseOwnerValid = Boolean(state.personalInfo.dni) &&
            Boolean(state.personalInfo.birthDate && /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(state.personalInfo.birthDate)) &&
            Boolean(state.postalCode && state.postalCode.length >= 4)

        if (vehicleInfo.mode === 'byPlate') {
            return !!(vehicleInfo.licensePlate && vehicleInfo.licensePlate.length >= 6 && baseOwnerValid)
        } else {
            return (
                baseOwnerValid &&
                vehicleInfo.year &&
                vehicleInfo.brand &&
                vehicleInfo.model &&
                vehicleInfo.year >= 1990 &&
                vehicleInfo.year <= new Date().getFullYear() + 1
            )
        }
    }

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="byVehicle"
                    checked={state.vehicleInfo.mode === 'byVehicle'}
                    onCheckedChange={handleModeToggle}
                />
                <Label htmlFor="byVehicle">Cotizar sin patente</Label>
            </div>

            {/* By Plate Mode */}
            {state.vehicleInfo.mode === 'byPlate' && (
                <div className="space-y-2">
                    <Label htmlFor="licensePlate">Patente</Label>
                    <Input
                        id="licensePlate"
                        placeholder="ABC123"
                        value={state.vehicleInfo.licensePlate || ''}
                        onChange={(e) =>
                            actions.setVehicleInfo({ licensePlate: e.target.value.toUpperCase() })
                        }
                        maxLength={7}
                    />
                </div>
            )}

            {/* By Vehicle Mode */}
            {state.vehicleInfo.mode === 'byVehicle' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="year">Año del vehículo</Label>
                        <Input
                            id="year"
                            type="number"
                            placeholder="2020"
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            value={state.vehicleInfo.year || ''}
                            onChange={(e) =>
                                actions.setVehicleInfo({ year: Number(e.target.value) || undefined })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                            id="brand"
                            placeholder="Toyota"
                            value={state.vehicleInfo.brand || ''}
                            onChange={(e) => actions.setVehicleInfo({ brand: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                            id="model"
                            placeholder="Corolla"
                            value={state.vehicleInfo.model || ''}
                            onChange={(e) => actions.setVehicleInfo({ model: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="version">Versión (opcional)</Label>
                        <Input
                            id="version"
                            placeholder="XEI 1.8"
                            value={state.vehicleInfo.version || ''}
                            onChange={(e) => actions.setVehicleInfo({ version: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
                <Label>Medio de Pago</Label>
                <Select
                    value={state.vehicleInfo.paymentMethod}
                    onValueChange={(value: 'Tarjeta de crédito' | 'CBU') =>
                        actions.setVehicleInfo({ paymentMethod: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                        <SelectItem value="CBU">CBU</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Vehicle Flags */}
            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isParticular"
                        checked={state.vehicleInfo.flags.isParticular}
                        onCheckedChange={(checked) =>
                            actions.setVehicleInfo({
                                flags: { ...state.vehicleInfo.flags, isParticular: Boolean(checked) },
                            })
                        }
                    />
                    <Label htmlFor="isParticular">Uso particular</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isZeroKm"
                        checked={state.vehicleInfo.flags.isZeroKm || false}
                        onCheckedChange={(checked) =>
                            actions.setVehicleInfo({
                                flags: { ...state.vehicleInfo.flags, isZeroKm: Boolean(checked) },
                            })
                        }
                    />
                    <Label htmlFor="isZeroKm">Es 0Km</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hasGNC"
                        checked={state.vehicleInfo.flags.hasGNC || false}
                        onCheckedChange={(checked) =>
                            actions.setVehicleInfo({
                                flags: { ...state.vehicleInfo.flags, hasGNC: Boolean(checked) },
                            })
                        }
                    />
                    <Label htmlFor="hasGNC">Tiene GNC</Label>
                </div>
            </div>

            {/* Quote Button */}
            <Button
                onClick={handleQuote}
                disabled={!isFormValid() || state.loading}
                className="w-full"
                size="lg"
            >
                {state.loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Obteniendo cotización...
                    </>
                ) : (
                    <>
                        <Car className="w-4 h-4 mr-2" />
                        Cotizar
                    </>
                )}
            </Button>
        </div>
    )
}