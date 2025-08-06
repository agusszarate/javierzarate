import { NextRequest, NextResponse } from 'next/server'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const modelCode = req.nextUrl.searchParams.get('modelCode')

        if (!modelCode) {
            return NextResponse.json({ error: 'Model code is required' }, { status: 400 })
        }

        const response = await fetch(`https://api.activar.app/models/${modelCode}/years`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Error fetching years from Activar API')
        }

        const data = await response.json()
        // Para years, los datos están en data.years, no directamente en data
        return NextResponse.json(data.data?.years || [])
    } catch (error) {
        console.error('Error fetching Activar years:', error)
        return NextResponse.json({ error: 'Error fetching years' }, { status: 500 })
    }
}
