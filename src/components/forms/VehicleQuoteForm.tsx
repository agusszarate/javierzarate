'use client'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { Loader2, Car, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'

interface MeridionalQuoteResult {
    success: boolean
    insurer?: string
    results?: Array<{
        planName: string
        monthly: number
        currency: string
        details?: string
        franchise?: string
    }>
    metadata?: {
        quotedAt: string
        durationMs: number
        traceId: string
    }
    code?: string
    message?: string
}

export function VehicleQuoteForm() {
    const { state, actions } = useQuoteForm()
    const [isLoading, setIsLoading] = useState(false)
    const [quoteResult, setQuoteResult] = useState<MeridionalQuoteResult | null>(null)

    const handleSubmit = async () => {
        setIsLoading(true)
        actions.setLoading(true)
        setQuoteResult(null)

        try {
            const payload = {
                mode: state.mode,
                ...(state.mode === 'byPlate' ? {
                    licensePlate: state.licensePlate,
                } : {
                    vehicle: {
                        year: state.year,
                        brand: state.brand,
                        model: state.model,
                        version: state.version || undefined,
                    }
                }),
                paymentMethod: state.paymentMethod,
                usage: {
                    isParticular: state.flags.isParticular,
                },
                flags: {
                    isZeroKm: state.flags.isZeroKm,
                    hasGNC: state.flags.hasGNC,
                },
                debug: process.env.NODE_ENV === 'development',
            }

            const response = await fetch('/api/meridional/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            setQuoteResult(data)

            if (response.ok && data.success) {
                actions.setQuoteResult(data)
                actions.setShowQuote(true)
            }
        } catch (error) {
            console.error('Error submitting quote:', error)
            setQuoteResult({
                success: false,
                message: 'Error de conexión. Por favor, intenta nuevamente.',
            })
        } finally {
            setIsLoading(false)
            actions.setLoading(false)
        }
    }

    const isFormValid = () => {
        if (state.mode === 'byPlate') {
            return state.licensePlate.trim().length > 0
        } else {
            return (
                state.year && 
                state.brand.trim().length > 0 && 
                state.model.trim().length > 0
            )
        }
    }

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={() => actions.setMode(state.mode === 'byPlate' ? 'byVehicle' : 'byPlate')}
                    className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    {state.mode === 'byPlate' ? (
                        <ToggleLeft className="h-5 w-5" />
                    ) : (
                        <ToggleRight className="h-5 w-5" />
                    )}
                    <span>Cotizar sin patente</span>
                </button>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
                {state.mode === 'byPlate' ? (
                    <div className="space-y-2">
                        <Label htmlFor="licensePlate">Patente</Label>
                        <Input
                            id="licensePlate"
                            placeholder="Ingresa la patente del vehículo"
                            value={state.licensePlate}
                            onChange={(e) => actions.setLicensePlate(e.target.value.toUpperCase())}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="year">Año del vehículo</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="2024"
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                value={state.year || ''}
                                onChange={(e) => actions.setYear(parseInt(e.target.value) || '')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input
                                id="brand"
                                placeholder="Toyota, Ford, etc."
                                value={state.brand}
                                onChange={(e) => actions.setBrand(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Modelo</Label>
                            <Input
                                id="model"
                                placeholder="Corolla, Focus, etc."
                                value={state.model}
                                onChange={(e) => actions.setModel(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="version">Versión (opcional)</Label>
                            <Input
                                id="version"
                                placeholder="XL, SEL, etc."
                                value={state.version}
                                onChange={(e) => actions.setVersion(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Medio de Pago</Label>
                    <Select
                        value={state.paymentMethod}
                        onValueChange={(value: 'Tarjeta de crédito' | 'CBU') => 
                            actions.setPaymentMethod(value)
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

                {/* Flags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isParticular"
                            checked={state.flags.isParticular}
                            onCheckedChange={(checked) => 
                                actions.setFlags({ isParticular: checked as boolean })
                            }
                        />
                        <Label htmlFor="isParticular" className="text-sm">Uso particular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isZeroKm"
                            checked={state.flags.isZeroKm}
                            onCheckedChange={(checked) => 
                                actions.setFlags({ isZeroKm: checked as boolean })
                            }
                        />
                        <Label htmlFor="isZeroKm" className="text-sm">Es 0Km</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hasGNC"
                            checked={state.flags.hasGNC}
                            onCheckedChange={(checked) => 
                                actions.setFlags({ hasGNC: checked as boolean })
                            }
                        />
                        <Label htmlFor="hasGNC" className="text-sm">Tiene GNC</Label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <Button 
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cotizando...
                        </>
                    ) : (
                        <>
                            <Car className="mr-2 h-4 w-4" />
                            Cotizar
                        </>
                    )}
                </Button>
            </div>

            {/* Results Display */}
            {quoteResult && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {quoteResult.success ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Cotización Exitosa
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    Error en la Cotización
                                </>
                            )}
                        </CardTitle>
                        {quoteResult.success && quoteResult.insurer && (
                            <CardDescription>
                                Resultados de {quoteResult.insurer}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {quoteResult.success && quoteResult.results ? (
                            <div className="space-y-4">
                                {quoteResult.results.map((plan, index) => (
                                    <Card key={index} className="border border-green-200 bg-green-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg text-green-800">
                                                        {plan.planName}
                                                    </h4>
                                                    {plan.details && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {plan.details}
                                                        </p>
                                                    )}
                                                    {plan.franchise && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Franquicia: {plan.franchise}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-2xl font-bold text-green-700">
                                                        <DollarSign className="h-5 w-5" />
                                                        {plan.monthly.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {plan.currency} mensual
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                {quoteResult.metadata && (
                                    <div className="text-xs text-muted-foreground pt-2 border-t">
                                        Cotización realizada el {new Date(quoteResult.metadata.quotedAt).toLocaleString('es-AR')}
                                        {' · '}Duración: {Math.round(quoteResult.metadata.durationMs / 1000)}s
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-600 font-medium">
                                    {quoteResult.message || 'Error desconocido'}
                                </p>
                                {quoteResult.code && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Código: {quoteResult.code}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}