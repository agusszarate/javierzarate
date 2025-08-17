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
    'input[placeholder*="patente"]',
    'input[name*="patente"]', 
    'input[id*="patente"]',
    'input[placeholder*="dominio"]',
    'input[name*="dominio"]',
    'input[id*="dominio"]',
    'input[placeholder*="placa"]',
    'input[name*="placa"]',
    'input[type="text"]:first-of-type',
    'input[maxlength="6"]',
    'input[maxlength="7"]',
    'input[maxlength="8"]',
    '.form-control:first-of-type',
    '.input-field:first-of-type input',
    'form input[type="text"]:nth-of-type(1)'
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
    'button:contains("Buscar")',
    'button:contains("Cotizar")'
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

// Debug page state - capture available form elements
export async function debugPageState(page: any, stepName: string) {
  try {
    const debugInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name || '',
        id: input.id || '',
        placeholder: input.placeholder || '',
        className: input.className || '',
        value: input.value || ''
      }))
      
      const selects = Array.from(document.querySelectorAll('select')).map(select => ({
        name: select.name || '',
        id: select.id || '',
        className: select.className || '',
        options: Array.from(select.options).map(opt => opt.text).slice(0, 5) // First 5 options
      }))
      
      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        type: button.type,
        className: button.className || '',
        textContent: (button.textContent || '').trim().slice(0, 50)
      }))
      
      return {
        url: window.location.href,
        title: document.title,
        inputs: inputs.slice(0, 10), // First 10 inputs
        selects: selects.slice(0, 5), // First 5 selects
        buttons: buttons.slice(0, 10) // First 10 buttons
      }
    })
    
    console.log(`[DEBUG ${stepName}]`, JSON.stringify(debugInfo, null, 2))
    return debugInfo
  } catch (error) {
    console.log(`[DEBUG ${stepName}] Failed to capture page state:`, error)
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