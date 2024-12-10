import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { CheckCircle } from "lucide-react";

const Form = () => {
  const vehicleAPI = process.env.NEXT_PUBLIC_vehiclesAPI;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteType, setQuoteType] = useState<string>("Vehiculo");
  const [marca, setMarca] = useState<{ codigo: string; nome: string }>({
    codigo: "",
    nome: "",
  });

  const [marcas, setMarcas] = useState<{ codigo: string; nome: string }[]>([]);

  const [modelo, setModelo] = useState<{ codigo: string; nome: string }>({
    codigo: "",
    nome: "",
  });
  const [modelos, setModelos] = useState<{ codigo: string; nome: string }[]>(
    []
  );

  const [año, setAño] = useState<{ codigo: string; nome: string }>({
    codigo: "",
    nome: "",
  });
  const [años, setAños] = useState<{ codigo: string; nome: string }[]>([]);

  const handleChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setQuoteType(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const fData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      vehicleMake: marca.nome,
      vehicleModel: modelo.nome,
      vehicleYear: año.nome,
      dni: formData.get("dni"),
    };

    const emailBody =
      `
        Solicitud de Cotización de ${quoteType}:

        Nombre: ${fData.name}
        Email: ${fData.email}
        Teléfono: ${fData.phone}
        DNI: ${fData.dni}` +
      (quoteType === "Vehiculo"
        ? `
        
        Vehículo:
        Marca: ${fData.vehicleMake}
        Modelo: ${fData.vehicleModel}
        Año: ${fData.vehicleYear}`
        : "") +
      `
        Mensaje adicional:
        ${fData.message}
    `;
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: process.env.EMAIL_TO_SEND,
          subject: "Cotizacion solicitada",
          text: emailBody,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        console.error("Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error enviando el correo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMarcas();
  }, []);

  const fetchData = async (url: string, setData: (data: any) => void) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getMarcas = () => {
    fetchData(`${vehicleAPI}/marcas`, setMarcas);
  };

  const getModelos = (idMarca: string) => {
    fetchData(`${vehicleAPI}/marcas/${idMarca}/modelos`, (data) =>
      setModelos(data.modelos)
    );
  };

  const getAños = (idModelo: string) => {
    fetchData(
      `${vehicleAPI}/marcas/${marca.codigo}/modelos/${idModelo}/anos`,
      (data) => setAños(data)
    );
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        id={"contact-section"}
      >
        Solicitar cotización
      </Typography>
      <Grid container spacing={4}>
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
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
                    <MenuItem value={"Vehiculo"}>Vehiculo</MenuItem>
                    <MenuItem value={"Hogar"}>Hogar</MenuItem>
                    <MenuItem value={"Vida"}>Vida</MenuItem>
                    <MenuItem value={"Negocios"}>Negocio</MenuItem>
                  </Select>
                </FormControl>
                <Grid size={{ xs: 12, md: quoteType == "Vehiculo" ? 6 : 12 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Nombre Completo"
                    name="name"
                    autoComplete="name"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="phone"
                    label="Número de Teléfono"
                    type="tel"
                    id="phone"
                    autoComplete="tel"
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    name="message"
                    label="Mensaje (Opcional)"
                    id="message"
                    multiline
                    rows={4.5}
                  />
                </Grid>
                {quoteType === "Vehiculo" && (
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
                          );
                          setMarca(selectedMarca || { codigo: "", nome: "" });
                          if (selectedMarca) {
                            getModelos(selectedMarca!.codigo);
                          }
                        }}
                        fullWidth
                      >
                        {marcas.length > 0 ? (
                          marcas.map((marca) => (
                            <MenuItem
                              key={marca.codigo}
                              value={marca.codigo}
                              sx={{ color: "black" }}
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
                          );
                          setModelo(selectedModelo || { codigo: "", nome: "" });
                          if (selectedModelo) {
                            getAños(selectedModelo.codigo);
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
                                sx={{ color: "black" }}
                              >
                                {modelo.nome}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Cargando modelos...</MenuItem>
                          )
                        ) : (
                          <MenuItem disabled>Eligue una marca</MenuItem>
                        )}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 3 }}>
                      <InputLabel id="demo-simple-select-label">Año</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={año.codigo}
                        label="Seleccionar Año"
                        onChange={(e) => {
                          const selectedAño = años.find(
                            (a) => a.codigo === e.target.value
                          );
                          setAño(selectedAño || { codigo: "", nome: "" });
                        }}
                        fullWidth
                      >
                        {modelo ? (
                          años.length > 0 ? (
                            años.map((año) => (
                              <MenuItem
                                key={año.codigo}
                                value={año.codigo}
                                sx={{ color: "black" }}
                              >
                                {año.nome}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Cargando años...</MenuItem>
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress color="inherit" size={24} />
                  ) : success ? (
                    <CheckCircle size={24} />
                  ) : (
                    "Solicitar Cotización"
                  )}
                </Button>

                {success && (
                  <Typography
                    variant="body1"
                    color="success.main"
                    sx={{ mt: 2, textAlign: "center" }}
                  >
                    Mensaje enviado correctamente
                  </Typography>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Form;
