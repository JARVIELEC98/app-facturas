// PagoFactura.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PagoFactura = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const [items, setItems] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paidInvoiceResponse, setPaidInvoiceResponse] = useState(null);

  const paidInvoiceCalledRef = useRef(false);

  let amount = 0;
  let reference = '';
  let transactionId = '';
  let pasarela = 'Payphone';
  if (state) {
    amount = state.amount;
    reference = state.reference;
    transactionId = state.transactionId || '';
    pasarela = state.pasarela || 'Payphone';
  }

  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  const PAIDINVOICE_API_URL = process.env.REACT_APP_PAIDINVOICE_API_URL;
  const GETINVOICE_API_URL = process.env.REACT_APP_GETINVOICE_API_URL;
  const CLIENT_API_URL = process.env.REACT_APP_API_URL_CLIENTE;

  // 1) useEffect para registrar el pago y obtener la factura
  useEffect(() => {
    if (!reference) return;
    if (paidInvoiceCalledRef.current) return;

    setLoading(true);
    setError('');
    paidInvoiceCalledRef.current = true;

    fetch(PAIDINVOICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        token: API_TOKEN,
        idfactura: reference,
        pasarela: pasarela,
        idtransaccion: transactionId || Date.now().toString(),
        cantidad: 1,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.estado === 'exito') {
          setPaidInvoiceResponse(data);
          return fetch(GETINVOICE_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify({
              token: API_TOKEN,
              idfactura: reference,
            }),
          });
        } else {
          throw new Error('Error al registrar el pago');
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al llamar a la API GetInvoice');
        }
        return response.json();
      })
      .then(data => {
        if (data.estado !== 'exito') {
          throw new Error('La API de GetInvoice devolvió un estado diferente de exito');
        }
        setInvoiceData(data.factura);
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [reference, pasarela, transactionId, API_TOKEN, PAIDINVOICE_API_URL, GETINVOICE_API_URL]);

  // 2) useEffect para obtener datos del cliente
  useEffect(() => {
    if (invoiceData && invoiceData.idcliente) {
      fetch(CLIENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          token: API_TOKEN,
          idcliente: invoiceData.idcliente,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.estado === 'exito' && data.datos && data.datos.length > 0) {
            setClientData(data.datos[0]);
          } else {
            throw new Error('Error al obtener los datos del cliente');
          }
        })
        .catch(err => {
          console.error('Error en GetClientsDetails:', err.message);
        });
    }
  }, [invoiceData, CLIENT_API_URL, API_TOKEN]);

  if (!state) {
    return (
      <div className="container mt-5 text-center">
        <h1>No hay datos de pago</h1>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Procesando pago y obteniendo detalles de la factura...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Error</h1>
        <div className="alert alert-danger mt-3">
          <p>{error}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Pago de Factura</h1>

      {paidInvoiceResponse && (
        <div
          className="alert alert-success mt-4"
          role="alert"
          style={{ border: '2px solid #28a745' }}
        >
          <h4 className="alert-heading">¡Pago Exitoso!</h4>
          <hr />
          <p>
            <strong>Estado:</strong> {paidInvoiceResponse.estado}
          </p>
          <p>{paidInvoiceResponse.salida}</p>
          <p>
            <strong>ID de Pago:</strong> {paidInvoiceResponse.id}
          </p>
        </div>
      )}

      {invoiceData && (
        <div className="card mt-4">
          <div className="card-header">
            <h4>Datos de la Factura</h4>
          </div>
          <div className="card-body">
            <p>
              <strong>ID Cliente:</strong> {invoiceData.idcliente}
            </p>
            {clientData && (
              <p>
                <strong>Cliente:</strong> {clientData.nombre}{' '}
                <span
                  style={{
                    border: `2px solid ${
                      clientData.estado.toLowerCase() === 'activo' ? 'green' : 'red'
                    }`,
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}
                >
                  {clientData.estado}
                </span>
              </p>
            )}

            <p>
              <strong>Fecha de Emisión:</strong> {invoiceData.emitido}
            </p>

            {/* Estado de la factura */}
            <p>
              <strong>Estado:</strong>{' '}
              {invoiceData.estado.toLowerCase() === 'pagado' ? (
                <>
                  <span
                    style={{
                      border: '2px solid green',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }}
                  >
                    {invoiceData.estado}
                  </span>
                  {' '}
                  <span
                    style={{
                      border: '2px solid green',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      marginLeft: '6px'
                    }}
                  >
                    FACTURA - {invoiceData.id}
                  </span>
                </>
              ) : invoiceData.estado.toLowerCase() === 'vencido' ? (
                <>
                  <span
                    style={{
                      border: '2px solid red',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }}
                  >
                    {invoiceData.estado}
                  </span>
                  {' '}
                  <span
                    style={{
                      border: '2px solid red',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      marginLeft: '6px'
                    }}
                  >
                    FACTURA - {invoiceData.id}
                  </span>
                </>
              ) : (
                invoiceData.estado
              )}
            </p>

            {/* Descripción de la factura (ítems) */}
            {items.length > 0 && (
              <div className="mb-3">
                {items.map((item, index) => (
                  <p key={index}>
                    <strong>Descripción:</strong> {item.descrp}
                  </p>
                ))}
              </div>
            )}

            {/* Alineación a la derecha de Subtotal, Impuestos y Total */}
            <div className="text-end mt-3">
              <p>
                <strong>Subtotal:</strong> {invoiceData.subtotal2 || invoiceData.subtotal}
              </p>
              <p>
                <strong>Impuestos:</strong> {invoiceData.impuesto2}
              </p>
              <p>
                <strong>Total:</strong> {invoiceData.total2 || invoiceData.total}
              </p>
            </div>

            {invoiceData.urlpdf && (
              <p>
                <strong>Ver PDF:</strong>{' '}
                <a
                  href={invoiceData.urlpdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Factura PDF
                </a>
              </p>
            )}
            <p>
              <strong>Forma de Pago:</strong> {invoiceData.formapago || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PagoFactura;
