'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

// Types for different quote systems
export type QuoteType = 'Vehiculo' | 'Hogar' | 'Vida' | 'Negocios' | 'Activar_app'

export interface VehicleData {
    codigo: string
    nome: string
}

export interface ActivarData {
    id: string
    name: string
}

export interface ActivarModel {
    code: string
    model: string
}

export interface PersonalInfo {
    name: string
    email: string
    phone: string
    message: string
    dni?: string
}

export interface QuoteFormState {
    // Current quote type
    quoteType: QuoteType

    // Personal information
    personalInfo: PersonalInfo

    // Traditional vehicle data
    marca: VehicleData
    marcas: VehicleData[]
    modelo: VehicleData
    modelos: VehicleData[]
    año: VehicleData
    años: VehicleData[]

    // Activar.app data
    activarMarcas: ActivarData[]
    activarModelos: ActivarModel[]
    activarYears: { year: string }[]
    activarMarca: ActivarData
    activarModelo: ActivarModel
    activarYear: number | ''
    activarSeccion: 'moto' | 'cuatri' | ''

    // Quote results
    showQuote: boolean
    quoteResult: any

    // UI state
    loading: boolean
    success: boolean

    // Postal / zone (Activar_app)
    postalCode: string
    zoneId: number | null
    zoneStatus: 'idle' | 'loading' | 'error' | 'ready'
    zoneError: string | null
}

export interface QuoteFormActions {
    setQuoteType: (type: QuoteType) => void
    setPersonalInfo: (info: Partial<PersonalInfo>) => void

    // Traditional vehicle actions
    setMarca: (marca: VehicleData) => void
    setMarcas: (marcas: VehicleData[]) => void
    setModelo: (modelo: VehicleData) => void
    setModelos: (modelos: VehicleData[]) => void
    setAño: (año: VehicleData) => void
    setAños: (años: VehicleData[]) => void

    // Activar.app actions
    setActivarMarcas: (marcas: ActivarData[]) => void
    setActivarModelos: (modelos: ActivarModel[]) => void
    setActivarYears: (years: { year: string }[]) => void
    setActivarMarca: (marca: ActivarData) => void
    setActivarModelo: (modelo: ActivarModel) => void
    setActivarYear: (year: number | '') => void
    setActivarSeccion: (seccion: 'moto' | 'cuatri' | '') => void

    // Quote result actions
    setShowQuote: (show: boolean) => void
    setQuoteResult: (result: any) => void

    // UI actions
    setLoading: (loading: boolean) => void
    setSuccess: (success: boolean) => void

    // Postal / zone actions
    setPostalCode: (code: string) => void
    startZoneLookup: () => void
    setZoneSuccess: (id: number) => void
    setZoneError: (msg: string) => void
    resetZone: () => void

    // Reset actions
    resetForm: () => void
}

const initialState: QuoteFormState = {
    quoteType: 'Activar_app', // Focus on motorcycle insurance as primary
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        message: '',
        dni: '',
    },
    marca: { codigo: '', nome: '' },
    marcas: [],
    modelo: { codigo: '', nome: '' },
    modelos: [],
    año: { codigo: '', nome: '' },
    años: [],
    activarMarcas: [],
    activarModelos: [],
    activarYears: [],
    activarMarca: { id: '', name: '' },
    activarModelo: { code: '', model: '' },
    activarYear: '',
    activarSeccion: 'moto',
    showQuote: false,
    quoteResult: null,
    loading: false,
    success: false,
    postalCode: '',
    zoneId: null,
    zoneStatus: 'idle',
    zoneError: null,
}

const QuoteFormContext = createContext<{
    state: QuoteFormState
    actions: QuoteFormActions
} | null>(null)

export function QuoteFormProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<QuoteFormState>(initialState)

    const actions: QuoteFormActions = {
        setQuoteType: (type) => {
            setState((prev) => ({
                ...prev,
                quoteType: type,
                // Ensure default section is moto for Activar_app
                activarSeccion:
                    type === 'Activar_app' ? prev.activarSeccion || 'moto' : prev.activarSeccion,
                // Reset quote results when changing away
                showQuote: type === 'Activar_app' ? prev.showQuote : false,
                quoteResult: type === 'Activar_app' ? prev.quoteResult : null,
            }))
        },

        setPersonalInfo: (info) => {
            setState((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, ...info },
            }))
        },

        // Traditional vehicle actions
        setMarca: (marca) => setState((prev) => ({ ...prev, marca })),
        setMarcas: (marcas) => setState((prev) => ({ ...prev, marcas })),
        setModelo: (modelo) => setState((prev) => ({ ...prev, modelo })),
        setModelos: (modelos) => setState((prev) => ({ ...prev, modelos })),
        setAño: (año) => setState((prev) => ({ ...prev, año })),
        setAños: (años) => setState((prev) => ({ ...prev, años })),

        // Activar.app actions
        setActivarMarcas: (activarMarcas) => setState((prev) => ({ ...prev, activarMarcas })),
        setActivarModelos: (activarModelos) => setState((prev) => ({ ...prev, activarModelos })),
        setActivarYears: (activarYears) => setState((prev) => ({ ...prev, activarYears })),
        setActivarMarca: (activarMarca) => setState((prev) => ({ ...prev, activarMarca })),
        setActivarModelo: (activarModelo) => setState((prev) => ({ ...prev, activarModelo })),
        setActivarYear: (activarYear) => setState((prev) => ({ ...prev, activarYear })),
        setActivarSeccion: (activarSeccion) => setState((prev) => ({ ...prev, activarSeccion })),

        // Quote result actions
        setShowQuote: (showQuote) => setState((prev) => ({ ...prev, showQuote })),
        setQuoteResult: (quoteResult) => setState((prev) => ({ ...prev, quoteResult })),

        // UI actions
        setLoading: (loading) => setState((prev) => ({ ...prev, loading })),
        setSuccess: (success) => setState((prev) => ({ ...prev, success })),

        // Postal / zone actions
        setPostalCode: (postalCode) =>
            setState((prev) => ({
                ...prev,
                postalCode,
                // Invalidate existing zone when postal changes
                zoneId: postalCode !== prev.postalCode ? null : prev.zoneId,
                zoneStatus: postalCode ? 'idle' : 'idle',
                zoneError: null,
            })),
        startZoneLookup: () =>
            setState((prev) => ({ ...prev, zoneStatus: 'loading', zoneError: null, zoneId: null })),
        setZoneSuccess: (id) =>
            setState((prev) => ({ ...prev, zoneId: id, zoneStatus: 'ready', zoneError: null })),
        setZoneError: (msg) =>
            setState((prev) => ({ ...prev, zoneStatus: 'error', zoneError: msg })),
        resetZone: () =>
            setState((prev) => ({
                ...prev,
                postalCode: '',
                zoneId: null,
                zoneStatus: 'idle',
                zoneError: null,
            })),

        // Reset actions
        resetForm: () => setState(initialState),
    }

    return (
        <QuoteFormContext.Provider value={{ state, actions }}>{children}</QuoteFormContext.Provider>
    )
}

export function useQuoteForm() {
    const context = useContext(QuoteFormContext)
    if (!context) {
        throw new Error('useQuoteForm must be used within a QuoteFormProvider')
    }
    return context
}
