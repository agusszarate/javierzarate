import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// Configuración de Google Sheets
const getGoogleSheetsClient = () => {
    // Verificar que todas las variables estén presentes
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

// Estructura de headers para cada tipo de cotización
const getHeaders = (quoteType: string) => {
    const baseHeaders = ['Fecha', 'Nombre', 'Email', 'Teléfono']

    switch (quoteType) {
        case 'Vehiculo':
            return [...baseHeaders, 'DNI', 'Marca', 'Modelo', 'Año', 'Mensaje']
        case 'Activar_app':
            return [
                ...baseHeaders,
                'Marca',
                'Modelo',
                'Año',
                'Seccion',
                'Valor',
                'ZonaId',
                'SolicitorContacto',
                'Mensaje',
            ]
        case 'Meridional Auto Quotes':
            return [
                ...baseHeaders,
                'Modo',
                'Patente',
                'Año',
                'Marca',
                'Modelo',
                'Version',
                'Medio de Pago',
                'Uso Particular',
                'Es 0Km',
                'Tiene GNC',
                'Planes Encontrados',
                'Plan Principal',
                'Precio Mensual',
                'Moneda',
                'Datos Completos',
                'Fuente',
                'Trace ID',
            ]
        case 'Hogar':
        case 'Vida':
        case 'Negocios':
            return [...baseHeaders, 'Mensaje']
        default:
            return [...baseHeaders, 'Mensaje']
    }
}

// Función para asegurar que existe la hoja y tiene headers
const ensureSheetExists = async (sheets: any, spreadsheetId: string, sheetName: string) => {
    try {
        console.log(`🔍 Verificando si existe la hoja: ${sheetName}`)

        // Obtener información del spreadsheet
        const spreadsheetInfo = await sheets.spreadsheets.get({
            spreadsheetId,
        })

        // Verificar si la hoja existe
        const sheetExists = spreadsheetInfo.data.sheets?.some(
            (sheet: any) => sheet.properties.title === sheetName
        )

        console.log(`📋 Hoja "${sheetName}" existe: ${sheetExists ? '✅' : '❌'}`)

        if (!sheetExists) {
            console.log(`🆕 Creando hoja: ${sheetName}`)
            // Crear la hoja si no existe
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                },
                            },
                        },
                    ],
                },
            })
            console.log(`✅ Hoja "${sheetName}" creada exitosamente`)
        }

        // Verificar si tiene headers
        try {
            const values = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A1:Z1`,
            })

            console.log(`📝 Headers existentes en "${sheetName}":`, values.data.values)

            if (
                !values.data.values ||
                values.data.values.length === 0 ||
                values.data.values[0].length === 0
            ) {
                console.log(`🆕 Agregando headers a la hoja: ${sheetName}`)
                // Agregar headers si no existen
                const headers = getHeaders(sheetName)
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [headers],
                    },
                })
                console.log(`✅ Headers agregados a "${sheetName}":`, headers)
            }
        } catch (headerError) {
            console.log(`⚠️ Error verificando headers (pero la hoja existe):`, headerError)
            // Intentar agregar headers anyway
            const headers = getHeaders(sheetName)
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [headers],
                },
            })
            console.log(`✅ Headers agregados a "${sheetName}" (recuperación):`, headers)
        }
    } catch (error) {
        console.error(`❌ Error en ensureSheetExists para "${sheetName}":`, error)
        throw error
    }
}

export async function POST(req: NextRequest) {
    try {
        const { quoteType, formData } = await req.json()
        const sheets = getGoogleSheetsClient()
        const spreadsheetId = process.env.GOOGLE_SHEET_ID

        if (!spreadsheetId) {
            return NextResponse.json({ message: 'Google Sheet ID no configurado' }, { status: 500 })
        }

        if (
            !process.env.GOOGLE_PROJECT_ID ||
            !process.env.GOOGLE_CLIENT_EMAIL ||
            !process.env.GOOGLE_PRIVATE_KEY
        ) {
            return NextResponse.json(
                { message: 'Credenciales de Google no configuradas correctamente' },
                { status: 500 }
            )
        }

        console.log('🔍 Intentando conectar con Google Sheets...')

        // Asegurar que la hoja existe
        await ensureSheetExists(sheets, spreadsheetId, quoteType)

        // Preparar los datos según el tipo de cotización
        const currentDate = new Date().toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
        })

        let rowData: string[]

        if (quoteType === 'Vehiculo') {
            rowData = [
                currentDate,
                formData.name || '',
                formData.email || '',
                formData.phone || '',
                formData.dni || '',
                formData.vehicleMake || '',
                formData.vehicleModel || '',
                formData.vehicleYear || '',
                formData.message || '',
            ]
        } else if (quoteType === 'Activar_app') {
            rowData = [
                currentDate,
                formData.name || '',
                formData.email || '',
                formData.phone || '',
                formData.activarMarca || '',
                formData.activarModelo || '',
                formData.activarYear || '',
                formData.activarSeccion || '',
                formData.activarValor || '',
                formData.activarZonaId || '',
                formData.solicitorContacto || 'false',
                formData.message || '',
            ]
        } else if (quoteType === 'Meridional Auto Quotes') {
            rowData = [
                currentDate,
                formData.name || '',
                formData.email || '',
                formData.phone || '',
                formData.mode || '',
                formData.licensePlate || '',
                formData.year || '',
                formData.brand || '',
                formData.model || '',
                formData.version || '',
                formData.paymentMethod || '',
                formData.isParticular ? 'Sí' : 'No',
                formData.isZeroKm ? 'Sí' : 'No',
                formData.hasGNC ? 'Sí' : 'No',
                formData.resultsCount || '0',
                formData.topPlanName || '',
                formData.topPlanMonthly || '',
                formData.currency || '',
                formData.rawResultsJson || '',
                formData.sourceUrl || '',
                formData.traceId || '',
            ]
        } else {
            rowData = [
                currentDate,
                formData.name || '',
                formData.email || '',
                formData.phone || '',
                formData.message || '',
            ]
        }

        // Agregar los datos a la hoja
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${quoteType}!A:Z`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [rowData],
            },
        })

        console.log('✅ Datos guardados exitosamente en Google Sheets')

        return NextResponse.json({
            message: 'Datos guardados en Google Sheets correctamente',
            sheetName: quoteType,
        })
    } catch (error) {
        console.error('❌ Error completo guardando en Google Sheets:', error)

        // Log más detallado del error
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }

        return NextResponse.json(
            {
                message: 'Error guardando en Google Sheets',
                error: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        )
    }
}
