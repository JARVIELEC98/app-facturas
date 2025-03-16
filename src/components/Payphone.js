import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payphone = () => {
  const { state } = useLocation();
  const { facturaId, total } = state || {};
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Variables de entorno
  const API_URL = process.env.REACT_APP_PAYPHONE_API_URL;      
  const TOKEN = process.env.REACT_APP_PAYPHONE_TOKEN;
  const STOREID = process.env.REACT_APP_PAYPHONE_STOREID;
  const RESPONSEURL = process.env.REACT_APP_PAYPHONE_RESPONSEURL;

  useEffect(() => {
    if (!facturaId || !total) {
      setError("Datos de la factura incompletos.");
      return;
    }
    setLoading(true);

    const clientTransactionId = Date.now();
    
    // amount y amountWithoutTax con factor 106
    const bodyJSON = {
      amount: total * 106,
      amountWithoutTax: total * 106,
      currency: "USD",
      storeId: STOREID,
      reference: facturaId.toString(),
      clientTransactionId,
      ResponseUrl: RESPONSEURL
    };

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    };

    fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyJSON)
    })
      .then(res => res.json())
      .then(data => {
        // Si el API proporciona 'payWithCard', redirigimos inmediatamente
        if (data.payWithCard) {
          window.location.href = data.payWithCard;
        } else {
          // Si no existe payWithCard, mostramos error
          setError("No se recibió un enlace de pago (payWithCard).");
          setLoading(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [facturaId, total, API_URL, TOKEN, STOREID, RESPONSEURL]);

  // Mostrar spinner mientras esperamos la respuesta
  if (loading && !error) {
    return (
      <div className="container mt-5 text-center">
        <h1>Pagar con PayPhone</h1>
        <div className="mt-4">
          {/* Ícono de carga (spinner) */}
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Espere por favor...</p>
        </div>
      </div>
    );
  }

  // Si hay error
  if (error) {
    return (
      <div className="container mt-5">
        <h1>Error en PayPhone</h1>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>
    );
  }

  // Si por alguna razón no está loading ni hay error,
  // significa que no hubo payWithCard y no se redirigió.
  return (
    <div className="container mt-5">
      <h1>Sin Enlace de Pago</h1>
      <p>No se encontró un enlace de pago (payWithCard). Revise la configuración.</p>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Regresar
      </button>
    </div>
  );
};

export default Payphone;
