export interface ActivarBrand {
    id: number
    name: string
}

export interface ActivarModel {
    id: number // brand id per API
    name: string // brand name
    model: string // model name
    code: string // model code
}

export interface ActivarYear {
    year: string
    value: string
}

export interface ActivarQuoteOnOffOption {
    coverage: 'A' | 'B' | 'B1'
    description: string
    prima: string
    premio: string
    responsabilidad_civil?: string
    recommended?: boolean
    items?: string[]
}

export interface ActivarQuoteGarage {
    description: string
    prima: string
    prima_mensual?: string
    premio: string
    cuota?: string
    financial_surcharge?: string
    items?: string[]
}

export interface ActivarQuoteData {
    id: number
    garage?: ActivarQuoteGarage
    on_off: ActivarQuoteOnOffOption[]
}
