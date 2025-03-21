// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaMoneyBillWave, FaHandshake } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------------
  // ESTADOS PARA CONFIRMAR PAGO (PAYPHONE)
  // ---------------------
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  // ---------------------
  // OBTENEMOS PARÁMETROS DE LA URL (si venimos de PayPhone)
  // ---------------------
  const params = new URLSearchParams(location.search);
  const payId = params.get('id');
  const payTxId = params.get('clientTransactionId');

  // ---------------------
  // VARIABLES DE ENTORNO PARA CONFIRMAR PAGO
  // ---------------------
  const confirmApiUrl = process.env.REACT_APP_PAYPHONE_CONFIRM_API_URL;
  const payphoneToken = process.env.REACT_APP_PAYPHONE_TOKEN;

  // ---------------------
  // USE EFFECT: CONFIRMACIÓN DE PAGO (si hay parámetros)
  // ---------------------
  useEffect(() => {
    // 1) Si no hay payId => no venimos de PayPhone, no hacemos nada
    if (!payId) return;

    // 2) Si payId === '0' => el pago no se realizó con éxito
    if (payId === '0') {
      // No confirmamos nada, simplemente salimos
      return;
    }

    // 3) Caso normal => confirmamos transacción
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
        Authorization: `Bearer ${payphoneToken}`
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        setConfirmationData(data);
        setLoadingPago(false);

        // Si la transacción está aprobada, redirigimos a /clientes/payphoneResponce
        if (data.transactionStatus === 'Approved') {
          navigate('/clientes/payphoneResponce', { state: { confirmationData: data } });
        }
      })
      .catch(err => {
        setErrorPago(err.message);
        setLoadingPago(false);
      });
  }, [payId, payTxId, confirmApiUrl, payphoneToken, navigate]);

  // ---------------------------------------------------------------------
  // MANEJO DE ESTADOS DE PAGO
  // ---------------------------------------------------------------------

  // Si se está confirmando el pago, mostramos un loader
  if (loadingPago) {
    return (
      <div className="container mt-5 text-center">
        <h1>Confirmando Pago...</h1>
        <div className="spinner-border text-primary mt-4" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si payId === '0', mostramos “pago no realizado”
  if (payId === '0') {
    return (
      <div className="container mt-5 text-center">
        <h1>Pago no realizado con éxito</h1>
        <p>Su pago no fue realizado con éxito. Por favor, intente de nuevo.</p>
        <Link to="/clientes" className="btn btn-primary mt-3">
          Volver a intentar
        </Link>
      </div>
    );
  }

  // En caso de error en la confirmación, mostramos el mensaje y un botón para volver
  if (errorPago) {
    return (
      <div className="container mt-5 text-center">
        <h1>Error en Confirmación de Pago</h1>
        <p>{errorPago}</p>
        <Link to="/clientes" className="btn btn-secondary">Volver</Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // VISTA NORMAL DE HOME (sin pago)
  // ---------------------------------------------------------------------
  return (
    <div className="container text-center mt-5">
      {/* Imagen de Sisnetel Fiber */}
      <img
        src="/sisnetel_fiber.png"
        alt="Sisnetel Fiber"
        className="sisnetel-logo mb-4"
      />

      <h1 className="mb-3">Bienvenido a Sisnetel Fiber</h1>
      <p className="text-muted">Elige una opción para continuar</p>

      <div className="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
        {/* Botón de Pagos */}
        <Link
          to="/clientes"
          className="btn btn-gradient-blue btn-lg mb-2 mb-md-0 me-md-3"
        >
          <FaMoneyBillWave style={{ fontSize: '1.5em', marginRight: '8px' }} />
          Pagos
        </Link>

        {/* Botón de Promesa de Pago */}
        <Link
          to="/admin"
          className="btn btn-gradient-green btn-lg"
        >
          <FaHandshake style={{ fontSize: '1.5em', marginRight: '8px' }} />
          Promesa de Pago
        </Link>
      </div>
    </div>
  );
};

export default Home;

