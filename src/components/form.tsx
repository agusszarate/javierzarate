import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    Grid2 as Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    CircularProgress,
    Grow,
    Fade,
} from '@mui/material'
import { CheckCircle } from 'lucide-react'
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

const Form = () => {
    const formAnimation = useScrollAnimation(0.1, 500);
    const vehicleAPI = process.env.NEXT_PUBLIC_vehiclesAPI
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [quoteType, setQuoteType] = useState<string>('Vehiculo')
    const [marca, setMarca] = useState<{ codigo: string; nome: string }>({
        codigo: '',
        nome: '',
    })

    const [marcas, setMarcas] = useState<{ codigo: string; nome: string }[]>([])

    const [modelo, setModelo] = useState<{ codigo: string; nome: string }>({
        codigo: '',
        nome: '',
    })
    const [modelos, setModelos] = useState<{ codigo: string; nome: string }[]>([])

    const [año, setAño] = useState<{ codigo: string; nome: string }>({
        codigo: '',
        nome: '',
    })
    const [años, setAños] = useState<{ codigo: string; nome: string }[]>([])

    // Estados para Activar_app
    const [activarMarcas, setActivarMarcas] = useState<any[]>([])
    const [activarModelos, setActivarModelos] = useState<any[]>([])
    const [activarYears, setActivarYears] = useState<any[]>([])
    const [activarMarca, setActivarMarca] = useState<any>({ id: '', name: '' })
    const [activarModelo, setActivarModelo] = useState<any>({ code: '', model: '' })
    const [activarYear, setActivarYear] = useState<number | ''>('')
    const [activarSeccion, setActivarSeccion] = useState<'moto' | 'cuatri' | ''>('')
    const [showQuote, setShowQuote] = useState(false)
    const [quoteResult, setQuoteResult] = useState<any>(null)

    const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
        setQuoteType(event.target.value)
        // Reset states when changing quote type
        if (event.target.value !== 'Activar_app') {
            setShowQuote(false)
            setQuoteResult(null)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        // Activar_app tiene su propio flujo, no usar handleSubmit
        if (quoteType === 'Activar_app') {
            return
        }

        setLoading(true)
        const formData = new FormData(event.currentTarget)
        const fData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            vehicleMake: marca.nome,
            vehicleModel: modelo.nome,
            vehicleYear: año.nome,
            dni: formData.get('dni'),
        }

        const emailBody =
            `
        Solicitud de Cotización de ${quoteType}:

        Nombre: ${fData.name}
        Email: ${fData.email}
        Teléfono: ${fData.phone}
        DNI: ${fData.dni}` +
            (quoteType === 'Vehiculo'
                ? `
        
        Vehículo:
        Marca: ${fData.vehicleMake}
        Modelo: ${fData.vehicleModel}
        Año: ${fData.vehicleYear}`
                : '') +
            `
        Mensaje adicional:
        ${fData.message}
    `
        try {
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: process.env.EMAIL_TO_SEND,
                    subject: 'Cotizacion solicitada',
                    text: emailBody,
                }),
            })

            if (response.ok) {
                // Si el email se envió correctamente, guardar en Google Sheets
                try {
                    await fetch('/api/saveToSheets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            quoteType,
                            formData: fData,
                        }),
                    })
                } catch (sheetsError) {
                    console.error('Error guardando en Google Sheets:', sheetsError)
                    // No interrumpimos el flujo si falla Google Sheets
                }

                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                }, 3000)
            } else {
                console.error('Error al enviar el correo')
            }
        } catch (error) {
            console.error('Error enviando el correo:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getMarcas()
        if (quoteType === 'Activar_app') {
            getActivarMarcas()
        }
    }, [quoteType])

    const fetchData = async (url: string, voidType: string) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`)
            }

            const data = await response.json()

            if (voidType === 'marcas') setMarcas(data)
            else if (voidType === 'modelos') setModelos(data.modelos)
            else if (voidType === 'años') setAños(data)
            else if (voidType === 'activarMarcas') {
                setActivarMarcas(data)
            } else if (voidType === 'activarModelos') setActivarModelos(data)
            else if (voidType === 'activarYears') setActivarYears(data)
            else console.error('Invalid voidType:', voidType)
        } catch (error) {
            console.error(`❌ Error fetching ${voidType} from ${url}:`, error)
        }
    }

    const getMarcas = () => {
        fetchData(`${vehicleAPI}/marcas`, 'marcas')
    }

    const getModelos = (idMarca: string) => {
        fetchData(`${vehicleAPI}/marcas/${idMarca}/modelos`, 'modelos')
    }

    const getAños = (idModelo: string) => {
        fetchData(`${vehicleAPI}/marcas/${marca.codigo}/modelos/${idModelo}/anos`, 'años')
    }

    // Funciones para Activar_app
    const getActivarMarcas = () => {
        fetchData('/api/activar/brands', 'activarMarcas')
    }

    const getActivarModelos = (brandId: string) => {
        fetchData(`/api/activar/models?brandId=${brandId}`, 'activarModelos')
    }

    const getActivarYears = (modelCode: string) => {
        fetchData(`/api/activar/years?modelCode=${modelCode}`, 'activarYears')
    }

    const handleActivarQuote = async () => {
        setLoading(true)
        try {
            const nameElement = document.getElementById('name') as HTMLInputElement
            const emailElement = document.getElementById('email') as HTMLInputElement

            const fullName = nameElement?.value || ''
            const nameParts = fullName.split(' ')

            const quotePayload = {
                brand: activarMarca.name,
                code: activarModelo.code,
                value: '0', // Se obtendrá de la respuesta
                client_email: emailElement?.value || '',
                client_first_name: nameParts[0] || '',
                client_last_name: nameParts.slice(1).join(' ') || '',
                section: activarSeccion,
                year: activarYear,
                is0km: activarYear === new Date().getFullYear(),
                zone_id: 430, // Valor por defecto
                channel: 'cotizador',
            }

            const response = await fetch('/api/activar/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quotePayload),
            })

            if (response.ok) {
                const quoteData = await response.json()
                // La API devuelve {data: {garage: {...}, on_off: [...]}}
                setQuoteResult(quoteData.data || quoteData) // Extraer data si existe
                setShowQuote(true)

                // Guardar en Google Sheets con solicitorContacto: false
                const formElement = document.querySelector('form') as HTMLFormElement
                if (formElement) {
                    const formData = new FormData(formElement)
                    const fData = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        message: formData.get('message'),
                        activarMarca: activarMarca.name,
                        activarModelo: activarModelo.model,
                        activarYear: activarYear.toString(),
                        activarSeccion: activarSeccion,
                        activarValor: (() => {
                            const data = quoteData.data || quoteData
                            // Buscar la opción recomendada o la primera disponible
                            const recommended = data.on_off?.find(
                                (option: any) => option.recommended
                            )
                            if (recommended)
                                return `$${recommended.premio} (${recommended.coverage})`
                            if (data.on_off?.length > 0)
                                return `$${data.on_off[0].premio} (${data.on_off[0].coverage})`
                            return 'Múltiples opciones disponibles'
                        })(),
                        activarZonaId: '430',
                        solicitorContacto: 'false',
                    }

                    await fetch('/api/saveToSheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quoteType: 'Activar_app', formData: fData }),
                    })
                }
            }
        } catch (error) {
            console.error('Error getting quote:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmContact = async () => {
        setLoading(true)
        try {
            const formElement = document.querySelector('form') as HTMLFormElement
            if (!formElement) {
                throw new Error('Form not found')
            }

            const formData = new FormData(formElement)
            const email = formData.get('email') as string
            const phone = formData.get('phone') as string

            // Actualizar estado en Google Sheets
            await fetch('/api/activar/updateContact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone }),
            })

            // Enviar email como siempre
            const emailBody = `
                Solicitud de Cotización de Seguro por Días:

                Nombre: ${formData.get('name')}
                Email: ${email}
                Teléfono: ${phone}
                
                Vehículo:
                Marca: ${activarMarca.name}
                Modelo: ${activarModelo.model}
                Año: ${activarYear}
                Sección: ${activarSeccion}
                Valor cotizado: ${quoteResult?.value || quoteResult?.price || 'N/A'}
                
                Mensaje adicional:
                ${formData.get('message')}
            `

            await fetch('/api/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: process.env.EMAIL_TO_SEND,
                    subject: 'Cotización Seguro por Días solicitada',
                    text: emailBody,
                }),
            })

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setShowQuote(false)
                setQuoteResult(null)
            }, 3000)
        } catch (error) {
            console.error('Error confirming contact:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box 
            ref={formAnimation.ref}
            sx={{ mb: 8 }}
        >
            <Fade in={formAnimation.inView} timeout={600}>
                <Typography variant="h2" component="h2" gutterBottom id={'contact-section'}>
                    Solicitar cotización
                </Typography>
            </Fade>
            <Grid container spacing={4}>
                <Grid size={12}>
                    <Grow in={formAnimation.inView} timeout={800} style={{ transitionDelay: '200ms' }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    boxShadow: 8,
                                    transform: 'translateY(-4px)',
                                }
                            }}
                        >
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={2}>
                                {/* Form Fields */}
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Tipo de cotizacion
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={quoteType}
                                        label="quoteType"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={'Vehiculo'}>Vehiculo</MenuItem>
                                        <MenuItem value={'Hogar'}>Hogar</MenuItem>
                                        <MenuItem value={'Vida'}>Vida</MenuItem>
                                        <MenuItem value={'Negocios'}>Negocio</MenuItem>
                                        <MenuItem value={'Activar_app'}>
                                            Seguro por días (Moto/Cuatri)
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md:
                                            quoteType === 'Vehiculo' || quoteType === 'Activar_app'
                                                ? 6
                                                : 12,
                                    }}
                                >
                                    <Fade in={formAnimation.inView} timeout={600} style={{ transitionDelay: '400ms' }}>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="name"
                                            label="Nombre Completo"
                                            name="name"
                                            autoComplete="name"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Fade>
                                    <Fade in={formAnimation.inView} timeout={600} style={{ transitionDelay: '500ms' }}>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="email"
                                            label="Correo Electrónico"
                                            name="email"
                                            autoComplete="email"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Fade>
                                    <Fade in={formAnimation.inView} timeout={600} style={{ transitionDelay: '600ms' }}>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="phone"
                                            label="Número de Teléfono"
                                            type="tel"
                                            id="phone"
                                            autoComplete="tel"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Fade>
                                    <Fade in={formAnimation.inView} timeout={600} style={{ transitionDelay: '700ms' }}>
                                        <TextField
                                            margin="normal"
                                            fullWidth
                                            name="message"
                                            label="Mensaje (Opcional)"
                                            id="message"
                                            multiline
                                            rows={4.5}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Fade>
                                </Grid>
                                {quoteType === 'Vehiculo' && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel id="demo-simple-select-label">
                                                Marca
                                            </InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={marca.codigo}
                                                label="marca"
                                                onChange={(e) => {
                                                    const selectedMarca = marcas.find(
                                                        (m) => m.codigo === e.target.value
                                                    )
                                                    setMarca(
                                                        selectedMarca || { codigo: '', nome: '' }
                                                    )
                                                    if (selectedMarca) {
                                                        getModelos(selectedMarca!.codigo)
                                                    }
                                                }}
                                                fullWidth
                                            >
                                                {marcas.length > 0 ? (
                                                    marcas.map((marca) => (
                                                        <MenuItem
                                                            key={marca.codigo}
                                                            value={marca.codigo}
                                                            sx={{ color: 'black' }}
                                                        >
                                                            {marca.nome}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>Cargando marcas...</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mt: 3 }}>
                                            <InputLabel id="demo-simple-select-label">
                                                Modelo
                                            </InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={modelo.codigo}
                                                label="modelo"
                                                onChange={(e) => {
                                                    const selectedModelo = modelos.find(
                                                        (m) => m.codigo === e.target.value
                                                    )
                                                    setModelo(
                                                        selectedModelo || { codigo: '', nome: '' }
                                                    )
                                                    if (selectedModelo) {
                                                        getAños(selectedModelo.codigo)
                                                    }
                                                }}
                                                fullWidth
                                            >
                                                {marca ? (
                                                    modelos.length > 0 ? (
                                                        modelos.map((modelo) => (
                                                            <MenuItem
                                                                key={modelo.codigo}
                                                                value={modelo.codigo}
                                                                sx={{ color: 'black' }}
                                                            >
                                                                {modelo.nome}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>
                                                            Cargando modelos...
                                                        </MenuItem>
                                                    )
                                                ) : (
                                                    <MenuItem disabled>Eligue una marca</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mt: 3 }}>
                                            <InputLabel id="demo-simple-select-label">
                                                Año
                                            </InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={año.codigo}
                                                label="Seleccionar Año"
                                                onChange={(e) => {
                                                    const selectedAño = años.find(
                                                        (a) => a.codigo === e.target.value
                                                    )
                                                    setAño(selectedAño || { codigo: '', nome: '' })
                                                }}
                                                fullWidth
                                            >
                                                {modelo ? (
                                                    años.length > 0 ? (
                                                        años.map((año) => (
                                                            <MenuItem
                                                                key={año.codigo}
                                                                value={año.codigo}
                                                                sx={{ color: 'black' }}
                                                            >
                                                                {año.nome}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>
                                                            Cargando años...
                                                        </MenuItem>
                                                    )
                                                ) : (
                                                    <MenuItem disabled>Eligue un modelo</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="dni"
                                            label="DNI del propietario"
                                            name="dni"
                                            autoComplete="dni"
                                        />
                                    </Grid>
                                )}

                                {quoteType === 'Activar_app' && !showQuote && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel>Tipo de vehículo</InputLabel>
                                            <Select
                                                value={activarSeccion}
                                                label="Tipo de vehículo"
                                                onChange={(e) =>
                                                    setActivarSeccion(
                                                        e.target.value as 'moto' | 'cuatri'
                                                    )
                                                }
                                                fullWidth
                                            >
                                                <MenuItem value="moto">Moto</MenuItem>
                                                <MenuItem value="cuatri">Cuatriciclo</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mt: 3 }}>
                                            <InputLabel>Marca</InputLabel>
                                            <Select
                                                value={activarMarca.id}
                                                label="Marca"
                                                onChange={(e) => {
                                                    const selectedMarca = activarMarcas.find(
                                                        (m) => m.id === e.target.value
                                                    )
                                                    setActivarMarca(
                                                        selectedMarca || { id: '', name: '' }
                                                    )
                                                    // Limpiar modelo y año al cambiar marca
                                                    setActivarModelo({ code: '', model: '' })
                                                    setActivarYear('')
                                                    setActivarModelos([])
                                                    setActivarYears([])
                                                    if (selectedMarca) {
                                                        getActivarModelos(selectedMarca.id)
                                                    }
                                                }}
                                                fullWidth
                                            >
                                                {activarMarcas.length > 0 ? (
                                                    activarMarcas.map((marca) => (
                                                        <MenuItem key={marca.id} value={marca.id}>
                                                            {marca.name}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>Cargando marcas...</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mt: 3 }}>
                                            <InputLabel>Modelo</InputLabel>
                                            <Select
                                                value={activarModelo.code}
                                                label="Modelo"
                                                onChange={(e) => {
                                                    const selectedModelo = activarModelos.find(
                                                        (m) => m.code === e.target.value
                                                    )
                                                    setActivarModelo(
                                                        selectedModelo || { code: '', model: '' }
                                                    )
                                                    // Limpiar año al cambiar modelo
                                                    setActivarYear('')
                                                    setActivarYears([])
                                                    if (selectedModelo) {
                                                        getActivarYears(selectedModelo.code)
                                                    }
                                                }}
                                                fullWidth
                                            >
                                                {activarMarca.id ? (
                                                    activarModelos.length > 0 ? (
                                                        activarModelos.map((modelo) => (
                                                            <MenuItem
                                                                key={modelo.code}
                                                                value={modelo.code}
                                                            >
                                                                {modelo.model}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>
                                                            Cargando modelos...
                                                        </MenuItem>
                                                    )
                                                ) : (
                                                    <MenuItem disabled>
                                                        Selecciona una marca
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mt: 3 }}>
                                            <InputLabel>Año</InputLabel>
                                            <Select
                                                value={activarYear}
                                                label="Año"
                                                onChange={(e) =>
                                                    setActivarYear(Number(e.target.value))
                                                }
                                                fullWidth
                                            >
                                                {activarModelo.code ? (
                                                    activarYears.length > 0 ? (
                                                        activarYears.map((yearObj) => (
                                                            <MenuItem
                                                                key={yearObj.year}
                                                                value={parseInt(yearObj.year)}
                                                            >
                                                                {yearObj.year}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>
                                                            Cargando años...
                                                        </MenuItem>
                                                    )
                                                ) : (
                                                    <MenuItem disabled>
                                                        Selecciona un modelo
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <Button
                                            onClick={handleActivarQuote}
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            sx={{ mt: 3 }}
                                            disabled={
                                                loading ||
                                                !activarSeccion ||
                                                !activarMarca.id ||
                                                !activarModelo.code ||
                                                !activarYear
                                            }
                                        >
                                            {loading ? (
                                                <CircularProgress color="inherit" size={24} />
                                            ) : (
                                                'Ver Cotización'
                                            )}
                                        </Button>
                                    </Grid>
                                )}

                                {quoteType === 'Activar_app' && showQuote && quoteResult && (
                                    <Grid size={12}>
                                        <Paper
                                            elevation={2}
                                            sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}
                                        >
                                            <Typography variant="h5" gutterBottom color="primary">
                                                🎉 ¡Tu cotización está lista!
                                            </Typography>
                                            <Typography variant="h6" sx={{ mb: 3 }}>
                                                Seguro por días para {activarMarca.name}{' '}
                                                {activarModelo.model} {activarYear}
                                            </Typography>

                                            {/* Opciones On-Off */}
                                            {quoteResult.on_off &&
                                                quoteResult.on_off.length > 0 && (
                                                    <>
                                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                                            🛡️ Opciones de Cobertura On-Off:
                                                        </Typography>
                                                        {quoteResult.on_off.map((option: any) => (
                                                            <Paper
                                                                key={option.coverage}
                                                                elevation={1}
                                                                sx={{
                                                                    p: 2,
                                                                    mb: 2,
                                                                    border: option.recommended
                                                                        ? '2px solid #4caf50'
                                                                        : '1px solid #e0e0e0',
                                                                    backgroundColor:
                                                                        option.recommended
                                                                            ? '#f1f8e9'
                                                                            : 'white',
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent:
                                                                            'space-between',
                                                                        alignItems: 'flex-start',
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography
                                                                            variant="h6"
                                                                            color={
                                                                                option.recommended
                                                                                    ? 'success.main'
                                                                                    : 'text.primary'
                                                                            }
                                                                        >
                                                                            Cobertura{' '}
                                                                            {option.coverage}
                                                                            {option.recommended &&
                                                                                ' ⭐ Recomendada'}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{ mb: 1 }}
                                                                        >
                                                                            {option.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography
                                                                        variant="h5"
                                                                        color="primary"
                                                                        sx={{
                                                                            fontWeight: 'bold',
                                                                        }}
                                                                    >
                                                                        ${option.premio}
                                                                    </Typography>
                                                                </Box>

                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ mb: 1 }}
                                                                >
                                                                    <strong>
                                                                        Responsabilidad Civil:
                                                                    </strong>{' '}
                                                                    $
                                                                    {option.responsabilidad_civil?.toLocaleString()}
                                                                </Typography>

                                                                {option.items &&
                                                                    option.items.length > 0 && (
                                                                        <Box>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontWeight:
                                                                                        'bold',
                                                                                    mb: 0.5,
                                                                                }}
                                                                            >
                                                                                Incluye:
                                                                            </Typography>
                                                                            <ul
                                                                                style={{
                                                                                    margin: 0,
                                                                                    paddingLeft: 20,
                                                                                }}
                                                                            >
                                                                                {option.items.map(
                                                                                    (
                                                                                        item: string,
                                                                                        itemIndex: number
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                itemIndex
                                                                                            }
                                                                                        >
                                                                                            <Typography variant="body2">
                                                                                                {
                                                                                                    item
                                                                                                }
                                                                                            </Typography>
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        </Box>
                                                                    )}
                                                            </Paper>
                                                        ))}
                                                    </>
                                                )}

                                            {/* Opción Garage */}
                                            {quoteResult.garage && (
                                                <>
                                                    <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                                                        🏠 Cobertura de Garage:
                                                    </Typography>
                                                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                mb: 1,
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography variant="h6">
                                                                    Cobertura de Garage
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ mb: 1 }}
                                                                >
                                                                    {quoteResult.garage.description}
                                                                </Typography>
                                                            </Box>
                                                            <Typography
                                                                variant="h5"
                                                                color="primary"
                                                                sx={{ fontWeight: 'bold' }}
                                                            >
                                                                ${quoteResult.garage.premio}
                                                            </Typography>
                                                        </Box>

                                                        {quoteResult.garage.prima_mensual && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ mb: 1 }}
                                                            >
                                                                <strong>Prima mensual:</strong> $
                                                                {quoteResult.garage.prima_mensual}
                                                            </Typography>
                                                        )}

                                                        {quoteResult.garage.items &&
                                                            quoteResult.garage.items.length > 0 && (
                                                                <Box>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontWeight: 'bold',
                                                                            mb: 0.5,
                                                                        }}
                                                                    >
                                                                        Incluye:
                                                                    </Typography>
                                                                    <ul
                                                                        style={{
                                                                            margin: 0,
                                                                            paddingLeft: 20,
                                                                        }}
                                                                    >
                                                                        {quoteResult.garage.items.map(
                                                                            (
                                                                                item: string,
                                                                                itemIndex: number
                                                                            ) => (
                                                                                <li key={itemIndex}>
                                                                                    <Typography variant="body2">
                                                                                        {item}
                                                                                    </Typography>
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </Box>
                                                            )}
                                                    </Paper>
                                                </>
                                            )}

                                            <Typography variant="body1" sx={{ mb: 3, mt: 3 }}>
                                                Para confirmar tu seguro y recibir más información,
                                                solicita que te contactemos.
                                            </Typography>
                                            <Button
                                                onClick={handleConfirmContact}
                                                variant="contained"
                                                color="secondary"
                                                size="large"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <CircularProgress color="inherit" size={24} />
                                                ) : (
                                                    'Solicitar Contacto'
                                                )}
                                            </Button>
                                        </Paper>
                                    </Grid>
                                )}

                                {quoteType !== 'Activar_app' && (
                                    <Fade in={formAnimation.inView} timeout={600} style={{ transitionDelay: '800ms' }}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="secondary"
                                            size="large"
                                            sx={{ 
                                                mt: 3, 
                                                mb: 2,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-3px) scale(1.02)',
                                                    boxShadow: 8,
                                                },
                                                '&:active': {
                                                    transform: 'translateY(-1px)',
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress color="inherit" size={24} />
                                                    <span>Enviando...</span>
                                                </Box>
                                            ) : success ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CheckCircle size={24} />
                                                    <span>¡Enviado!</span>
                                                </Box>
                                            ) : (
                                                'Solicitar Cotización'
                                            )}
                                        </Button>
                                    </Fade>
                                )}

                                {success && (
                                    <Fade in={success} timeout={800}>
                                        <Typography
                                            variant="body1"
                                            color="success.main"
                                            sx={{ 
                                                mt: 2, 
                                                textAlign: 'center',
                                                '@keyframes pulse': {
                                                    '0%': { transform: 'scale(1)' },
                                                    '50%': { transform: 'scale(1.05)' },
                                                    '100%': { transform: 'scale(1)' },
                                                },
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        >
                                            ✅ Mensaje enviado correctamente
                                        </Typography>
                                    </Fade>
                                )}
                            </Grid>
                        </Box>
                    </Paper>
                </Grow>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Form
