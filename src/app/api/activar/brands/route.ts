import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const response = await fetch('https://api.activar.app/models/brand/1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Error fetching brands from Activar API')
        }

        const result = await response.json()

        // La API devuelve { data: [...] }, extraemos solo el array
        const brands = result.data || []

        console.log('✅ Brands fetched from Activar API:', brands)

        return NextResponse.json(brands)
    } catch (error) {
        console.error('Error fetching Activar brands:', error)
        return NextResponse.json({ error: 'Error fetching brands' }, { status: 500 })
    }
}
