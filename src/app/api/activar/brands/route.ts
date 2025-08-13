import { NextRequest, NextResponse } from 'next/server'
import { getGroupCode, isValidSection } from '@/lib/activarMapping'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// GET /api/activar/brands?section=moto|cuatri (default 'moto')
export async function GET(req: NextRequest) {
    try {
        const section = req.nextUrl.searchParams.get('section') || 'moto'
        
        // Validate section
        if (!isValidSection(section)) {
            console.error(`[ACTIVAR] Invalid section: ${section}`)
            return NextResponse.json(
                { error: 'Invalid section. Must be "moto" or "cuatri"' }, 
                { status: 400 }
            )
        }

        const groupCode = getGroupCode(section)
        const url = `https://api.activar.app/models/brand/${groupCode}`

        console.log(`[ACTIVAR] Fetching brands for section=${section}, groupCode=${groupCode}`)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`[ACTIVAR] API error: ${response.status} ${response.statusText}`)
            return NextResponse.json(
                { error: 'Error fetching brands from Activar API' }, 
                { status: 502 }
            )
        }

        const result = await response.json()

        // La API devuelve { data: [...] }, extraemos solo el array
        const brands = result.data || []

        console.log(`[ACTIVAR] ✅ Brands fetched for ${section}:`, brands.length, 'brands')

        return NextResponse.json(brands)
    } catch (error) {
        console.error('[ACTIVAR] Error fetching brands:', error)
        return NextResponse.json({ error: 'Error fetching brands' }, { status: 500 })
    }
}
