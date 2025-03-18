// src/components/PayphoneResponce.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PayphoneResponce = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Datos que vienen de la confirmación de Payphone
  const { confirmationData } = state || {};

  // Estados para manejar la factura y el cliente
  const [invoiceData, setInvoiceData] = useState(null); // aquí guardas la info de la factura
  const [clientData, setClientData] = useState(null);   // aquí guardas la info del cliente
  const [countdown, setCountdown] = useState(3);

  // Variables de entorno
  const API_URL_GETINVOICE = process.env.REACT_APP_GETINVOICE_API_URL;
  const API_URL_CLIENTE = process.env.REACT_APP_API_URL_CLIENTE;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;

  // 1) Efecto para llamar a la API GetInvoice
  useEffect(() => {
    if (confirmationData && confirmationData.reference) {
      fetch(API_URL_GETINVOICE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          token: API_TOKEN,
          idfactura: confirmationData.reference
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.estado === 'exito') {
            // data.factura debe contener { id: ..., idcliente: ... }
            setInvoiceData(data.factura);
          } else {
            console.error('Error en GetInvoice:', data);
          }
        })
        .catch((err) => {
          console.error('Error al obtener datos de la factura:', err);
        });
    }
  }, [confirmationData, API_URL_GETINVOICE, API_TOKEN]);

  // 2) Efecto para llamar a la API de cliente (GetClientsDetails) usando invoiceData.idcliente
  useEffect(() => {
    if (invoiceData && invoiceData.idcliente) {
      fetch(API_URL_CLIENTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          token: API_TOKEN,
          id: invoiceData.idcliente
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.estado === 'exito' && data.datos && data.datos.length > 0) {
            // data.datos[0] => { nombre, estado, ... }
            // data.facturacion => { total_facturas, ... }
            setClientData({
              nombre: data.datos[0].nombre,
              estado: data.datos[0].estado,
              facturacion: data.facturacion
            });
          } else {
            console.error('Error en GetClientsDetails:', data);
          }
        })
        .catch((err) => {
          console.error('Error al obtener datos del cliente:', err);
        });
    }
  }, [invoiceData, API_URL_CLIENTE, API_TOKEN]);

  // 3) Efecto para la cuenta regresiva que redirige a /pagofactura
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Al terminar, navegamos a PagoFactura, pasando clientData
          navigate('/pagofactura', {
            state: {
              amount: confirmationData ? confirmationData.amount / 106 : 0,
              reference: confirmationData ? confirmationData.reference : '',
              transactionId: confirmationData ? confirmationData.transactionId : '',
              pasarela: 'Payphone',
              // Pasamos la info del cliente
              clientData: clientData || null
            }
          });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [confirmationData, clientData, navigate]);

  // Caso: no llegó nada de Payphone
  if (!confirmationData) {
    return (
      <div className="container mt-5 text-center">
        <h1>No hay datos de transacción</h1>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // Monto sin el 6%
  const originalAmount = confirmationData.amount / 106;

  return (
    <div className="container mt-5 text-center">
      <h1>Confirmación de Transacción</h1>
      <p>
        <strong>Estado de la Transacción:</strong> {confirmationData.transactionStatus}
      </p>
      <p>
        <strong>Cantidad:</strong> {originalAmount.toFixed(2)} {confirmationData.currency}
      </p>
      <p>
        <strong>ID Factura:</strong> {confirmationData.reference}
      </p>
      <p>
        <strong>Transaction ID:</strong> {confirmationData.transactionId}
      </p>
      <p>
        <strong>Pasarela:</strong> Payphone
      </p>

      {/* Mostrar ID del cliente si ya lo obtuviste */}
      {invoiceData && invoiceData.idcliente && (
        <p><strong>ID Cliente:</strong> {invoiceData.idcliente}</p>
      )}

      {/* Mostrar datos del cliente si ya se cargaron */}
      {clientData && (
        <div>
          <p><strong>Nombre:</strong> {clientData.nombre}</p>
          <p><strong>Estado del Servicio:</strong> {clientData.estado}</p>
          {clientData.facturacion && (
            <p><strong>Total Facturas:</strong> {clientData.facturacion.total_facturas}</p>
          )}
        </div>
      )}

      <p className="mt-3">Los cargos por pagos con tarjeta son del 6%.</p>

      <div className="mt-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Redireccionando en {countdown} segundos...</p>
      </div>

      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PayphoneResponce;
