// src/components/ConsultaCliente.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ConsultaCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cedula, setCedula] = useState('');
  const [cliente, setCliente] = useState(null);
  const [errorCliente, setErrorCliente] = useState('');
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Estados para pago
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  const API_URL_CLIENTE = process.env.REACT_APP_API_URL_CLIENTE;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  const confirmApiUrl = process.env.REACT_APP_PAYPHONE_CONFIRM_API_URL;
  const payphoneToken = process.env.REACT_APP_PAYPHONE_TOKEN;

  // Leer parámetros de la URL (si venimos de PayPhone)
  const params = new URLSearchParams(location.search);
  const payId = params.get('id');
  const payTxId = params.get('clientTransactionId');

  // A) Confirmación de Pago
  useEffect(() => {
    if (!payId) return; // No hay id => no venimos de PayPhone

    if (payId === "0") {
      // Pago no realizado
      return;
    }

    // Caso normal => confirmamos transacción
    if (!payTxId) {
      setErrorPago('Faltan parámetros para confirmar el pago.');
      return;
    }

    setLoadingPago(true);

    const body = {
      id: parseInt(payId, 10),
      clientTxId: payTxId
    };

    fetch(confirmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${payphoneToken}`
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        setConfirmationData(data);
        setLoadingPago(false);

        // Si la transacción está aprobada => redirigimos a /payphoneResponce con los datos
        if (data.transactionStatus === 'Approved') {
          navigate('/payphoneResponce', { state: { confirmationData: data } });
        }
      })
      .catch(err => {
        setErrorPago(err.message);
        setLoadingPago(false);
      });
  }, [payId, payTxId, confirmApiUrl, payphoneToken, navigate]);

  // B) Lógica de Consulta de Cliente
  const handleConsulta = async (e) => {
    e.preventDefault();
    setLoadingCliente(true);
    setErrorCliente('');
    setCliente(null);

    try {
      const body = JSON.stringify({ token: API_TOKEN, cedula: cedula });
      const response = await fetch(API_URL_CLIENTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body
      });

      if (!response.ok) throw new Error('Error en la consulta');
      const data = await response.json();
      if (data.estado !== 'exito' || !data.datos || data.datos.length === 0) {
        throw new Error('Cliente no encontrado');
      }
      setCliente(data.datos[0]);
    } catch (err) {
      setErrorCliente(err.message);
    } finally {
      setLoadingCliente(false);
    }
  };

  const handleVerFacturas = () => {
    navigate('/facturas', { state: { cliente } });
  };

  const handleNuevo = () => {
    setCedula('');
    setCliente(null);
    setErrorCliente('');
  };

  // ---------------------------------------------------------------------
  // RENDER según el caso
  // ---------------------------------------------------------------------

  // 1) Pago fallido => payId === "0"
  if (payId === "0") {
    return (
      <div className="container mt-5 text-center">
        <h1>Pago no realizado con éxito</h1>
        <p>Su pago no fue realizado con éxito. Por favor, intente de nuevo.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Volver a intentar
        </button>
      </div>
    );
  }

  // 2) Venimos de PayPhone, pero no aprobado => mostramos datos localmente
  // (solo si ya terminamos de cargar y no se aprobó)
  if (payId && payId !== "0" && !loadingPago && confirmationData && confirmationData.transactionStatus !== 'Approved') {
    return (
      <div className="container mt-5">
        <h1>Transacción no aprobada</h1>
        <p>Estado de la Transacción: {confirmationData.transactionStatus}</p>
        <p>Código de Autorización: {confirmationData.authorizationCode}</p>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // 3) Estamos confirmando la transacción (loadingPago)
  if (loadingPago) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Confirmando transacción...</p>
      </div>
    );
  }

  // 4) Error de confirmación
  if (errorPago) {
    return (
      <div className="container mt-5 text-center">
        <h1>Error al confirmar el pago</h1>
        <p>{errorPago}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // 5) Flujo normal: consultar cliente
  if (loadingCliente) {
    return (
      <div className="container mt-5 text-center">
        <h1>Consulta de Cliente</h1>
        <div className="mt-4 spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Espere por favor...</p>
      </div>
    );
  }

  if (errorCliente) {
    return (
      <div className="container mt-5">
        <h1>Consulta de Cliente</h1>
        <div className="alert alert-danger mt-3">
          <p>{errorCliente}</p>
          <button className="btn btn-secondary" onClick={handleNuevo}>
            Regresar
          </button>
        </div>
      </div>
    );
  }

  // 6) Muestra el formulario o los datos del cliente consultado
  return (
    <div className="container mt-5">
      <h1>Consulta de Cliente</h1>
      {!cliente ? (
        <form onSubmit={handleConsulta}>
          <div className="mb-3">
            <label htmlFor="cedula" className="form-label">Número de Cédula</label>
            <input
              type="text"
              className="form-control"
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Consultar</button>
        </form>
      ) : (
        <div className="mt-4">
          <h2>Datos del Cliente</h2>
          <p><strong>ID:</strong> {cliente.id}</p>
          <p><strong>Nombre Completo:</strong> {cliente.nombre}</p>
          <p>
            <strong>Perfiles:</strong>{' '}
            {cliente.servicios && cliente.servicios.length > 0
              ? cliente.servicios.map((servicio, index) => (
                  <span key={index}>
                    {servicio.perfil}{index < cliente.servicios.length - 1 ? ', ' : ''}
                  </span>
                ))
              : 'Sin perfiles asignados'}
          </p>
          <p><strong>Valor Total de Facturas:</strong> {cliente.facturacion && cliente.facturacion.total_facturas}</p>
          <p>
            <strong>Estado del Servicio:</strong> {cliente.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}
          </p>
          <div className="mt-3">
            <button onClick={handleVerFacturas} className="btn btn-info me-2">
              Ver Facturas
            </button>
            <button onClick={handleNuevo} className="btn btn-secondary">
              Consultar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaCliente;
