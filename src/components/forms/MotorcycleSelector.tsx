'use client'
import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useQuoteForm } from '@/contexts/QuoteFormContext'
import { Loader2, Zap } from 'lucide-react'

export function MotorcycleSelector() {
    const { state, actions } = useQuoteForm()

    // Fetch data functions - extracted from original form
    const fetchData = async (url: string, onSuccess: (data: any) => void) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`)
            }

            const data = await response.json()
            onSuccess(data)
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error)
        }
    }

    const getActivarMarcas = (section: string = 'moto') => {
        console.log(`[ACTIVAR] MotorcycleSelector: getActivarMarcas called with section: ${section}`)
        fetchData(`/api/activar/brands?section=${section}`, actions.setActivarMarcas)
    }

    const getActivarModelos = (brandId: string) => {
        const section = state.activarSeccion || 'moto'
        console.log(`[ACTIVAR] MotorcycleSelector: getActivarModelos called with brandId: ${brandId}, section: ${section}`)
        fetchData(`/api/activar/models?brandId=${brandId}&section=${section}`, actions.setActivarModelos)
    }

    const getActivarYears = (modelCode: string) => {
        fetchData(`/api/activar/years?modelCode=${modelCode}`, actions.setActivarYears)
    }

    // Load brands on component mount and when section changes
    useEffect(() => {
        if (state.activarSeccion) {
            console.log(`[ACTIVAR] MotorcycleSelector: Loading brands for section: ${state.activarSeccion}`)
            getActivarMarcas(state.activarSeccion)
        }
    }, [state.activarSeccion])

    const handleMarcaChange = (marcaId: string) => {
        const selectedMarca = state.activarMarcas.find((m) => m.id === marcaId)
        if (selectedMarca) {
            actions.setActivarMarca(selectedMarca)
            // Reset dependent fields
            actions.setActivarModelo({ code: '', model: '' })
            actions.setActivarYear('')
            actions.setActivarModelos([])
            actions.setActivarYears([])
            // Load models
            getActivarModelos(selectedMarca.id)
        }
    }

    const handleModeloChange = (modelCode: string) => {
        const selectedModelo = state.activarModelos.find((m) => m.code === modelCode)
        if (selectedModelo) {
            actions.setActivarModelo(selectedModelo)
            // Reset dependent fields
            actions.setActivarYear('')
            actions.setActivarYears([])
            // Load years
            getActivarYears(selectedModelo.code)
        }
    }

    const handleYearChange = (year: string) => {
        actions.setActivarYear(Number(year))
    }

    const handleQuote = async () => {
        // Pre-validate postal / zone for Activar_app
        if (!state.postalCode || state.zoneStatus !== 'ready' || !state.zoneId) {
            if (!state.postalCode) actions.setZoneError('Código postal requerido')
            else if (state.zoneStatus !== 'ready') actions.setZoneError('Zona no validada')
            return
        }
        actions.setLoading(true)
        try {
            const quotePayload = {
                brand: state.activarMarca.name,
                code: state.activarModelo.code,
                value: '0',
                client_email: state.personalInfo.email,
                client_first_name: state.personalInfo.name.split(' ')[0] || '',
                client_last_name: state.personalInfo.name.split(' ').slice(1).join(' ') || '',
                section: state.activarSeccion,
                year: state.activarYear,
                is0km: state.activarYear === new Date().getFullYear(),
                zone_id: state.zoneId,
                channel: 'cotizador',
            }

            const response = await fetch('/api/activar/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quotePayload),
            })

            if (response.ok) {
                const quoteData = await response.json()
                actions.setQuoteResult(quoteData.data || quoteData)
                actions.setShowQuote(true)

                // Save to Google Sheets
                const fData = {
                    name: state.personalInfo.name,
                    email: state.personalInfo.email,
                    phone: state.personalInfo.phone,
                    message: state.personalInfo.message,
                    activarMarca: state.activarMarca.name,
                    activarModelo: state.activarModelo.model,
                    activarYear: state.activarYear.toString(),
                    activarSeccion: state.activarSeccion,
                    activarValor: (() => {
                        const data = quoteData.data || quoteData
                        const recommended = data.on_off?.find((option: any) => option.recommended)
                        if (recommended) return `$${recommended.premio} (${recommended.coverage})`
                        if (data.on_off?.length > 0)
                            return `$${data.on_off[0].premio} (${data.on_off[0].coverage})`
                        return 'Múltiples opciones disponibles'
                    })(),
                    activarCodigoPostal: state.postalCode,
                    activarZonaId: String(state.zoneId),
                    solicitorContacto: 'false',
                }

                await fetch('/api/saveToSheets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quoteType: 'Activar_app', formData: fData }),
                })
            }
        } catch (error) {
            console.error('Error getting quote:', error)
        } finally {
            actions.setLoading(false)
        }
    }

    const isFormValid =
        state.activarSeccion &&
        state.activarMarca.id &&
        state.activarModelo.code &&
        state.activarYear &&
        state.postalCode &&
        state.zoneStatus === 'ready' &&
        state.zoneId

    return (
        <div className="space-y-4">
            {/* Vehicle Type Selection */}
            <div className="space-y-2">
                <Label>Tipo de Vehículo</Label>
                <Select
                    value={state.activarSeccion}
                    onValueChange={(value: 'moto' | 'cuatri') => actions.setActivarSeccion(value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="moto">🏍️ Motocicleta</SelectItem>
                        <SelectItem value="cuatri">🛵 Cuatriciclo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Brand Selection */}
            <div className="space-y-2">
                <Label>Marca</Label>
                <Select value={state.activarMarca.id} onValueChange={handleMarcaChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                    </SelectTrigger>
                    <SelectContent>
                        {state.activarMarcas.length > 0 ? (
                            state.activarMarcas.map((marca) => (
                                <SelectItem key={marca.id} value={marca.id}>
                                    {marca.name}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="loading" disabled>
                                Cargando marcas...
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                    value={state.activarModelo.code}
                    onValueChange={handleModeloChange}
                    disabled={!state.activarMarca.id}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                        {state.activarMarca.id ? (
                            state.activarModelos.length > 0 ? (
                                state.activarModelos.map((modelo) => (
                                    <SelectItem key={modelo.code} value={modelo.code}>
                                        {modelo.model}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="loading" disabled>
                                    Cargando modelos...
                                </SelectItem>
                            )
                        ) : (
                            <SelectItem value="no-brand" disabled>
                                Selecciona una marca primero
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
                <Label>Año</Label>
                <Select
                    value={state.activarYear.toString()}
                    onValueChange={handleYearChange}
                    disabled={!state.activarModelo.code}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona el año" />
                    </SelectTrigger>
                    <SelectContent>
                        {state.activarModelo.code ? (
                            state.activarYears.length > 0 ? (
                                state.activarYears.map((yearObj) => (
                                    <SelectItem key={yearObj.year} value={yearObj.year}>
                                        {yearObj.year}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="loading" disabled>
                                    Cargando años...
                                </SelectItem>
                            )
                        ) : (
                            <SelectItem value="no-model" disabled>
                                Selecciona un modelo primero
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Quote Button */}
            <Button
                onClick={handleQuote}
                disabled={!isFormValid || state.loading}
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
                        <Zap className="w-4 h-4 mr-2" />
                        Ver Cotización Instantánea
                    </>
                )}
            </Button>
        </div>
    )
}
