// src/components/facturacion/Payphone.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payphone = () => {
  const { state } = useLocation();
  const { facturaId, total, cliente } = state || {};
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payLink, setPayLink] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const API_URL = process.env.REACT_APP_PAYPHONE_API_URL;
  const TOKEN = process.env.REACT_APP_PAYPHONE_TOKEN;
  const STOREID = process.env.REACT_APP_PAYPHONE_STOREID;

  // Ajustamos para que la respuesta regrese a home
  const RESPONSEURL = window.location.origin;


  useEffect(() => {
    if (!facturaId || !total) {
      setError('Datos de la factura incompletos.');
      return;
    }
    setLoading(true);
    const clientTransactionId = Date.now();

    const bodyJSON = {
      amount: total * 106,
      amountWithoutTax: total * 106,
      currency: 'USD',
      storeId: STOREID,
      reference: facturaId.toString(),
      clientTransactionId,
      ResponseUrl: RESPONSEURL
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    };

    fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyJSON)
    })
      .then(res => res.json())
      .then(data => {
        if (data.payWithCard) {
          setPayLink(data.payWithCard);
          setShowConfirmation(true);
          setLoading(false);
          // Redirigimos tras 3s
          setTimeout(() => {
            window.location.href = data.payWithCard;
          }, 3000);
        } else {
          setError('No se recibió un enlace de pago (payWithCard).');
          setLoading(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [facturaId, total, API_URL, TOKEN, STOREID, RESPONSEURL]);

  if (loading && !error && !showConfirmation) {
    return (
      <div className="container mt-5 text-center">
        <h1>Pagar con PayPhone</h1>
        <div className="mt-4 spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Espere por favor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Error en PayPhone</h1>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/clientes')}>
          Regresar
        </button>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="container mt-5 text-center">
        <h1>Confirmación de Pago</h1>
        <div className="card mx-auto" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <h5 className="card-title">Datos del Cliente</h5>
            {cliente ? (
              <div>
                <p><strong>ID Cliente:</strong> {cliente.id}</p>
                <p><strong>Nombre:</strong> {cliente.nombre}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={cliente.estado === 'ACTIVO' ? 'text-success' : 'text-danger'}>
                    {cliente.estado === 'ACTIVO' ? ' Activo' : ' Suspendido'}
                  </span>
                </p>
              </div>
            ) : (
              <p>No se proporcionaron datos del cliente.</p>
            )}
            <h5 className="card-title mt-4">Detalle de la Factura</h5>
            <p><strong>ID Factura:</strong> {facturaId}</p>
            <p><strong>Total a Pagar:</strong> ${total}</p>
          </div>
        </div>
        <p className="mt-3">Será redirigido al portal de pago en 3 segundos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Sin Enlace de Pago</h1>
      <p>No se encontró un enlace de pago (payWithCard). Revise la configuración.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/clientes')}>
        Regresar
      </button>
    </div>
  );
};

export default Payphone;
