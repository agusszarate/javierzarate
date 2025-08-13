import { NextRequest, NextResponse } from 'next/server'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// GET /api/activar/years?modelCode=<code>
export async function GET(req: NextRequest) {
    try {
        const modelCode = req.nextUrl.searchParams.get('modelCode')

        if (!modelCode) {
            return NextResponse.json({ error: 'Model code is required' }, { status: 400 })
        }

        console.log(`[ACTIVAR] Fetching years for modelCode=${modelCode}`)

        const response = await fetch(`https://api.activar.app/models/${modelCode}/years`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`[ACTIVAR] API error: ${response.status} ${response.statusText}`)
            return NextResponse.json(
                { error: 'Error fetching years from Activar API' }, 
                { status: 502 }
            )
        }

        const data = await response.json()
        
        // Extract and normalize years array: { year: string, value: string }
        const years = (data.data?.years || []).map((yearObj: any) => ({
            year: parseInt(yearObj.year),
            value: yearObj.value || '0'
        }))
        
        console.log(`[ACTIVAR] ✅ Years fetched:`, years.length, 'years')
        
        return NextResponse.json(years)
    } catch (error) {
        console.error('[ACTIVAR] Error fetching years:', error)
        return NextResponse.json({ error: 'Error fetching years' }, { status: 500 })
    }
}
