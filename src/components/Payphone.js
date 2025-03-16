// src/components/Payphone.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payphone = () => {
  const { state } = useLocation();
  const { facturaId, total } = state || {};
  const navigate = useNavigate();
  
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    // Tanto amount como amountWithoutTax se calculan como total * 106
    const bodyJSON = {
      amount: total * 106,
      amountWithoutTax: total * 106,
      currency: "USD",
      storeId: STOREID,
      reference: facturaId.toString(),
      clientTransactionId: clientTransactionId,
      ResponseUrl: RESPONSEURL
    };
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    };
    
    fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyJSON)
    })
      .then(res => res.json())
      .then(data => {
        setApiData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [facturaId, total, API_URL, TOKEN, STOREID, RESPONSEURL]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Pagar con PayPhone</h1>
        <div className="spinner-border text-primary" role="status">
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
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <h1>Resultado del Pago con PayPhone</h1>
      <pre>{JSON.stringify(apiData, null, 2)}</pre>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Regresar
      </button>
    </div>
  );
};

export default Payphone;
