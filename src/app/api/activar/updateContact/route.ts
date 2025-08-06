import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// Configuración de Google Sheets (reutilizando la misma función)
const getGoogleSheetsClient = () => {
    if (
        !process.env.GOOGLE_PROJECT_ID ||
        !process.env.GOOGLE_PRIVATE_KEY ||
        !process.env.GOOGLE_CLIENT_EMAIL
    ) {
        throw new Error('Variables de entorno de Google no configuradas')
    }

    const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: '',
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
            process.env.GOOGLE_CLIENT_EMAIL
        )}`,
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    return google.sheets({ version: 'v4', auth })
}

export async function POST(req: NextRequest) {
    try {
        const { email, phone } = await req.json()

        if (!email || !phone) {
            return NextResponse.json({ error: 'Email and phone are required' }, { status: 400 })
        }

        const sheets = getGoogleSheetsClient()
        const spreadsheetId = process.env.GOOGLE_SHEET_ID

        if (!spreadsheetId) {
            return NextResponse.json({ message: 'Google Sheet ID no configurado' }, { status: 500 })
        }

        // Buscar la fila con el email y teléfono específicos en la hoja Activar_app
        const values = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Activar_app!A:L', // Todas las columnas hasta L
        })

        const rows = values.data.values
        if (!rows) {
            return NextResponse.json({ error: 'No data found in sheet' }, { status: 404 })
        }

        // Buscar la fila que coincida con email y teléfono
        let targetRowIndex = -1
        for (let i = 1; i < rows.length; i++) {
            // Empezar desde 1 para saltar headers
            const row = rows[i]
            if (row[2] === email && row[3] === phone) {
                // Columna C (email) y D (teléfono)
                targetRowIndex = i + 1 // +1 porque las filas en Sheets empiezan en 1
                break
            }
        }

        if (targetRowIndex === -1) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 })
        }

        // Actualizar la columna "SolicitorContacto" (columna H) a "true"
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Activar_app!H${targetRowIndex}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['true']],
            },
        })

        console.log(`✅ Estado actualizado a "true" para ${email} en fila ${targetRowIndex}`)

        return NextResponse.json({
            message: 'Estado de contacto actualizado correctamente',
            rowUpdated: targetRowIndex,
        })
    } catch (error) {
        console.error('❌ Error actualizando estado de contacto:', error)
        return NextResponse.json(
            {
                error: 'Error updating contact status',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
