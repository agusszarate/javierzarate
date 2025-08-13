import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postalCode = searchParams.get('postal_code')

        if (!postalCode) {
            return NextResponse.json(
                { error: 'postal_code parameter is required' },
                { status: 400 }
            )
        }

        const activarApiUrl = `https://api.activar.app/zones?postal_code=${postalCode}`

        const response = await fetch(activarApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Activar API responded with status: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching zones from Activar API:', error)
        return NextResponse.json({ error: 'Error fetching zone data' }, { status: 500 })
    }
}
