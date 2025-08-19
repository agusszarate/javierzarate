import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type VehicleMode = 'byPlate' | 'byVehicle'
type PaymentMethod = 'Tarjeta de crédito' | 'CBU'

interface RequestBody {
  mode: VehicleMode
  paymentMethod: PaymentMethod
  licensePlate?: string
  vehicle?: { year?: number; brand?: string; model?: string; version?: string }
  usage?: { isParticular?: boolean }
  flags?: { isZeroKm?: boolean; hasGNC?: boolean }
  owner: {
    documentType?: 'DNI'
    documentNumber: string
    birthDate: string // DD/MM/AAAA
    email: string
    phone: string
  }
  location: { postalCode: string }
  debug?: boolean
}

function normalizePayment(method: PaymentMethod) {
  // Meridional: 2 => Tarjeta de crédito, 4 => CBU
  return method === 'CBU' ? '4' : '2'
}

function toISODate(ddmmaaaa: string) {
  const m = ddmmaaaa.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [_, dd, mm, yyyy] = m
  return `${yyyy}-${mm}-${dd}`
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now()
  const traceId = Math.random().toString(36).slice(2)
  try {
    const body = (await req.json()) as RequestBody
    const errors: string[] = []

    if (!body) return NextResponse.json({ success: false, message: 'EMPTY_BODY' }, { status: 400 })
    if (!body.mode) errors.push('MISSING_MODE')
    if (!body.paymentMethod) errors.push('MISSING_PAYMENT_METHOD')
    if (!body.owner?.documentNumber) errors.push('MISSING_DNI')
    if (!body.owner?.birthDate) errors.push('MISSING_BIRTHDATE')
    if (!body.location?.postalCode) errors.push('MISSING_POSTAL_CODE')
    if (body.mode === 'byPlate' && !body.licensePlate) errors.push('MISSING_LICENSE_PLATE')
    if (body.mode === 'byVehicle' && (!body.vehicle?.year || !body.vehicle?.brand || !body.vehicle?.model)) errors.push('MISSING_VEHICLE_FIELDS')
    if (errors.length) return NextResponse.json({ success: false, message: 'VALIDATION_ERROR', errors }, { status: 400 })

    const meridionalUrl = process.env.MERIDIONAL_QUOTE_URL || 'https://meridionalseguros.seg.ar/auto-cotizador'

    const executablePath = await chromium.executablePath()
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-AR,es;q=0.9' })

    const timeZone = 'America/Argentina/Buenos_Aires'
    try { await page.emulateTimezone(timeZone) } catch {}

    // Navigate
    await page.goto(meridionalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // TODO: Fill Step 1 and Step 2 using concrete selectors.
    // We'll return a mocked response structure for now to wire the frontend.

    const result = {
      success: true,
      results: [
        { planName: 'Todo Riesgo', monthly: 123456, currency: 'ARS', details: 'Cobertura completa', franchise: '30.000' },
        { planName: 'Terceros Completo', monthly: 98765, currency: 'ARS', details: 'Daños a terceros, robo total', franchise: '—' },
      ],
      inputsEcho: body,
      metadata: {
        durationMs: Date.now() - startedAt,
        traceId,
      },
      debug: body.debug ? { steps: ['init', 'navigate'] } : undefined,
    }

    await browser.close()

    // Persist to Google Sheets (fire-and-forget)
    try {
      const top = result.results[0]
      await fetch(`${req.nextUrl.origin}/api/saveToSheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteType: 'Meridional Auto Quotes',
          formData: {
            mode: body.mode,
            licensePlate: body.licensePlate,
            year: body.vehicle?.year,
            brand: body.vehicle?.brand,
            model: body.vehicle?.model,
            version: body.vehicle?.version,
            paymentMethod: body.paymentMethod,
            isParticular: body.usage?.isParticular ?? true,
            isZeroKm: body.flags?.isZeroKm ?? false,
            hasGNC: body.flags?.hasGNC ?? false,
            resultsCount: result.results.length,
            topPlanName: top?.planName,
            topPlanMonthly: top?.monthly,
            currency: top?.currency ?? 'ARS',
            durationMs: result.metadata.durationMs,
            traceId: result.metadata.traceId,
            sourceUrl: meridionalUrl,
          },
        }),
      })
    } catch (e) {
      // Non-blocking
      console.error('Sheets log failed:', e)
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Meridional quote error:', err?.message || err)
    return NextResponse.json({ success: false, message: 'UNEXPECTED', traceId }, { status: 500 })
  }
}