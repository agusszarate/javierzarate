import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const quoteData = await req.json()

        const response = await fetch('https://api.activar.app/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quoteData),
        })

        if (!response.ok) {
            throw new Error('Error getting quote from Activar API')
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error getting Activar quote:', error)
        return NextResponse.json({ error: 'Error getting quote' }, { status: 500 })
    }
}
