// src/components/admin/PromesaPago.js
import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'; // Ícono de alerta

const PromesaPago = () => {
  // Recupera la cédula guardada desde el login (si se necesita)
  const cedulaGuardada = localStorage.getItem('clienteCedula');
  const nombreAgente = localStorage.getItem('clienteNombre') || '';

  // Estados para la consulta del cliente
  const [cedula, setCedula] = useState('');
  const [cliente, setCliente] = useState(null);
  const [errorCliente, setErrorCliente] = useState('');
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Estados para la consulta de facturas
  const [factura, setFactura] = useState(null);
  const [loadingFactura, setLoadingFactura] = useState(false);
  const [errorFactura, setErrorFactura] = useState('');

  // Estados para la promesa de pago
  const [loadingPromesa, setLoadingPromesa] = useState(false);
  const [errorPromesa, setErrorPromesa] = useState('');
  const [promesaMessage, setPromesaMessage] = useState('');

  // Variables de entorno y URLs
  const API_URL_CLIENTE = process.env.REACT_APP_API_URL_CLIENTE; 
  const API_URL_FACTURAS = process.env.REACT_APP_API_URL_FACTURAS;
  const tokenEnv = process.env[`REACT_APP_API_TOKEN_${cedulaGuardada}`];
  // API3 para registrar la promesa de pago (lo usamos directamente)
  const API_URL_PROMESAPAGO = process.env.REACT_APP_PROMESA_API_URL;

  // Función para formatear una fecha como YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para consultar al cliente (API 1)
  const handleConsulta = async (e) => {
    e.preventDefault();
    setLoadingCliente(true);
    setErrorCliente('');
    setCliente(null);
    setFactura(null);
    setPromesaMessage('');
    setErrorPromesa('');

    try {
      const body = JSON.stringify({
        token: tokenEnv,
        cedula: cedula // valor ingresado en el formulario
      });

      const response = await fetch(API_URL_CLIENTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenEnv}`
        },
        body
      });

      if (!response.ok) throw new Error('Error en la consulta');
      const data = await response.json();

      if (data.estado !== 'exito' || !data.datos || data.datos.length === 0) {
        throw new Error('Cliente no encontrado');
      }

      // Guarda el cliente obtenido
      const clienteObtenido = data.datos[0];
      setCliente(clienteObtenido);

      // Llama a la API de facturas (API 2) usando el id del cliente
      fetchFacturas(clienteObtenido.id);
    } catch (err) {
      setErrorCliente(err.message);
    } finally {
      setLoadingCliente(false);
    }
  };

  // Función para consultar la factura (API 2)
  const fetchFacturas = async (idcliente) => {
    setLoadingFactura(true);
    setErrorFactura('');
    try {
      const bodyFacturas = JSON.stringify({
        token: tokenEnv,
        limit: 25,
        estado: "1", // se asume "1" indica facturas activas
        idcliente: idcliente
      });

      const response = await fetch(API_URL_FACTURAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenEnv}`
        },
        body: bodyFacturas
      });

      if (!response.ok) throw new Error('Error al consultar facturas');
      const data = await response.json();

      if (data.estado !== 'exito' || !data.facturas || data.facturas.length === 0) {
        throw new Error('No se encontraron facturas');
      }

      // Tomamos la primera factura
      setFactura(data.facturas[0]);
    } catch (err) {
      setErrorFactura(err.message);
    } finally {
      setLoadingFactura(false);
    }
  };

  // Función para limpiar la consulta
  const handleNuevo = () => {
    setCedula('');
    setCliente(null);
    setErrorCliente('');
    setFactura(null);
    setErrorFactura('');
    setPromesaMessage('');
    setErrorPromesa('');
  };

  // Función para obtener estilos según el estado del servicio del cliente
  const getEstadoStyle = (estado) => {
    if (estado === 'ACTIVO') {
      return {
        backgroundColor: 'green',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px'
      };
    } else {
      return {
        backgroundColor: 'red',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px'
      };
    }
  };

  // Función para obtener estilos según el estado de la factura:
  // Si está "pagado" se muestra en verde, de lo contrario, en rojo.
  const getFacturaEstadoStyle = (estado) => {
    if (estado === 'pagado') {
      return {
        backgroundColor: 'green',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px'
      };
    } else {
      return {
        backgroundColor: 'red',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px'
      };
    }
  };

  // Función para manejar la promesa de pago (API 3)
  // addType: "hours" o "days", amount: número a sumar
  const handlePromesa = async (addType, amount) => {
    // Validamos que ya se tenga la factura consultada
    if (!factura) {
      setErrorPromesa("No se ha consultado la factura.");
      return;
    }
    setLoadingPromesa(true);
    setErrorPromesa('');
    setPromesaMessage('');

    try {
      // Calcula la fecha límite
      const now = new Date();
      if (addType === "hours") {
        now.setHours(now.getHours() + amount);
      } else if (addType === "days") {
        now.setDate(now.getDate() + amount);
      }
      const fechaLimite = formatDate(now);

      // Construye el body para la API 3
      const bodyPromesa = JSON.stringify({
        token: tokenEnv,
        idfactura: factura.id,
        fechalimite: fechaLimite,
        descripcion: `solicitada por cliente aprobada por agente ${nombreAgente}`
      });

      const response = await fetch(API_URL_PROMESAPAGO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenEnv}`
        },
        body: bodyPromesa
      });

      if (!response.ok) throw new Error('Error al registrar la promesa de pago');
      const data = await response.json();

      if (data.estado !== 'exito') {
        // Si ya existe una promesa activa, mostramos un mensaje reducido y empático
        if (data.mensaje && data.mensaje.includes("promesa de pago activa")) {
          throw new Error("Ya tienes una promesa activa. Si tienes dudas, contacta a tu agente. 😊");
        }
        throw new Error(data.mensaje || 'Error en la promesa de pago');
      }

     // Dentro de handlePromesa, donde se asigna el mensaje de éxito:
setPromesaMessage(
  `¡Promesa de pago registrada correctamente! 🎉 Su corte de servicio será a la fecha límite ${fechaLimite}. ¡Gracias por confiar en nosotros!`
);

    } catch (err) {
      setErrorPromesa(err.message);
    } finally {
      setLoadingPromesa(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Promesa de Pago</h1>

      {cedulaGuardada && (
        <p>
          <strong>Cédula guardada (login):</strong> {cedulaGuardada}
        </p>
      )}

      {loadingCliente ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Consultando cliente...</p>
        </div>
      ) : errorCliente ? (
        <div className="alert alert-danger mt-3">
          <p>{errorCliente}</p>
          <button className="btn btn-secondary" onClick={handleNuevo}>
            Regresar
          </button>
        </div>
      ) : (
        <>
          {!cliente ? (
            <form onSubmit={handleConsulta}>
              <div className="mb-3">
                <label htmlFor="cedula" className="form-label">
                  Número de Cédula
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Consultar
              </button>
            </form>
          ) : (
            <div className="mt-4">
              <h2>Datos del Cliente</h2>
              <p><strong>ID del Cliente:</strong> {cliente.id}</p>
              <p><strong>Nombre Completo:</strong> {cliente.nombre}</p>
              <p><strong>Cédula:</strong> {cliente.cedula}</p>
              <p>
                <strong>Valor Total de Facturas:</strong>{" "}
                {cliente.facturacion?.total_facturas || 0} USD
              </p>
              <p>
                <strong>Estado del Servicio: </strong>
                <span style={getEstadoStyle(cliente.estado)}>
                  {cliente.estado}
                </span>
              </p>

              {loadingFactura ? (
                <div className="text-center">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Consultando factura...</p>
                </div>
              ) : errorFactura ? (
                <div className="alert alert-danger mt-3">
                  <p>{errorFactura}</p>
                </div>
              ) : factura ? (
                <div className="mt-4">
                  <p><strong>ID de Factura:</strong> {factura.id}</p>
                  <p>
                    <strong>Estado de Factura:</strong>{" "}
                    <span style={getFacturaEstadoStyle(factura.estado)}>
                      {factura.estado}
                    </span>
                  </p>
                </div>
              ) : null}

              {/* Mensaje para seleccionar el plazo de pago */}
              <div className="mb-2">
                <p className="text-muted">
                  ¡Elige cuántos días necesitas para realizar tu pago! <span role="img" aria-label="calendar">📅</span>
                </p>
              </div>

              {/* Botones de promesa de pago */}
              <div className="mt-3">
                <button
                  onClick={() => handlePromesa("hours", 24)}
                  className="btn btn-outline-primary me-2"
                >
                  24 horas
                </button>
                <button
                  onClick={() => handlePromesa("days", 2)}
                  className="btn btn-outline-primary me-2"
                >
                  2 días
                </button>
                <button
                  onClick={() => handlePromesa("days", 3)}
                  className="btn btn-outline-primary me-2"
                >
                  3 días
                </button>
                <button
                  onClick={() => handlePromesa("days", 8)}
                  className="btn btn-outline-danger me-2"
                >
                  8 días
                </button>
              </div>

              {/* Mensaje informativo sobre el recargo al seleccionar 8 días */}
              <div className="mt-2">
                <p className="text-muted">
                  Nota: Si eliges la opción de <strong>8 días</strong>, se aplicará un recargo de <strong>$1</strong> en tu factura actual. <span role="img" aria-label="money">💵</span>
                </p>
              </div>

              {loadingPromesa && (
                <div className="text-center mt-3">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Registrando promesa...</p>
                </div>
              )}
              {errorPromesa && (
                <div className="alert alert-danger mt-3">
                  <p>{errorPromesa}</p>
                </div>
              )}
              {promesaMessage && (
                <div className="alert alert-success mt-3">
                  <p>{promesaMessage}</p>
                </div>
              )}

              <div className="mt-3">
                <button onClick={handleNuevo} className="btn btn-secondary">
                  Consultar de nuevo
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromesaPago;
