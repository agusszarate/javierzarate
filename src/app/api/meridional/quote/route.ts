import { NextRequest, NextResponse } from 'next/server'
import { MeridionalBrowser, MERIDIONAL_SELECTORS, waitForSelector, clickElement, typeText, selectOption, humanDelay } from '@/lib/meridionalBrowser'

// Vercel configuration for serverless function
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Generate unique trace ID for logging
const generateTraceId = () => Math.random().toString(36).substring(2, 15)

// Validation schemas
interface QuoteRequestByPlate {
    mode: 'byPlate'
    licensePlate: string
    paymentMethod?: 'Tarjeta de crédito' | 'CBU'
    usage: { isParticular: boolean }
    flags?: { isZeroKm?: boolean; hasGNC?: boolean }
    owner?: {
        documentType?: 'DNI' | 'CUIT'
        documentNumber?: string
        birthDate?: string
        email?: string
        phone?: string
    }
    location?: {
        postalCode?: string
        province?: string
        locality?: string
    }
    sourceUrl?: string
    debug?: boolean
}

interface QuoteRequestByVehicle {
    mode: 'byVehicle'
    vehicle: {
        year: number
        brand: string
        model: string
        version?: string
    }
    paymentMethod?: 'Tarjeta de crédito' | 'CBU'
    usage: { isParticular: boolean }
    flags?: { isZeroKm?: boolean; hasGNC?: boolean }
    owner?: {
        documentType?: 'DNI' | 'CUIT'
        documentNumber?: string
        birthDate?: string
        email?: string
        phone?: string
    }
    location?: {
        postalCode?: string
        province?: string
        locality?: string
    }
    sourceUrl?: string
    debug?: boolean
}

type QuoteRequest = QuoteRequestByPlate | QuoteRequestByVehicle

interface QuoteResult {
    planName: string
    monthly: number
    currency: 'ARS'
    details?: string
    franchise?: string
}

interface QuoteResponse {
    success: true
    insurer: 'Meridional Seguros'
    inputsEcho: QuoteRequest
    results: QuoteResult[]
    metadata: {
        quotedAt: string
        durationMs: number
        pageVersion?: string
        traceId: string
    }
    debug?: {
        steps?: string[]
        screenshotBase64?: string
        htmlSnippet?: string
    }
}

interface ErrorResponse {
    success: false
    code: 'VALIDATION_ERROR' | 'NAVIGATION_TIMEOUT' | 'ANTIBOT_BLOCK' | 'SELECTOR_NOT_FOUND' | 'UNEXPECTED'
    message: string
    retryable: boolean
    debug?: {
        steps?: string[]
        screenshotBase64?: string
        htmlSnippet?: string
    }
}

const validateRequest = (body: any): { valid: boolean; error?: string; data?: QuoteRequest } => {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Request body is required' }
    }

    const mode = body.mode || 'byPlate'
    
    if (mode === 'byPlate') {
        if (!body.licensePlate || typeof body.licensePlate !== 'string') {
            return { valid: false, error: 'licensePlate is required for byPlate mode' }
        }
    } else if (mode === 'byVehicle') {
        if (!body.vehicle || !body.vehicle.year || !body.vehicle.brand || !body.vehicle.model) {
            return { valid: false, error: 'vehicle.year, vehicle.brand, and vehicle.model are required for byVehicle mode' }
        }
    } else {
        return { valid: false, error: 'mode must be "byPlate" or "byVehicle"' }
    }

    return { valid: true, data: body as QuoteRequest }
}

const performMeridionalScraping = async (
    request: QuoteRequest,
    traceId: string
): Promise<QuoteResponse | ErrorResponse> => {
    const startTime = Date.now()
    const steps: string[] = []
    const sourceUrl = request.sourceUrl || 'https://productos.meridionalseguros.seg.ar/cotizacion/auto/AR160101MOFFAUAQDILMWB/seo_cotizacion'
    
    const browser = new MeridionalBrowser()
    
    try {
        // Step 1: Launch browser and navigate
        steps.push('Launching browser')
        const page = await browser.launch({ timeout: 45000 })
        
        steps.push(`Navigating to ${sourceUrl}`)
        await page.goto(sourceUrl, { waitUntil: 'networkidle2', timeout: 30000 })
        
        // Step 2: Accept cookies if present
        steps.push('Checking for cookie consent')
        try {
            await page.waitForSelector(MERIDIONAL_SELECTORS.cookieAccept, { timeout: 3000 })
            await clickElement(page, MERIDIONAL_SELECTORS.cookieAccept, 2000)
            await humanDelay(500, 1000)
        } catch {
            // No cookie consent found, continue
            steps.push('No cookie consent found')
        }
        
        // Step 3: Wait for form container
        steps.push('Waiting for form container')
        await waitForSelector(page, MERIDIONAL_SELECTORS.formContainer, 10000)
        
        // Step 4: Configure mode (byPlate vs byVehicle)
        if (request.mode === 'byVehicle') {
            steps.push('Enabling "Cotizar sin patente" mode')
            await clickElement(page, MERIDIONAL_SELECTORS.toggleWithoutPlate, 5000)
            await humanDelay()
        } else {
            steps.push('Using "byPlate" mode (default)')
        }
        
        // Step 5: Fill form fields based on mode
        if (request.mode === 'byPlate') {
            steps.push(`Entering license plate: ${request.licensePlate}`)
            await typeText(page, MERIDIONAL_SELECTORS.licensePlateInput, request.licensePlate, 5000)
        } else {
            const { vehicle } = request
            steps.push(`Entering vehicle data: ${vehicle.year} ${vehicle.brand} ${vehicle.model}`)
            
            await typeText(page, MERIDIONAL_SELECTORS.yearInput, vehicle.year.toString(), 5000)
            await humanDelay()
            await typeText(page, MERIDIONAL_SELECTORS.brandInput, vehicle.brand, 5000)
            await humanDelay()
            await typeText(page, MERIDIONAL_SELECTORS.modelInput, vehicle.model, 5000)
            
            if (vehicle.version) {
                // Version input might not be present in the form, handle gracefully
                try {
                    await typeText(page, 'input[placeholder="Versión"]', vehicle.version, 3000)
                } catch {
                    steps.push('Version field not found, skipping')
                }
            }
        }
        
        // Step 6: Set payment method
        const paymentValue = request.paymentMethod === 'CBU' ? '4' : '2' // Based on HTML options
        steps.push(`Setting payment method: ${request.paymentMethod || 'Tarjeta de crédito'}`)
        await selectOption(page, MERIDIONAL_SELECTORS.paymentMethodSelect, paymentValue, 5000)
        await humanDelay()
        
        // Step 7: Set usage flags
        steps.push('Setting usage flags')
        
        // Usage particular should be checked by default, ensure it's set correctly
        const isParticularChecked = await page.$eval(MERIDIONAL_SELECTORS.usageCheckbox, (el: any) => el.checked)
        if (request.usage.isParticular && !isParticularChecked) {
            await clickElement(page, MERIDIONAL_SELECTORS.usageCheckbox, 3000)
        } else if (!request.usage.isParticular && isParticularChecked) {
            await clickElement(page, MERIDIONAL_SELECTORS.usageCheckbox, 3000)
        }
        
        // Set 0Km flag if applicable
        if (request.flags?.isZeroKm) {
            await clickElement(page, MERIDIONAL_SELECTORS.zeroKmCheckbox, 3000)
            await humanDelay()
        }
        
        // Set GNC flag if applicable
        if (request.flags?.hasGNC) {
            await clickElement(page, MERIDIONAL_SELECTORS.gncCheckbox, 3000)
            await humanDelay()
        }
        
        // Step 8: Submit form
        if (request.mode === 'byPlate') {
            steps.push('Clicking "Buscar vehículo"')
            await clickElement(page, MERIDIONAL_SELECTORS.searchButton, 5000)
        } else {
            steps.push('Clicking "Siguiente"')
            await clickElement(page, MERIDIONAL_SELECTORS.nextButton, 5000)
        }
        
        // Step 9: Wait for navigation or results
        steps.push('Waiting for response/navigation')
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {
            // Navigation might not occur, check for results on same page
            steps.push('No navigation detected, checking for results on current page')
        })
        
        // Step 10: Check for additional data requirements
        // This is where we might need to fill personal info if required
        if (request.owner || request.location) {
            steps.push('Checking for additional data requirements')
            // TODO: Implement personal data and location filling if needed
        }
        
        // Step 11: Extract results
        steps.push('Extracting quote results')
        
        // Wait for results container
        await waitForSelector(page, MERIDIONAL_SELECTORS.resultsContainer, 15000)
        
        // Extract plan information
        const results = await page.evaluate((selectors) => {
            const plans: QuoteResult[] = []
            const planElements = document.querySelectorAll(selectors.planCard)
            
            planElements.forEach((planEl) => {
                try {
                    const nameEl = planEl.querySelector(selectors.planName)
                    const priceEl = planEl.querySelector(selectors.planPrice)
                    const detailsEl = planEl.querySelector(selectors.planDetails)
                    
                    if (nameEl && priceEl) {
                        const planName = nameEl.textContent?.trim() || 'Plan sin nombre'
                        const priceText = priceEl.textContent?.trim() || '0'
                        
                        // Extract numeric price (handle different formats)
                        const priceMatch = priceText.match(/[\d.,]+/)
                        const monthly = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0
                        
                        plans.push({
                            planName,
                            monthly,
                            currency: 'ARS' as const,
                            details: detailsEl?.textContent?.trim(),
                            franchise: '', // Extract franchise if available
                        })
                    }
                } catch (error) {
                    console.warn('Error extracting plan data:', error)
                }
            })
            
            return plans
        }, MERIDIONAL_SELECTORS)
        
        if (results.length === 0) {
            // Fallback: try to extract any pricing information from the page
            const fallbackResults = await page.evaluate(() => {
                const plans: QuoteResult[] = []
                
                // Look for common price patterns in the page
                const priceElements = document.querySelectorAll('[data-price], .price, .premium, .cost')
                priceElements.forEach((el, index) => {
                    const text = el.textContent?.trim()
                    if (text && /\$[\d.,]+/.test(text)) {
                        const priceMatch = text.match(/\$([\d.,]+)/)
                        if (priceMatch) {
                            plans.push({
                                planName: `Plan ${index + 1}`,
                                monthly: parseFloat(priceMatch[1].replace(',', '.')),
                                currency: 'ARS' as const,
                            })
                        }
                    }
                })
                
                return plans
            })
            
            if (fallbackResults.length > 0) {
                results.push(...fallbackResults)
                steps.push(`Extracted ${fallbackResults.length} results using fallback method`)
            }
        }
        
        if (results.length === 0) {
            return {
                success: false,
                code: 'SELECTOR_NOT_FOUND',
                message: 'No quote results found on the page',
                retryable: true,
                debug: request.debug ? {
                    steps,
                    screenshotBase64: await page.screenshot({ encoding: 'base64' }),
                    htmlSnippet: (await page.content()).substring(0, 2000),
                } : undefined,
            }
        }
        
        steps.push(`Successfully extracted ${results.length} quote results`)
        
        // Step 12: Save to Google Sheets if successful
        if (results.length > 0) {
            try {
                steps.push('Saving to Google Sheets')
                await saveToGoogleSheets(request, results, traceId)
                steps.push('Successfully saved to Google Sheets')
            } catch (error) {
                steps.push(`Failed to save to Google Sheets: ${error}`)
                // Don't fail the request if saving fails
            }
        }
        
        const durationMs = Date.now() - startTime
        
        return {
            success: true,
            insurer: 'Meridional Seguros',
            inputsEcho: request,
            results,
            metadata: {
                quotedAt: new Date().toISOString(),
                durationMs,
                traceId,
            },
            debug: request.debug ? {
                steps,
                screenshotBase64: await page.screenshot({ encoding: 'base64' }),
                htmlSnippet: (await page.content()).substring(0, 2000),
            } : undefined,
        }
        
    } catch (error: any) {
        // Determine error type
        let code: ErrorResponse['code'] = 'UNEXPECTED'
        let retryable = false
        
        if (error.message?.includes('timeout') || error.message?.includes('Navigation')) {
            code = 'NAVIGATION_TIMEOUT'
            retryable = true
        } else if (error.message?.includes('captcha') || error.message?.includes('blocked')) {
            code = 'ANTIBOT_BLOCK'
            retryable = false
        } else if (error.message?.includes('selector')) {
            code = 'SELECTOR_NOT_FOUND'
            retryable = true
        }
        
        steps.push(`Error: ${error.message}`)
        
        let debugInfo: ErrorResponse['debug'] = undefined
        if (request.debug) {
            try {
                const page = browser.getPage()
                debugInfo = {
                    steps,
                    screenshotBase64: await page.screenshot({ encoding: 'base64' }),
                    htmlSnippet: (await page.content()).substring(0, 2000),
                }
            } catch {
                debugInfo = { steps }
            }
        }
        
        return {
            success: false,
            code,
            message: error.message || 'Unexpected error during scraping',
            retryable,
            debug: debugInfo,
        }
    } finally {
        await browser.close()
    }
}

// Function to save successful quotes to Google Sheets
const saveToGoogleSheets = async (request: QuoteRequest, results: QuoteResult[], traceId: string) => {
    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    
    const topPlan = results[0]
    const formData = {
        mode: request.mode,
        licensePlate: 'licensePlate' in request ? request.licensePlate : undefined,
        year: 'vehicle' in request ? request.vehicle.year : undefined,
        brand: 'vehicle' in request ? request.vehicle.brand : undefined,
        model: 'vehicle' in request ? request.vehicle.model : undefined,
        version: 'vehicle' in request ? request.vehicle.version : undefined,
        paymentMethod: request.paymentMethod || 'Tarjeta de crédito',
        isParticular: request.usage.isParticular,
        isZeroKm: request.flags?.isZeroKm || false,
        hasGNC: request.flags?.hasGNC || false,
        resultsCount: results.length,
        topPlanName: topPlan.planName,
        topPlanMonthly: topPlan.monthly,
        currency: 'ARS',
        rawResultsJson: JSON.stringify(results),
        sourceUrl: request.sourceUrl || 'Meridional',
        traceId,
    }
    
    const response = await fetch(`${host}/api/saveToSheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteType: 'Meridional Auto Quotes',
            formData,
        }),
        signal: AbortSignal.timeout(3000), // 3 second timeout
    })
    
    if (!response.ok) {
        throw new Error(`Failed to save to Google Sheets: ${response.status}`)
    }
}

export async function POST(req: NextRequest) {
    const traceId = generateTraceId()
    
    try {
        const body = await req.json()
        const validation = validateRequest(body)
        
        if (!validation.valid) {
            return NextResponse.json({
                success: false,
                code: 'VALIDATION_ERROR',
                message: validation.error,
                retryable: false,
            } as ErrorResponse, { status: 422 })
        }
        
        const result = await performMeridionalScraping(validation.data!, traceId)
        
        if (result.success) {
            return NextResponse.json(result, { status: 200 })
        } else {
            const statusCode = result.code === 'VALIDATION_ERROR' ? 422 :
                              result.code === 'NAVIGATION_TIMEOUT' ? 504 :
                              result.code === 'ANTIBOT_BLOCK' ? 429 : 500
            
            return NextResponse.json(result, { status: statusCode })
        }
        
    } catch (error: any) {
        console.error(`[${traceId}] Unexpected error:`, error)
        
        return NextResponse.json({
            success: false,
            code: 'UNEXPECTED',
            message: 'Internal server error',
            retryable: true,
        } as ErrorResponse, { status: 500 })
    }
}