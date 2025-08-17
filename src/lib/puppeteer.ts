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

// Meridional-specific selectors
export const MERIDIONAL_SELECTORS = {
  // Cookie banner
  cookieAccept: 'button[id*="accept"], button[class*="accept"], .cookie-banner button',
  
  // Mode toggle
  withoutPlateToggle: 'input[type="checkbox"], label[for*="sin-patente"], [class*="toggle"]',
  
  // Input fields  
  licensePlateInput: 'input[placeholder*="patente"], input[name*="patente"], input[id*="patente"]',
  yearInput: 'input[placeholder*="año"], input[name*="year"], input[id*="year"]',
  brandInput: 'input[placeholder*="marca"], input[name*="marca"], input[id*="brand"]',
  brandSelect: 'select[name*="marca"], select[id*="brand"]',
  modelInput: 'input[placeholder*="modelo"], input[name*="modelo"], input[id*="model"]',
  modelSelect: 'select[name*="modelo"], select[id*="model"]',
  versionInput: 'input[placeholder*="version"], input[name*="version"]',
  
  // Payment method
  paymentMethodSelect: 'select[name*="pago"], select[id*="payment"]',
  creditCardOption: 'option[value*="tarjeta"], option[value*="credit"]',
  cbuOption: 'option[value*="cbu"], option[value*="transferencia"]',
  
  // Checkboxes
  particularUseCheckbox: 'input[type="checkbox"][name*="particular"], input[id*="particular"]',
  zeroKmCheckbox: 'input[type="checkbox"][name*="0km"], input[id*="zerokm"]',
  gncCheckbox: 'input[type="checkbox"][name*="gnc"], input[id*="gnc"]',
  
  // Action buttons
  searchButton: 'button[type="submit"], button[class*="buscar"], button[class*="search"]',
  nextButton: 'button[class*="siguiente"], button[class*="next"]',
  
  // Results
  resultsContainer: '[class*="resultado"], [class*="plan"], [class*="cotizacion"]',
  planName: '[class*="plan-name"], [class*="producto"], h3, h4',
  planPrice: '[class*="precio"], [class*="monthly"], [class*="mensual"]',
  planDetails: '[class*="detalle"], [class*="cobertura"], [class*="description"]',
  franchise: '[class*="franquicia"], [class*="deducible"]',
}

// Wait for element with timeout
export async function waitForSelector(page: any, selector: string, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true })
    return true
  } catch {
    console.log(`Selector not found: ${selector}`)
    return false
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