import { NextRequest, NextResponse } from 'next/server'
import { getGroupCode, isValidSection } from '@/lib/activarMapping'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// GET /api/activar/models?brandId=<id>&section=moto|cuatri (default 'moto')
export async function GET(req: NextRequest) {
    try {
        const brandId = req.nextUrl.searchParams.get('brandId')
        const section = req.nextUrl.searchParams.get('section') || 'moto'

        if (!brandId) {
            return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
        }

        // Validate section
        if (!isValidSection(section)) {
            console.error(`[ACTIVAR] Invalid section: ${section}`)
            return NextResponse.json(
                { error: 'Invalid section. Must be "moto" or "cuatri"' }, 
                { status: 400 }
            )
        }

        const groupCode = getGroupCode(section)
        const url = `https://api.activar.app/models/${brandId}/models/${groupCode}`

        console.log(`[ACTIVAR] Fetching models for section=${section}, brandId=${brandId}, groupCode=${groupCode}`)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`[ACTIVAR] API error: ${response.status} ${response.statusText}`)
            return NextResponse.json(
                { error: 'Error fetching models from Activar API' }, 
                { status: 502 }
            )
        }

        const data = await response.json()
        const models = data.data || []
        
        console.log(`[ACTIVAR] ✅ Models fetched for ${section}:`, models.length, 'models')
        
        return NextResponse.json(models)
    } catch (error) {
        console.error('[ACTIVAR] Error fetching models:', error)
        return NextResponse.json({ error: 'Error fetching models' }, { status: 500 })
    }
}
