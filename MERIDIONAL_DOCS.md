# Meridional Vehicle Quotation System

This implementation adds vehicle insurance quotation functionality using Meridional Seguros' website through automated web scraping with Puppeteer.

## Features

### Frontend (UI)
- **Dual Input Modes**: 
  - `byPlate`: Quick quotation using license plate
  - `byVehicle`: Manual vehicle details entry (year, brand, model, version)
- **Toggle Interface**: "Cotizar sin patente" switch to change between modes
- **Payment Method Selection**: Tarjeta de crédito / CBU
- **Usage Flags**: Checkboxes for "Uso particular", "Es 0Km", "Tiene GNC"
- **Integrated Results**: Success/error display with plan details and pricing
- **Form Validation**: Real-time validation and button state management

### Backend (API)
- **Endpoint**: `POST /api/meridional/quote`
- **Puppeteer Integration**: Production-ready with @sparticuz/chromium for Vercel Serverless
- **Error Handling**: Comprehensive typed error responses with retry logic
- **Google Sheets Integration**: Automatic logging to "Meridional Auto Quotes" tab
- **Security**: Anti-bot detection, input sanitization, timeout controls
- **Logging**: Structured logging with trace IDs for debugging

## API Contract

### Request Format
```typescript
// By License Plate (default)
{
  "mode": "byPlate",
  "licensePlate": "ABC123",
  "paymentMethod": "Tarjeta de crédito", // or "CBU"
  "usage": { "isParticular": true },
  "flags": { "isZeroKm": false, "hasGNC": false },
  "debug": false
}

// By Vehicle Details
{
  "mode": "byVehicle", 
  "vehicle": {
    "year": 2020,
    "brand": "Toyota",
    "model": "Corolla",
    "version": "XL" // optional
  },
  "paymentMethod": "Tarjeta de crédito",
  "usage": { "isParticular": true },
  "flags": { "isZeroKm": false, "hasGNC": false },
  "debug": false
}
```

### Response Format
```typescript
// Success Response
{
  "success": true,
  "insurer": "Meridional Seguros",
  "inputsEcho": { /* request data */ },
  "results": [
    {
      "planName": "Cobertura Integral",
      "monthly": 15000,
      "currency": "ARS",
      "details": "Cobertura completa con franquicia",
      "franchise": "$50,000"
    }
  ],
  "metadata": {
    "quotedAt": "2025-01-20T10:30:00Z",
    "durationMs": 12500,
    "traceId": "abc123def456"
  }
}

// Error Response
{
  "success": false,
  "code": "VALIDATION_ERROR" | "NAVIGATION_TIMEOUT" | "ANTIBOT_BLOCK" | "SELECTOR_NOT_FOUND" | "UNEXPECTED",
  "message": "Error description",
  "retryable": true
}
```

## Environment Setup

### Production (Vercel)
- Uses `puppeteer-core` + `@sparticuz/chromium`
- Automatic dependency management
- 60-second timeout limit
- No additional configuration needed

### Local Development
```bash
# Install dependencies
npm install

# Optional: Set Chrome executable path
export CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome

# Start development server
npm run dev
```

## Google Sheets Integration

Successful quotations are automatically logged to a new Google Sheets tab called "Meridional Auto Quotes" with the following columns:

- **Basic Info**: Fecha, Nombre, Email, Teléfono
- **Vehicle Data**: Modo, Patente, Año, Marca, Modelo, Version
- **Quote Details**: Medio de Pago, Uso Particular, Es 0Km, Tiene GNC
- **Results**: Planes Encontrados, Plan Principal, Precio Mensual, Moneda
- **Metadata**: Datos Completos, Fuente, Trace ID

## Security Considerations

- **Input Sanitization**: All user inputs are validated and sanitized
- **Anti-Bot Detection**: Handles CAPTCHAs and bot detection gracefully
- **Rate Limiting**: Respects website ToS with appropriate delays
- **Timeout Management**: Global and per-step timeouts prevent hanging
- **Error Recovery**: Retry logic for transient failures
- **Privacy**: Option to mask license plates in logs

## Usage

1. **Select Quote Type**: Choose "Seguro de Auto" from the dropdown
2. **Enter Vehicle Info**: Use toggle to switch between license plate or manual entry
3. **Configure Options**: Set payment method and usage flags
4. **Submit Quote**: Click "Cotizar" button
5. **View Results**: Plans display with pricing and details
6. **Automatic Logging**: Quote saved to Google Sheets automatically

## Error Handling

The system handles various error scenarios:
- **Validation Errors** (422): Invalid input data
- **Navigation Timeouts** (504): Website loading issues
- **Anti-Bot Blocks** (429): CAPTCHA or bot detection
- **Selector Errors** (500): Website structure changes
- **Connection Errors**: Network connectivity issues

All errors include retry information and debugging details when debug mode is enabled.

## Browser Compatibility

- **Production**: Chromium via @sparticuz/chromium (optimized for Vercel)
- **Development**: System Chrome or Chromium
- **Headless Mode**: Enabled by default for performance
- **User Agent**: Realistic Chrome/macOS user agent
- **Language**: Configured for Spanish (Argentina)

## Monitoring

- **Trace IDs**: Unique identifier for each quotation request
- **Duration Tracking**: Performance monitoring for optimization
- **Error Logging**: Structured logs for debugging
- **Success Metrics**: Google Sheets provides quotation analytics