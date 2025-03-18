// Facturas.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Facturas = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // El cliente (y otros datos) que llegan por state
  const cliente = state?.cliente;

  // Estados para la lista de facturas
  const [facturasNoPagadas, setFacturasNoPagadas] = useState([]);
  const [facturasPagadas, setFacturasPagadas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // NUEVOS estados para el detalle de factura
  // ---------------------------
  const [showDetail, setShowDetail] = useState(false);   // Controla si se muestra la vista de detalle
  const [invoiceData, setInvoiceData] = useState(null);  // Datos de la factura
  const [items, setItems] = useState([]);                // Ítems de la factura
  const [clientData, setClientData] = useState(null);    // Datos del cliente
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');

  // Variables de entorno
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  const API_URL_FACTURAS = process.env.REACT_APP_API_URL_FACTURAS;
  const GETINVOICE_API_URL = process.env.REACT_APP_GETINVOICE_API_URL;
  const CLIENT_API_URL = process.env.REACT_APP_API_URL_CLIENTE;

  // 1) OBTENER LISTA DE FACTURAS
  useEffect(() => {
    if (!cliente) return;

    const fetchFacturas = async () => {
      setLoading(true);
      setError('');
      try {
        // Facturas NO PAGADAS
        const bodyNoPagadas = JSON.stringify({
          token: API_TOKEN,
          limit: 25,
          estado: '1', // 1 = no pagadas
          idcliente: cliente.id
        });

        const respNoPagadas = await fetch(API_URL_FACTURAS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`
          },
          body: bodyNoPagadas
        });
        if (!respNoPagadas.ok) {
          throw new Error('Error al obtener facturas no pagadas');
        }
        const dataNoPagadas = await respNoPagadas.json();
        if (dataNoPagadas.estado === 'exito') {
          setFacturasNoPagadas(dataNoPagadas.facturas || []);
        }

        // Facturas PAGADAS
        const bodyPagadas = JSON.stringify({
          token: API_TOKEN,
          limit: 25,
          estado: '0', // 0 = pagadas
          idcliente: cliente.id
        });

        const respPagadas = await fetch(API_URL_FACTURAS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`
          },
          body: bodyPagadas
        });
        if (!respPagadas.ok) {
          throw new Error('Error al obtener facturas pagadas');
        }
        const dataPagadas = await respPagadas.json();
        if (dataPagadas.estado === 'exito') {
          setFacturasPagadas(dataPagadas.facturas || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [cliente, API_TOKEN, API_URL_FACTURAS]);

  // 2) FUNCIÓN PARA VER DETALLE DE UNA FACTURA
  const handleVerFactura = async (factura) => {
    setShowDetail(true);       // Activamos la vista de detalle
    setInvoiceData(null);      // Limpiamos la data anterior
    setItems([]);
    setClientData(null);
    setErrorDetail('');
    setLoadingDetail(true);

    try {
      // 2.1) Obtener datos de la factura (GetInvoice)
      const resp = await fetch(GETINVOICE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          token: API_TOKEN,
          idfactura: factura.id
        })
      });

      if (!resp.ok) {
        throw new Error('Error al llamar a la API GetInvoice');
      }
      const data = await resp.json();
      if (data.estado !== 'exito') {
        throw new Error('La API de GetInvoice devolvió un estado diferente de exito');
      }
      setInvoiceData(data.factura);
      setItems(data.items || []);

      // 2.2) Obtener datos del cliente (GetClientsDetails) usando invoiceData.idcliente
      if (data.factura && data.factura.idcliente) {
        const clientResp = await fetch(CLIENT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`
          },
          body: JSON.stringify({
            token: API_TOKEN,
            idcliente: data.factura.idcliente
          })
        });
        if (!clientResp.ok) {
          throw new Error('Error al llamar a la API GetClientsDetails');
        }
        const clientDataJson = await clientResp.json();
        if (
          clientDataJson.estado === 'exito' &&
          clientDataJson.datos &&
          clientDataJson.datos.length > 0
        ) {
          setClientData(clientDataJson.datos[0]);
        } else {
          throw new Error('Error al obtener los datos del cliente');
        }
      }
    } catch (error) {
      setErrorDetail(error.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 3) RENDER CONDICIONAL: si showDetail = true, mostramos la vista de detalle
  if (showDetail) {
    // Vista de Detalle de Factura
    return (
      <div className="container mt-4">
        <h2>Datos de la Factura</h2>

        {loadingDetail ? (
          <div className="mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando detalle...</span>
            </div>
            <p className="mt-2">Obteniendo datos de la factura...</p>
          </div>
        ) : errorDetail ? (
          <div className="alert alert-danger mt-3">
            <p>{errorDetail}</p>
            <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>
              Regresar
            </button>
          </div>
        ) : (
          // MOSTRAMOS LA MISMA ESTRUCTURA QUE EN PagoFactura.js
          <>
            {invoiceData && (
              <div className="card">
                <div className="card-body">
                  <p><strong>ID Cliente:</strong> {invoiceData.idcliente}</p>

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

                  <p><strong>Fecha de Emisión:</strong> {invoiceData.emitido}</p>

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
                        </span>{' '}
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
                        </span>{' '}
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

                  {/* Ítems / Descripción */}
                  {items.length > 0 && (
                    <div className="mb-3">
                      {items.map((item, index) => (
                        <p key={index}>
                          <strong>Descripción:</strong> {item.descrp}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Subtotal, Impuestos, Total alineados a la derecha */}
                  <div className="text-end">
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

            <button className="btn btn-secondary mt-3" onClick={() => setShowDetail(false)}>
              Regresar
            </button>
          </>
        )}
      </div>
    );
  }

  // 4) VISTA PRINCIPAL (LISTA DE FACTURAS)
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Facturas del Cliente</h1>
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
        <h1>Facturas del Cliente</h1>
        <div className="alert alert-danger mt-3">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">
        Regresar
      </button>

      <h1 className="mt-3">Facturas del Cliente</h1>

      {/* Datos del Cliente */}
      {cliente && (
        <div className="mb-4">
          <p>
            <strong>ID Cliente:</strong> {cliente.id}
          </p>
          <p>
            <strong>Nombre Completo:</strong> {cliente.nombre}
          </p>
          <p>
            <strong>Valor Total de Facturas:</strong>{' '}
            {cliente.facturacion && cliente.facturacion.total_facturas}
          </p>
          <p>
            <strong>Estado del Servicio:</strong>{' '}
            <span
              className={
                cliente.estado === 'ACTIVO' ? 'text-success' : 'text-danger'
              }
            >
              {cliente.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}
            </span>
          </p>
        </div>
      )}

      {/* FACTURAS NO PAGADAS */}
      <h3>Facturas No Pagadas</h3>
      {facturasNoPagadas.length === 0 ? (
        <p>No hay facturas no pagadas.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pagar / Ver</th>
            </tr>
          </thead>
          <tbody>
            {facturasNoPagadas.map((factura) => (
              <tr key={factura.id}>
                <td>{factura.id}</td>
                <td>${factura.total}</td>
                <td>{factura.estado}</td>
                <td>
                  {/* BOTÓN PAYPHONE */}
                  <button
                    className="btn btn-success me-2"
                    onClick={() =>
                      navigate('/payphone', {
                        state: {
                          facturaId: factura.id,
                          total: factura.total,
                          cliente
                        }
                      })
                    }
                  >
                    PAYPHONE
                  </button>

                  {/* BOTÓN "DE UNA" */}
                  <button
                    className="btn btn-primary me-2"
                    onClick={() =>
                      navigate('/pagofactura', {
                        state: {
                          amount: factura.total,
                          reference: factura.id,
                          pasarela: 'OTRO_METODO',
                          cliente
                        }
                      })
                    }
                  >
                    DE UNA
                  </button>

                  {/* BOTÓN DEPÓSITO */}
                  <button
                    className="btn btn-warning me-2"
                    onClick={() =>
                      navigate('/pagofactura', {
                        state: {
                          amount: factura.total,
                          reference: factura.id,
                          pasarela: 'DEPOSITO',
                          cliente
                        }
                      })
                    }
                  >
                    DEPÓSITO
                  </button>

                  {/* BOTÓN para ver sólo esta factura (detalle local) */}
                  <button
                    className="btn btn-info"
                    onClick={() => handleVerFactura(factura)}
                  >
                    Ver Factura
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* FACTURAS PAGADAS */}
      <h3>Facturas Pagadas</h3>
      {facturasPagadas.length === 0 ? (
        <p>No hay facturas pagadas.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {facturasPagadas.map((factura) => (
              <tr key={factura.id}>
                <td>{factura.id}</td>
                <td>${factura.total}</td>
                <td>{factura.estado}</td>
                <td>
                  {/* BOTÓN para ver sólo esta factura (detalle local) */}
                  <button
                    className="btn btn-info"
                    onClick={() => handleVerFactura(factura)}
                  >
                    Ver Factura
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Facturas;
