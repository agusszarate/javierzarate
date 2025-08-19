import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

// Configure Chrome/Chromium based on environment
export async function createBrowser() {
  const isDev = process.env.NODE_ENV === 'development'
  const chromeExecutablePath = process.env.CHROME_EXECUTABLE_PATH

  if (isDev && chromeExecutablePath) {
    // Local development with system Chrome
    return await puppeteer.launch({
      executablePath: chromeExecutablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    })
  } else if (isDev) {
    // Local development with full puppeteer
    const puppeteerFull = await import('puppeteer')
    return await puppeteerFull.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    })
  } else {
    // Production with @sparticuz/chromium
    try {
      // First, try to get the executable path
      let executablePath: string
      try {
        executablePath = await chromium.executablePath()
      } catch (pathError: any) {
        console.error('Failed to get chromium executable path:', pathError)
        
        // Try alternative approach
        if (process.env.AWS_EXECUTION_ENV || process.env.VERCEL) {
          // We're in a serverless environment, try manual path
          executablePath = await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin')
        } else {
          throw pathError
        }
      }
      
      return await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--single-process',
          '--no-zygote',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
        timeout: 30000,
      })
    } catch (error) {
      console.error('Failed to launch Chromium from @sparticuz/chromium:', error)
      
      // Fallback: try to use system Chrome/Chromium
      const fallbackPaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ]
      
      for (const path of fallbackPaths) {
        try {
          return await puppeteer.launch({
            executablePath: path,
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--disable-gpu',
              '--disable-web-security',
              '--window-size=1920,1080',
            ],
          })
        } catch {
          // Try next path
          continue
        }
      }
      
      // If all else fails, re-throw the original error
      throw error
    }
  }
}

// Meridional-specific selectors with comprehensive fallbacks
export const MERIDIONAL_SELECTORS = {
  // Cookie banner
  cookieAccept: 'button[id*="accept"], button[class*="accept"], .cookie-banner button, [data-accept], .btn-accept',
  
  // Mode toggle
  withoutPlateToggle: 'input[type="checkbox"], label[for*="sin-patente"], [class*="toggle"], [data-toggle]',
  
  // Input fields - enhanced with more variations and fallbacks
  licensePlateInput: [
    'input[placeholder="Patente"]',
    'input[placeholder*="patente" i]',
    'input[placeholder*="Patente"]',
    'input[name*="patente" i]', 
    'input[id*="patente" i]',
    'input[placeholder*="dominio" i]',
    'input[name*="dominio" i]',
    'input[id*="dominio" i]',
    'input[placeholder*="placa" i]',
    'input[name*="placa" i]',
    'input[placeholder*="AAA"]',
    'input[placeholder*="123"]', 
    'input[maxlength="6"]',
    'input[maxlength="7"]',
    'input[maxlength="8"]',
    'input[type="text"]:first-of-type',
    'input[type="text"]:nth-of-type(1)',
    '.form-control:first-of-type',
    '.input-field:first-of-type input',
    'form input[type="text"]:nth-of-type(1)',
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):first-of-type',
    'input[type="text"]',
    'input[class*="form"]',
    'input[class*="input"]'
  ].join(', '),
  
  yearInput: [
    'input[placeholder*="año"]',
    'input[name*="year"]', 
    'input[id*="year"]',
    'input[name*="año"]',
    'input[id*="año"]',
    'input[type="number"]',
    'input[min="1900"]',
    'input[max="2025"]'
  ].join(', '),
  
  brandInput: [
    'input[placeholder*="marca"]',
    'input[name*="marca"]',
    'input[id*="brand"]',
    'input[id*="marca"]',
    'input[list*="brand"]',
    'input[list*="marca"]'
  ].join(', '),
  
  brandSelect: [
    'select[name*="marca"]',
    'select[id*="brand"]',
    'select[id*="marca"]',
    'select option[value*="FORD"]'
  ].join(', '),
  
  modelInput: [
    'input[placeholder*="modelo"]',
    'input[name*="modelo"]',
    'input[id*="model"]',
    'input[id*="modelo"]',
    'input[list*="model"]',
    'input[list*="modelo"]'
  ].join(', '),
  
  modelSelect: [
    'select[name*="modelo"]',
    'select[id*="model"]',
    'select[id*="modelo"]'
  ].join(', '),
  
  versionInput: [
    'input[placeholder*="version"]',
    'input[name*="version"]',
    'input[id*="version"]',
    'input[placeholder*="versión"]',
    'input[name*="versión"]'
  ].join(', '),
  
  // Payment method
  paymentMethodSelect: [
    'select[name*="pago"]',
    'select[id*="payment"]',
    'select[id*="pago"]',
    'select option[value*="tarjeta"]'
  ].join(', '),
  
  creditCardOption: 'option[value*="tarjeta"], option[value*="credit"]',
  cbuOption: 'option[value*="cbu"], option[value*="transferencia"]',
  
  // Checkboxes
  particularUseCheckbox: [
    'input[type="checkbox"][name*="particular"]',
    'input[id*="particular"]',
    'input[type="checkbox"][value*="particular"]'
  ].join(', '),
  
  zeroKmCheckbox: [
    'input[type="checkbox"][name*="0km"]',
    'input[id*="zerokm"]',
    'input[id*="0km"]',
    'input[type="checkbox"][value*="0km"]'
  ].join(', '),
  
  gncCheckbox: [
    'input[type="checkbox"][name*="gnc"]',
    'input[id*="gnc"]',
    'input[type="checkbox"][value*="gnc"]'
  ].join(', '),
  
  // Action buttons
  searchButton: [
    'button[type="submit"]',
    'button[class*="buscar"]',
    'button[class*="search"]',
    'input[type="submit"]',
    '.btn-primary',
    '.btn-search',
    'button.btn.btn-primary',
    'button.btn-primary'
  ].join(', '),
  
  nextButton: [
    'button[class*="siguiente"]',
    'button[class*="next"]',
    'button:contains("Siguiente")',
    'button:contains("Continuar")',
    '.btn-next'
  ].join(', '),
  
  // Results
  resultsContainer: '[class*="resultado"], [class*="plan"], [class*="cotizacion"], .quote-result, .insurance-plan',
  planName: '[class*="plan-name"], [class*="producto"], h3, h4, .plan-title, .product-name',
  planPrice: '[class*="precio"], [class*="monthly"], [class*="mensual"], .price, .monthly-price',
  planDetails: '[class*="detalle"], [class*="cobertura"], [class*="description"], .plan-details, .coverage',
  franchise: '[class*="franquicia"], [class*="deducible"], .franchise, .deductible',
}

// Wait for element with timeout - enhanced with multiple selector support
export async function waitForSelector(page: any, selector: string, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true })
    return true
  } catch {
    console.log(`Selector not found: ${selector}`)
    return false
  }
}

// Enhanced selector finder - tries multiple selectors and returns debugging info
export async function findElement(page: any, selectorString: string, timeout = 10000) {
  const selectors = selectorString.split(', ').map(s => s.trim())
  
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / selectors.length, visible: true })
      console.log(`Found element with selector: ${selector}`)
      return { found: true, selector, element: await page.$(selector) }
    } catch {
      console.log(`Selector failed: ${selector}`)
      continue
    }
  }
  
  console.log(`All selectors failed for: ${selectorString}`)
  return { found: false, selector: null, element: null }
}

// Ultra-aggressive element finder for critical form fields
export async function findElementAggressive(page: any, elementType: 'licensePlate' | 'submit', timeout = 15000): Promise<any> {
  console.log(`Starting aggressive search for ${elementType}`)
  
  // Strategy 1: Try standard selectors first
  if (elementType === 'licensePlate') {
    const standardResult = await findElement(page, MERIDIONAL_SELECTORS.licensePlateInput, timeout / 3)
    if (standardResult.found) return standardResult
  } else if (elementType === 'submit') {
    const standardResult = await findElement(page, MERIDIONAL_SELECTORS.searchButton, timeout / 3)
    if (standardResult.found) return standardResult
  }
  
  // Strategy 2: Dynamic evaluation with comprehensive search
  const evaluationResult = await page.evaluate((type: string) => {
    const isVisible = (el: HTMLElement): boolean => {
      if (!el) return false
      const style = window.getComputedStyle(el)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      )
    }
    
    if (type === 'licensePlate') {
      // Find any visible text input that could be a license plate field
      const candidates = Array.from(document.querySelectorAll('input')).filter(input => {
        const el = input as HTMLInputElement
        const type = el.type.toLowerCase()
        return (
          (type === 'text' || type === '' || !type) &&
          isVisible(el) &&
          !el.disabled &&
          !el.readOnly
        )
      }) as HTMLInputElement[]
      
      // Score candidates by likelihood of being license plate input
      const scoredCandidates = candidates.map((input, index) => {
        let score = 0
        const attrs = [
          input.name?.toLowerCase() || '',
          input.id?.toLowerCase() || '',
          input.placeholder?.toLowerCase() || '',
          input.className?.toLowerCase() || ''
        ].join(' ')
        
        // High score indicators
        if (attrs.includes('patente')) score += 100
        if (attrs.includes('Patente')) score += 100  // Case-sensitive match
        if (attrs.includes('dominio')) score += 90
        if (attrs.includes('placa')) score += 80
        if (attrs.includes('plate')) score += 70
        
        // Medium score indicators
        if (attrs.includes('aaa') || attrs.includes('123')) score += 50
        if (input.maxLength >= 6 && input.maxLength <= 8) score += 40
        if (attrs.includes('vehiculo') || attrs.includes('auto')) score += 30
        
        // Position bonus (first visible input gets bonus)
        if (index === 0) score += 20
        
        // Penalty for unlikely fields
        if (attrs.includes('email') || attrs.includes('mail')) score -= 50
        if (attrs.includes('telefono') || attrs.includes('phone')) score -= 50
        if (attrs.includes('nombre') || attrs.includes('name')) score -= 30
        
        return {
          input,
          score,
          selector: input.id ? `#${input.id}` : 
                   input.name ? `input[name="${input.name}"]` :
                   `input:nth-of-type(${Array.from(document.querySelectorAll('input')).indexOf(input) + 1})`,
          attributes: attrs
        }
      })
      
      // Sort by score and return best candidate
      scoredCandidates.sort((a, b) => b.score - a.score)
      
      if (scoredCandidates.length > 0) {
        const best = scoredCandidates[0]
        return {
          found: true,
          selector: best.selector,
          score: best.score,
          attributes: best.attributes,
          totalCandidates: candidates.length
        }
      }
      
    } else if (type === 'submit') {
      // Find any visible button that could submit the form
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'))
        .filter(btn => isVisible(btn as HTMLElement)) as HTMLElement[]
      
      for (const button of buttons) {
        const text = (button.textContent || '').toLowerCase()
        const attrs = [
          (button as HTMLElement).className?.toLowerCase() || '',
          (button as HTMLInputElement).value?.toLowerCase() || ''
        ].join(' ')
        
        if (
          text.includes('buscar vehículo') ||
          text.includes('buscar vehiculo') ||
          text.includes('buscar') || 
          text.includes('cotizar') || 
          text.includes('siguiente') ||
          text.includes('continuar') ||
          attrs.includes('submit') ||
          attrs.includes('search') ||
          attrs.includes('primary') ||
          (button as HTMLButtonElement).type === 'submit'
        ) {
          return {
            found: true,
            selector: button.id ? `#${button.id}` : 
                     `button:nth-of-type(${Array.from(document.querySelectorAll('button')).indexOf(button as HTMLButtonElement) + 1})`,
            text: button.textContent?.trim()
          }
        }
      }
    }
    
    return { found: false }
  }, elementType)
  
  if (evaluationResult.found) {
    console.log(`Aggressive search found ${elementType}:`, evaluationResult)
    return evaluationResult
  }
  
  // Strategy 3: Check for iframes
  const iframes = await page.$$('iframe')
  for (let i = 0; i < iframes.length; i++) {
    try {
      const frame = await iframes[i].contentFrame()
      if (frame) {
        console.log(`Checking iframe ${i} for ${elementType}`)
        const frameResult: any = await findElementAggressive(frame, elementType, timeout / 3)
        if (frameResult.found) {
          console.log(`Found ${elementType} in iframe ${i}`)
          return { ...frameResult, inIframe: true, iframeIndex: i }
        }
      }
    } catch (error) {
      console.log(`Could not access iframe ${i}:`, error)
    }
  }
  
  console.log(`Aggressive search failed for ${elementType}`)
  return { found: false }
}

// Debug page state - capture available form elements
export async function debugPageState(page: any, stepName: string) {
  try {
    const debugInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: (input as HTMLInputElement).type,
        name: (input as HTMLInputElement).name || '',
        id: (input as HTMLInputElement).id || '',
        placeholder: (input as HTMLInputElement).placeholder || '',
        className: (input as HTMLInputElement).className || '',
        value: (input as HTMLInputElement).value || '',
        maxLength: (input as HTMLInputElement).maxLength || 0,
        visible: (input as HTMLElement).offsetParent !== null,
        tagName: input.tagName
      }))
      
      const selects = Array.from(document.querySelectorAll('select')).map(select => ({
        name: (select as HTMLSelectElement).name || '',
        id: (select as HTMLSelectElement).id || '',
        className: (select as HTMLSelectElement).className || '',
        options: Array.from((select as HTMLSelectElement).options).map(opt => opt.text).slice(0, 5), // First 5 options
        visible: (select as HTMLElement).offsetParent !== null
      }))
      
      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        type: (button as HTMLButtonElement).type,
        className: (button as HTMLButtonElement).className || '',
        textContent: (button as HTMLButtonElement).textContent?.trim() || '',
        visible: (button as HTMLElement).offsetParent !== null
      }))

      const forms = Array.from(document.querySelectorAll('form')).map((form, index) => ({
        index,
        id: (form as HTMLFormElement).id || '',
        className: (form as HTMLFormElement).className || '',
        action: (form as HTMLFormElement).action || '',
        inputCount: form.querySelectorAll('input').length,
        visible: (form as HTMLElement).offsetParent !== null
      }))

      const textInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])')).map((input, index) => ({
        index,
        id: (input as HTMLInputElement).id || '',
        name: (input as HTMLInputElement).name || '',
        placeholder: (input as HTMLInputElement).placeholder || '',
        className: (input as HTMLInputElement).className || '',
        visible: (input as HTMLElement).offsetParent !== null,
        selector: `input:nth-of-type(${index + 1})`
      }))
      
      return {
        url: window.location.href,
        title: document.title,
        totalInputs: inputs.length,
        visibleInputs: inputs.filter(i => i.visible).length,
        textInputs: textInputs,
        inputs: inputs,
        selects: selects,
        buttons: buttons,
        forms: forms,
        bodyHTML: document.body.innerHTML.substring(0, 2000) // First 2000 chars
      }
    })
    
    console.log(`[DEBUG ${stepName}] Page state:`, JSON.stringify(debugInfo, null, 2))
    return debugInfo
  } catch (error) {
    console.error(`[DEBUG ${stepName}] Failed to capture page state:`, error)
    return null
  }
}

// Human-like delay
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Generate trace ID for logging
export function generateTraceId(): string {
  return `meridional_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Extract text content safely
export async function safeGetText(page: any, selector: string): Promise<string> {
  try {
    const element = await page.$(selector)
    if (element) {
      return await page.evaluate((el: any) => el.textContent?.trim() || '', element)
    }
  } catch {
    // Ignore errors and return empty string
  }
  return ''
}

// Set input value with human-like typing
export async function setInputValue(page: any, selector: string, value: string) {
  const element = await page.$(selector)
  if (element) {
    await element.click()
    await delay(100)
    await element.clear()
    await delay(50)
    await element.type(value, { delay: 50 })
    await delay(100)
  }
}

// Select option by text or value
export async function selectOption(page: any, selector: string, optionText: string) {
  try {
    await page.select(selector, optionText)
  } catch {
    // If select by value fails, try by text
    await page.evaluate((sel: string, text: string) => {
      const select = document.querySelector(sel) as HTMLSelectElement
      if (select) {
        for (const option of Array.from(select.options)) {
          if (option.text.toLowerCase().includes(text.toLowerCase()) || 
              option.value.toLowerCase().includes(text.toLowerCase())) {
            option.selected = true
            select.dispatchEvent(new Event('change', { bubbles: true }))
            break
          }
        }
      }
    }, selector, optionText)
  }
}