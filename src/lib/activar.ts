import type { ActivarBrand, ActivarModel, ActivarYear, ActivarQuoteData } from '@/types/activar'
import { http } from './http'

const BASE = 'https://api.activar.app'

export async function fetchBrands(): Promise<ActivarBrand[]> {
  const r = await http<{ data?: ActivarBrand[] }>(`${BASE}/models/brand/1`)
  return r.data ?? []
}

export async function fetchModels(brandId: string): Promise<ActivarModel[]> {
  const r = await http<{ data?: ActivarModel[] }>(`${BASE}/models/${brandId}/models/1`)
  return r.data ?? []
}

export async function fetchYears(modelCode: string): Promise<ActivarYear[]> {
  const r = await http<{ data?: { years?: ActivarYear[] } }>(`${BASE}/models/${modelCode}/years`)
  return r.data?.years ?? []
}

export async function createQuote(payload: Record<string, unknown>): Promise<{ data: ActivarQuoteData } | ActivarQuoteData> {
  return await http(`${BASE}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
