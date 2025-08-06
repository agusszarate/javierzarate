import { NextRequest, NextResponse } from 'next/server'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const brandId = req.nextUrl.searchParams.get('brandId')

        if (!brandId) {
            return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
        }

        const response = await fetch(`https://api.activar.app/models/${brandId}/models/1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Error fetching models from Activar API')
        }

        const data = await response.json()
        return NextResponse.json(data.data || [])
    } catch (error) {
        console.error('Error fetching Activar models:', error)
        return NextResponse.json({ error: 'Error fetching models' }, { status: 500 })
    }
}
