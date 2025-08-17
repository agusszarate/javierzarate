import { google } from 'googleapis'

export function getGoogleSheetsClient() {
  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
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
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
  }
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  return google.sheets({ version: 'v4', auth })
}

export const getHeaders = (quoteType: string) => {
  const base = ['Fecha', 'Nombre', 'Email', 'Teléfono']
  switch (quoteType) {
    case 'Vehiculo':
      return [...base, 'DNI', 'Marca', 'Modelo', 'Año', 'Mensaje']
    case 'Activar_app':
      return [...base, 'Marca', 'Modelo', 'Año', 'Seccion', 'Valor', 'ZonaId', 'SolicitorContacto', 'Mensaje']
    case 'Meridional Auto Quotes':
      return [
        'Fecha', 'Modo', 'Patente', 'Año', 'Marca', 'Modelo', 'Version', 
        'Medio de Pago', 'Uso Particular', 'Es 0Km', 'Tiene GNC', 
        'Cantidad Resultados', 'Mejor Plan', 'Precio Mensual', 'Moneda',
        'Duracion (ms)', 'Trace ID', 'URL Origen'
      ]
    case 'Hogar':
    case 'Vida':
    case 'Negocios':
    default:
      return [...base, 'Mensaje']
  }
}

export async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetName: string) {
  const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId })
  const exists = spreadsheetInfo.data.sheets?.some((s: any) => s.properties.title === sheetName)
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, resource: { requests: [{ addSheet: { properties: { title: sheetName } } }] } })
  }
  try {
    const values = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A1:Z1` })
    if (!values.data.values || values.data.values.length === 0 || values.data.values[0].length === 0) {
      const headers = getHeaders(sheetName)
      await sheets.spreadsheets.values.update({ spreadsheetId, range: `${sheetName}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } })
    }
  } catch {
    const headers = getHeaders(sheetName)
    await sheets.spreadsheets.values.update({ spreadsheetId, range: `${sheetName}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } })
  }
}
