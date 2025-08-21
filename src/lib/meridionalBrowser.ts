// Puppeteer browser management utilities for Meridional scraping
import puppeteer, { Browser, Page } from 'puppeteer-core'

// Find Chrome executable path with better fallback logic
const findChromeExecutable = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    
    // Try to use bundled Chromium from puppeteer package first
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const puppeteer = require('puppeteer')
        if (puppeteer.executablePath) {
            const bundledPath = puppeteer.executablePath()
            if (fs.existsSync(bundledPath)) {
                console.log(`Using bundled Chromium: ${bundledPath}`)
                return bundledPath
            }
        }
    } catch {
        console.log('puppeteer package not available or no bundled Chromium, trying system paths...')
    }
    
    const possiblePaths = [
        process.env.CHROME_EXECUTABLE_PATH,
        '/opt/google/chrome/chrome',         // Direct Chrome binary (preferred)
        '/opt/google/chrome/google-chrome',  // Chrome wrapper script
        '/usr/bin/google-chrome-stable',     // Stable version symlink
        '/usr/bin/google-chrome',            // Generic symlink
        '/usr/bin/chromium-browser',         // Ubuntu/Debian Chromium
        '/usr/bin/chromium',                 // Alternative Chromium
        // macOS paths
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ].filter(Boolean)

    for (const execPath of possiblePaths) {
        try {
            // Check if the file exists and is executable
            if (fs.existsSync(execPath) && fs.accessSync(execPath, fs.constants.X_OK) === undefined) {
                // For symlinks, resolve to the actual binary if it's a direct binary
                try {
                    const resolvedPath = fs.realpathSync(execPath)
                    
                    // Prefer direct binaries over wrapper scripts
                    if (resolvedPath.endsWith('/chrome') && !resolvedPath.includes('google-chrome')) {
                        console.log(`Using resolved Chrome path: ${resolvedPath}`)
                        return resolvedPath
                    }
                    
                    // Check if the resolved path is also executable
                    if (fs.existsSync(resolvedPath) && fs.accessSync(resolvedPath, fs.constants.X_OK) === undefined) {
                        console.log(`Using resolved Chrome path: ${resolvedPath}`)
                        return resolvedPath
                    }
                } catch {
                    // If realpath fails, fall back to original path
                }
                
                console.log(`Using Chrome path: ${execPath}`)
                return execPath
            }
        } catch {
            continue
        }
    }
    
    throw new Error(`No Chrome executable found. Tried paths: ${possiblePaths.join(', ')}`)
}

// Chromium config for different environments
const getChromiumConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL
    
    // First try @sparticuz/chromium for production environments or if explicitly available
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const chromium = require('@sparticuz/chromium')
        if (isProduction || chromium.executablePath) {
            console.log('Using @sparticuz/chromium')
            return {
                executablePath: chromium.executablePath,
                args: [
                    ...chromium.args,
                    '--disable-gpu',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--single-process',
                    '--no-zygote',
                    '--disable-dev-shm-usage',
                ],
                headless: chromium.headless,
            }
        }
    } catch (error) {
        console.log('Failed to load @sparticuz/chromium, trying local Chrome:', error instanceof Error ? error.message : String(error))
    }
    
    // Development or fallback: use bundled Chromium or system Chrome
    try {
        const executablePath = findChromeExecutable()
        return {
            executablePath,
            args: [
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-extensions',
                '--no-first-run',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--disable-default-apps',
            ],
            headless: true,
        }
    } catch (error) {
        throw new Error(
            `Unable to find Chrome/Chromium executable. ` +
            `For development, install Chrome or Chromium, or set CHROME_EXECUTABLE_PATH environment variable. ` +
            `Original error: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export interface BrowserConfig {
    userAgent?: string
    viewport?: {
        width: number
        height: number
    }
    timeout?: number
}

export class MeridionalBrowser {
    private browser: Browser | null = null
    private page: Page | null = null
    
    async launch(config: BrowserConfig = {}) {
        try {
            const chromiumConfig = getChromiumConfig()
            
            console.log(`Launching browser with executable: ${chromiumConfig.executablePath}`)
            
            this.browser = await puppeteer.launch({
                ...chromiumConfig,
                timeout: config.timeout || 30000,
            })
            
            this.page = await this.browser.newPage()
            
            // Set realistic browser configuration
            await this.page.setUserAgent(
                config.userAgent || 
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            await this.page.setViewport(
                config.viewport || { width: 1366, height: 768 }
            )
            
            // Set language and timezone for Argentina
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
            })
            
            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'language', {
                    get: () => 'es-AR',
                })
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['es-AR', 'es', 'en'],
                })
            })
            
            return this.page
        } catch (error: any) {
            console.error('Browser launch failed:', error)
            if (error.message?.includes('Executable not found') || error.message?.includes('executablePath')) {
                throw new Error(
                    `Chrome browser not found. Please install Chrome or set CHROME_EXECUTABLE_PATH environment variable. ` +
                    `Error: ${error.message}`
                )
            }
            throw error
        }
    }
    
    async close() {
        if (this.page) {
            await this.page.close()
            this.page = null
        }
        if (this.browser) {
            await this.browser.close()
            this.browser = null
        }
    }
    
    getPage(): Page {
        if (!this.page) {
            throw new Error('Browser not launched. Call launch() first.')
        }
        return this.page
    }
}

export const MERIDIONAL_SELECTORS = {
    // Form selectors based on the provided HTML
    toggleWithoutPlate: 'input[type="checkbox"][role="switch"], #flexSwitchCheckDefault',
    licensePlateInput: 'input[placeholder="Patente"]',
    yearInput: 'input[placeholder="Año del vehículo"]',
    brandInput: 'input[placeholder="Marca"]',
    modelInput: 'input[placeholder="Modelo"]',
    versionInput: 'input[placeholder="Versión"], input[placeholder="Version"]',
    ageInput: 'input[placeholder="Edad"], input[name="edad"], input[id*="edad"], input[id*="age"]',
    paymentMethodSelect: '#IdMedioPago, select[name="medioPago"]',
    usageCheckbox: '#flexCheckUsoParticular, input[type="checkbox"]:has-text("Uso particular")',
    zeroKmCheckbox: '#flexCheckEs0Km, input[type="checkbox"]:has-text("Es 0Km")',
    gncCheckbox: '#flexCheckPoseeGNC, input[type="checkbox"]:has-text("Tiene GNC")',
    searchButton: 'button:has-text("Buscar vehículo"), button[type="submit"]:has-text("Buscar")',
    nextButton: 'button:has-text("Siguiente"), button[type="submit"]:has-text("Siguiente")',
    
    // Container and loading selectors
    formContainer: '#contactForm, form, .quote-form',
    loadingIndicator: '.loading, .spinner, .progress',
    
    // Cookie acceptance (multiple variations)
    cookieAccept: [
        'button:has-text("Aceptar")',
        'button:has-text("Accept")', 
        'button:has-text("Aceitar")',
        '[data-cookie-accept]',
        '.cookie-accept',
        '#accept-cookies'
    ].join(', '),
    
    // Results selectors (multiple variations to handle different page layouts)
    resultsContainer: [
        '.results', 
        '.quotes', 
        '.plans', 
        '.cotizacion-results',
        '.insurance-results',
        '[data-results]'
    ].join(', '),
    
    planCard: [
        '.plan', 
        '.quote-card', 
        '.insurance-plan',
        '.cotizacion-card',
        '.result-item'
    ].join(', '),
    
    planName: [
        '.plan-name', 
        '.coverage-name',
        '.plan-title',
        'h3', 'h4', 'h5',
        '.title'
    ].join(', '),
    
    planPrice: [
        '.price', 
        '.premium', 
        '.monthly-price',
        '.cost',
        '.amount',
        '[data-price]'
    ].join(', '),
    
    planDetails: [
        '.details', 
        '.coverage-details',
        '.description',
        '.plan-info'
    ].join(', '),
} as const

// Utility functions for common Puppeteer operations
export const waitForSelector = async (page: Page, selector: string, timeout = 10000) => {
    return await page.waitForSelector(selector, { visible: true, timeout })
}

export const clickElement = async (page: Page, selector: string, timeout = 5000) => {
    await waitForSelector(page, selector, timeout)
    await page.click(selector)
}

export const typeText = async (page: Page, selector: string, text: string, timeout = 5000) => {
    await waitForSelector(page, selector, timeout)
    await page.type(selector, text)
}

export const selectOption = async (page: Page, selector: string, value: string, timeout = 5000) => {
    await waitForSelector(page, selector, timeout)
    await page.select(selector, value)
}

export const humanDelay = (min = 100, max = 300) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    return new Promise(resolve => setTimeout(resolve, delay))
}