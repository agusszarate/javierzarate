import { NextResponse } from 'next/server'
import { createBrowser, debugPageState, delay } from '@/lib/puppeteer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DEFAULT_SOURCE_URL = 'https://productos.meridionalseguros.seg.ar/cotizacion/auto/AR160101MOFFAUAQDILMWB/seo_cotizacion'

export async function GET() {
  let browser: any = null
  let page: any = null

  try {
    console.log('Starting debug session...')
    
    // Launch browser
    browser = await createBrowser()
    page = await browser.newPage()

    // Set realistic headers
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    )
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    })

    // Set timezone
    await page.emulateTimezone('America/Argentina/Buenos_Aires')

    console.log('Navigating to page...')
    await page.goto(DEFAULT_SOURCE_URL, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })

    console.log('Page loaded, waiting...')
    await delay(3000)

    console.log('Capturing page state...')
    const pageState = await debugPageState(page, 'debug_endpoint')
    
    const screenshot = await page.screenshot({ encoding: 'base64' })

    return NextResponse.json({
      success: true,
      url: DEFAULT_SOURCE_URL,
      pageState,
      screenshotBase64: screenshot
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}