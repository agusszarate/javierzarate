import { NextRequest, NextResponse } from 'next/server'
import { 
  createBrowser, 
  MERIDIONAL_SELECTORS, 
  waitForSelector,
  findElement,
  debugPageState,
  delay, 
  generateTraceId, 
  setInputValue, 
  selectOption 
} from '@/lib/puppeteer'

// Vercel serverless configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Types for the API
interface QuoteRequest {
  mode: 'byPlate' | 'byVehicle'
  licensePlate?: string
  vehicle?: {
    year: number
    brand: string
    model: string
    version?: string
  }
  paymentMethod?: 'Tarjeta de crédito' | 'CBU'
  usage?: { isParticular: boolean }
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

interface QuoteResponse {
  success: true
  insurer: string
  inputsEcho: any
  results: Array<{
    planName: string
    monthly: number
    currency: string
    details?: string
    franchise?: string
  }>
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

interface QuoteError {
  success: false
  code: string
  message: string
  retryable: boolean
  debug?: {
    steps?: string[]
    screenshotBase64?: string
    htmlSnippet?: string
  }
}

const DEFAULT_SOURCE_URL = 'https://productos.meridionalseguros.seg.ar/cotizacion/auto/AR160101MOFFAUAQDILMWB/seo_cotizacion'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const traceId = generateTraceId()
  const steps: string[] = []
  let browser: any = null
  let page: any = null
  let debug = false

  console.log(`[${traceId}] Starting Meridional quote request`)

  try {
    // Parse and validate request
    const body: QuoteRequest = await req.json()
    const {
      mode = 'byPlate',
      licensePlate,
      vehicle,
      paymentMethod = 'Tarjeta de crédito',
      usage = { isParticular: true },
      flags = {},
      owner,
      location,
      sourceUrl = DEFAULT_SOURCE_URL,
      debug: debugFromBody = false
    } = body

    debug = debugFromBody
    steps.push('Request parsed and validated')

    // Validate required fields
    if (mode === 'byPlate' && !licensePlate) {
      return NextResponse.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'License plate is required for byPlate mode',
        retryable: false
      } as QuoteError, { status: 422 })
    }

    if (mode === 'byVehicle' && (!vehicle?.year || !vehicle?.brand || !vehicle?.model)) {
      return NextResponse.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Year, brand, and model are required for byVehicle mode',
        retryable: false
      } as QuoteError, { status: 422 })
    }

    steps.push('Input validation completed')

    // Launch browser
    console.log(`[${traceId}] Launching browser`)
    try {
      browser = await createBrowser()
      page = await browser.newPage()
    } catch (error: any) {
      console.error(`[${traceId}] Browser launch failed:`, error)
      
      // Specific handling for Chromium binary issues
      if (error.message?.includes('bin') || error.message?.includes('executablePath') || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          code: 'BROWSER_LAUNCH_FAILED',
          message: 'Browser launch failed - Chromium binary issue in serverless environment',
          retryable: true,
          debug: debug ? { 
            steps: [...steps, `Browser launch error: ${error.message}`],
            errorType: 'CHROMIUM_BINARY_ERROR'
          } : undefined
        } as QuoteError, { status: 500 })
      }
      
      // Re-throw for other types of errors
      throw error
    }

    // Set realistic headers
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    )
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    })

    // Set timezone
    await page.emulateTimezone('America/Argentina/Buenos_Aires')

    steps.push('Browser launched and configured')

    // Navigate to the quote page
    console.log(`[${traceId}] Navigating to ${sourceUrl}`)
    await page.goto(sourceUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })

    steps.push('Page loaded')

    // Debug: capture initial page state
    if (debug) {
      await debugPageState(page, 'after_page_load')
    }

    // Accept cookies if banner appears
    await delay(2000)
    const cookieAcceptFound = await waitForSelector(page, MERIDIONAL_SELECTORS.cookieAccept, 3000)
    if (cookieAcceptFound) {
      await page.click(MERIDIONAL_SELECTORS.cookieAccept)
      await delay(1000)
      steps.push('Cookie banner accepted')
    }

    // Handle mode selection
    if (mode === 'byVehicle') {
      const toggleFound = await waitForSelector(page, MERIDIONAL_SELECTORS.withoutPlateToggle, 5000)
      if (toggleFound) {
        await page.click(MERIDIONAL_SELECTORS.withoutPlateToggle)
        await delay(1000)
        steps.push('Switched to byVehicle mode')
      } else {
        console.log(`[${traceId}] Warning: Could not find mode toggle`)
      }
    }

    // Fill form based on mode
    if (mode === 'byPlate') {
      // Fill license plate using enhanced selector strategy
      const plateResult = await findElement(page, MERIDIONAL_SELECTORS.licensePlateInput, 5000)
      if (plateResult.found) {
        await setInputValue(page, plateResult.selector!, licensePlate!)
        steps.push(`License plate entered using selector: ${plateResult.selector}`)
      } else {
        // Enhanced debugging when selector fails
        let debugScreenshot = undefined
        if (debug) {
          await debugPageState(page, 'license_plate_selector_failed')
          debugScreenshot = await page.screenshot({ encoding: 'base64' })
          console.log(`[${traceId}] License plate selector failed - screenshot captured`)
        }
        
        return NextResponse.json({
          success: false,
          code: 'SELECTOR_NOT_FOUND',
          message: 'License plate input not found',
          retryable: false,
          debug: debug ? { 
            steps: [...steps, 'Enhanced debugging enabled - see logs for page state'],
            attemptedSelectors: MERIDIONAL_SELECTORS.licensePlateInput.split(', '),
            screenshotBase64: debugScreenshot
          } : undefined
        } as QuoteError, { status: 500 })
      }
    } else {
      // Fill vehicle details using enhanced selectors
      const yearResult = await findElement(page, MERIDIONAL_SELECTORS.yearInput, 5000)
      if (yearResult.found) {
        await setInputValue(page, yearResult.selector!, vehicle!.year.toString())
        steps.push(`Vehicle year entered using selector: ${yearResult.selector}`)
      }

      // Try both input and select for brand
      let brandFilled = false
      const brandInputResult = await findElement(page, MERIDIONAL_SELECTORS.brandInput, 2000)
      if (brandInputResult.found) {
        await setInputValue(page, brandInputResult.selector!, vehicle!.brand)
        brandFilled = true
        steps.push(`Brand entered via input: ${brandInputResult.selector}`)
      } else {
        const brandSelectResult = await findElement(page, MERIDIONAL_SELECTORS.brandSelect, 2000)
        if (brandSelectResult.found) {
          await selectOption(page, brandSelectResult.selector!, vehicle!.brand)
          brandFilled = true
          steps.push(`Brand selected via select: ${brandSelectResult.selector}`)
        }
      }

      if (!brandFilled) {
        if (debug) {
          await debugPageState(page, 'brand_selector_failed')
        }
        return NextResponse.json({
          success: false,
          code: 'SELECTOR_NOT_FOUND',
          message: 'Brand input/select not found',
          retryable: false,
          debug: debug ? { 
            steps: [...steps, 'Brand selector debugging enabled'],
            attemptedInputSelectors: MERIDIONAL_SELECTORS.brandInput.split(', '),
            attemptedSelectSelectors: MERIDIONAL_SELECTORS.brandSelect.split(', ')
          } : undefined
        } as QuoteError, { status: 500 })
      }

      // Try both input and select for model
      let modelFilled = false
      await delay(1000) // Wait for dependent field to load
      const modelInputResult = await findElement(page, MERIDIONAL_SELECTORS.modelInput, 2000)
      if (modelInputResult.found) {
        await setInputValue(page, modelInputResult.selector!, vehicle!.model)
        modelFilled = true
        steps.push(`Model entered via input: ${modelInputResult.selector}`)
      } else {
        const modelSelectResult = await findElement(page, MERIDIONAL_SELECTORS.modelSelect, 2000)
        if (modelSelectResult.found) {
          await selectOption(page, modelSelectResult.selector!, vehicle!.model)
          modelFilled = true
          steps.push(`Model selected via select: ${modelSelectResult.selector}`)
        }
      }

      if (modelFilled) {
        steps.push('Vehicle model entered successfully')
      }

      // Version (optional)
      if (vehicle!.version) {
        const versionResult = await findElement(page, MERIDIONAL_SELECTORS.versionInput, 2000)
        if (versionResult.found) {
          await setInputValue(page, versionResult.selector!, vehicle!.version)
          steps.push(`Vehicle version entered using: ${versionResult.selector}`)
        }
      }
    }

    // Set payment method
    if (await waitForSelector(page, MERIDIONAL_SELECTORS.paymentMethodSelect, 3000)) {
      await selectOption(page, MERIDIONAL_SELECTORS.paymentMethodSelect, paymentMethod)
      steps.push(`Payment method set to ${paymentMethod}`)
    }

    // Set usage flags
    if (await waitForSelector(page, MERIDIONAL_SELECTORS.particularUseCheckbox, 2000)) {
      const isChecked = await page.evaluate((selector: string) => {
        const checkbox = document.querySelector(selector) as HTMLInputElement
        return checkbox?.checked || false
      }, MERIDIONAL_SELECTORS.particularUseCheckbox)

      if (usage.isParticular !== isChecked) {
        await page.click(MERIDIONAL_SELECTORS.particularUseCheckbox)
        steps.push(`Usage set to particular: ${usage.isParticular}`)
      }
    }

    // Set 0km flag
    if (flags.isZeroKm && await waitForSelector(page, MERIDIONAL_SELECTORS.zeroKmCheckbox, 2000)) {
      await page.click(MERIDIONAL_SELECTORS.zeroKmCheckbox)
      steps.push('0km flag set')
    }

    // Set GNC flag
    if (flags.hasGNC && await waitForSelector(page, MERIDIONAL_SELECTORS.gncCheckbox, 2000)) {
      await page.click(MERIDIONAL_SELECTORS.gncCheckbox)
      steps.push('GNC flag set')
    }

    // Submit form using enhanced selector strategy
    let submitSuccess = false
    const searchResult = await findElement(page, MERIDIONAL_SELECTORS.searchButton, 5000)
    if (searchResult.found) {
      await page.click(searchResult.selector!)
      submitSuccess = true
      steps.push(`Form submitted using: ${searchResult.selector}`)
    } else {
      const nextResult = await findElement(page, MERIDIONAL_SELECTORS.nextButton, 2000)
      if (nextResult.found) {
        await page.click(nextResult.selector!)
        submitSuccess = true
        steps.push(`Next button clicked using: ${nextResult.selector}`)
      }
    }

    if (!submitSuccess) {
      if (debug) {
        await debugPageState(page, 'submit_button_failed')
      }
      return NextResponse.json({
        success: false,
        code: 'SELECTOR_NOT_FOUND',
        message: 'Submit button not found',
        retryable: false,
        debug: debug ? { 
          steps: [...steps, 'Submit button debugging enabled'],
          attemptedSearchSelectors: MERIDIONAL_SELECTORS.searchButton.split(', '),
          attemptedNextSelectors: MERIDIONAL_SELECTORS.nextButton.split(', ')
        } : undefined
      } as QuoteError, { status: 500 })
    }

    // Wait for results or additional form
    await delay(5000)

    // Check if additional personal info is required
    const needsMoreInfo = await page.evaluate(() => {
      const forms = document.querySelectorAll('form')
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]')
      return forms.length > 0 && inputs.length > 2
    })

    if (needsMoreInfo && (owner || location)) {
      // Fill additional information if provided
      steps.push('Additional personal information required')
      
      if (owner?.email && await waitForSelector(page, 'input[type="email"]', 3000)) {
        await setInputValue(page, 'input[type="email"]', owner.email)
        steps.push('Email filled')
      }

      if (owner?.phone && await waitForSelector(page, 'input[type="tel"]', 2000)) {
        await setInputValue(page, 'input[type="tel"]', owner.phone)
        steps.push('Phone filled')
      }

      if (location?.postalCode && await waitForSelector(page, 'input[name*="postal"], input[id*="postal"]', 2000)) {
        await setInputValue(page, 'input[name*="postal"], input[id*="postal"]', location.postalCode)
        steps.push('Postal code filled')
      }

      // Submit additional info
      if (await waitForSelector(page, MERIDIONAL_SELECTORS.nextButton, 3000)) {
        await page.click(MERIDIONAL_SELECTORS.nextButton)
        await delay(5000)
        steps.push('Additional info submitted')
      }
    } else if (needsMoreInfo) {
      return NextResponse.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Additional personal information required but not provided',
        retryable: false
      } as QuoteError, { status: 422 })
    }

    // Extract results
    await delay(3000)
    
    const results = await page.evaluate((selectors: any) => {
      const resultsElements = document.querySelectorAll(selectors.resultsContainer)
      const plans: any[] = []

      resultsElements.forEach((container: Element) => {
        const nameEl = container.querySelector(selectors.planName)
        const priceEl = container.querySelector(selectors.planPrice)
        const detailsEl = container.querySelector(selectors.planDetails)
        const franchiseEl = container.querySelector(selectors.franchise)

        if (nameEl && priceEl) {
          const priceText = priceEl.textContent?.trim() || ''
          const priceMatch = priceText.match(/[\d.,]+/)
          const monthly = priceMatch ? parseFloat(priceMatch[0].replace(/[.,]/g, '')) : 0

          plans.push({
            planName: nameEl.textContent?.trim() || 'Plan sin nombre',
            monthly,
            currency: 'ARS',
            details: detailsEl?.textContent?.trim(),
            franchise: franchiseEl?.textContent?.trim(),
          })
        }
      })

      return plans
    }, MERIDIONAL_SELECTORS)

    if (results.length === 0) {
      // Check for error messages or antibot
      const pageText = await page.evaluate(() => document.body.textContent?.toLowerCase() || '')
      
      if (pageText.includes('captcha') || pageText.includes('verificación') || pageText.includes('robot')) {
        return NextResponse.json({
          success: false,
          code: 'ANTIBOT_BLOCK',
          message: 'Antibot protection detected',
          retryable: false
        } as QuoteError, { status: 429 })
      }

      return NextResponse.json({
        success: false,
        code: 'NO_RESULTS',
        message: 'No quote results found',
        retryable: true
      } as QuoteError, { status: 500 })
    }

    steps.push(`Found ${results.length} quote results`)

    // Prepare debug info if requested
    let debugInfo: any = undefined
    if (debug) {
      const screenshot = await page.screenshot({ encoding: 'base64' })
      const htmlSnippet = await page.evaluate(() => 
        document.documentElement.outerHTML.substring(0, 5000)
      )
      
      debugInfo = {
        steps,
        screenshotBase64: screenshot,
        htmlSnippet
      }
    }

    // Prepare response
    const response: QuoteResponse = {
      success: true,
      insurer: 'Meridional Seguros',
      inputsEcho: { mode, licensePlate, vehicle, paymentMethod, usage, flags },
      results,
      metadata: {
        quotedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        pageVersion: await page.evaluate(() => document.title || 'Unknown'),
        traceId
      },
      debug: debugInfo
    }

    // Save to Google Sheets (async, don't block response)
    if (results.length > 0) {
      saveToGoogleSheets(req, response, traceId).catch(error => 
        console.error(`[${traceId}] Failed to save to Google Sheets:`, error)
      )
    }

    console.log(`[${traceId}] Quote completed successfully in ${Date.now() - startTime}ms`)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error(`[${traceId}] Error in Meridional quote:`, error)
    
    const isTimeout = error.message?.includes('timeout') || error.name === 'TimeoutError'
    const errorCode = isTimeout ? 'NAVIGATION_TIMEOUT' : 'UNEXPECTED'
    const statusCode = isTimeout ? 504 : 500

    return NextResponse.json({
      success: false,
      code: errorCode,
      message: error.message || 'Unexpected error occurred',
      retryable: isTimeout,
      debug: debug ? { steps } : undefined
    } as QuoteError, { status: statusCode })

  } finally {
    // Cleanup
    try {
      if (page) await page.close()
      if (browser) await browser.close()
      console.log(`[${traceId}] Browser cleanup completed`)
    } catch (cleanupError) {
      console.error(`[${traceId}] Cleanup error:`, cleanupError)
    }
  }
}

// Save to Google Sheets (async helper)
async function saveToGoogleSheets(req: NextRequest, quoteResponse: QuoteResponse, traceId: string) {
  try {
    const { inputsEcho, results, metadata } = quoteResponse
    
    // Get the best plan (first one or highest priced)
    const topPlan = results.length > 0 ? results[0] : null
    
    // Construct the payload for Google Sheets
    const formData = {
      mode: inputsEcho.mode,
      licensePlate: inputsEcho.licensePlate || '',
      year: inputsEcho.vehicle?.year || '',
      brand: inputsEcho.vehicle?.brand || '',
      model: inputsEcho.vehicle?.model || '',
      version: inputsEcho.vehicle?.version || '',
      paymentMethod: inputsEcho.paymentMethod,
      isParticular: inputsEcho.usage?.isParticular,
      isZeroKm: inputsEcho.flags?.isZeroKm || false,
      hasGNC: inputsEcho.flags?.hasGNC || false,
      resultsCount: results.length,
      topPlanName: topPlan?.planName || '',
      topPlanMonthly: topPlan?.monthly || 0,
      currency: 'ARS',
      rawResultsJson: JSON.stringify(results),
      sourceUrl: DEFAULT_SOURCE_URL,
      durationMs: metadata.durationMs,
      traceId: metadata.traceId
    }

    // Determine base URL for the request
    const host = req.headers.get('host')
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `https://${host}`
    
    const response = await fetch(`${baseUrl}/api/saveToSheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteType: 'Meridional Auto Quotes',
        formData
      }),
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })

    if (!response.ok) {
      console.error(`[${traceId}] Google Sheets save failed: ${response.status}`)
    } else {
      console.log(`[${traceId}] Successfully saved to Google Sheets`)
    }
  } catch (error) {
    console.error(`[${traceId}] Google Sheets save error:`, error)
  }
}