// src/components/Facturas.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Facturas = () => {
  const { state } = useLocation();
  const cliente = state?.cliente;
  const navigate = useNavigate();

  const [facturasNoPagadas, setFacturasNoPagadas] = useState([]);
  const [facturasPagadas, setFacturasPagadas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // -- ESTADOS PARA MOSTRAR DETALLE DE UNA SOLA FACTURA --
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [itemsDetalle, setItemsDetalle] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  // Variables de entorno
  const API_URL_FACTURAS = process.env.REACT_APP_API_URL_FACTURAS;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  // API para obtener detalles de una factura en particular
  const API_URL_DETALLE_FACTURA =
    process.env.REACT_APP_API_URL_DETALLE_FACTURA ||
    'https://sistema.sisnetel.com/api/v1/GetInvoice';

  // -----------------------------------------------------
  // 1) OBTENER LISTA DE FACTURAS (no pagadas y pagadas)
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // 2) FUNCIÓN PARA VER DETALLE DE UNA FACTURA
  // -----------------------------------------------------
  const handleVerFactura = async (factura) => {
    setSelectedFactura(factura);
    setItemsDetalle([]);       // Limpia ítems anteriores
    setErrorDetalle('');
    setLoadingDetalle(true);

    try {
      const response = await fetch(API_URL_DETALLE_FACTURA, {
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

      if (!response.ok) {
        throw new Error('Error al obtener detalle de la factura');
      }
      const data = await response.json();
      if (data.estado !== 'exito') {
        throw new Error('Error en la respuesta de la API');
      }
      setItemsDetalle(data.items || []);
    } catch (error) {
      setErrorDetalle(error.message);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // -----------------------------------------------------
  // 3) RENDER SI ESTAMOS MOSTRANDO DETALLE DE UNA FACTURA
  // -----------------------------------------------------
  if (selectedFactura) {
    // Si el usuario ya hizo clic en "Ver Factura", mostramos SOLO esta factura
    return (
      <div className="container mt-5">
        <h2>Detalle de Factura #{selectedFactura.id}</h2>

        {/* Mostramos también los datos del cliente */}
        {cliente && (
          <div className="mb-4">
            <p>
              <strong>ID Cliente:</strong> {cliente.id}
            </p>
            <p>
              <strong>Nombre Completo:</strong> {cliente.nombre}
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

        {loadingDetalle ? (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        ) : errorDetalle ? (
          <div className="alert alert-danger mt-3">{errorDetalle}</div>
        ) : (
          <>
            <p>
              <strong>Total:</strong> ${selectedFactura.total}
            </p>
            <p>
              <strong>Estado de la Factura:</strong> {selectedFactura.estado}
            </p>
            {/* Si la factura tiene la propiedad urlpdf */}
            {selectedFactura.urlpdf && (
              <p>
                <strong>Ver Factura en PDF:</strong>{' '}
                <a
                  href={selectedFactura.urlpdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir PDF
                </a>
              </p>
            )}

            {/* Tabla de ítems */}
            <h4>Ítems de la Factura</h4>
            {itemsDetalle.length === 0 ? (
              <p>No hay ítems para esta factura.</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Unidades</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsDetalle.map((item, index) => (
                    <tr key={index}>
                      <td>{item.descrp}</td>
                      <td>{item.unidades}</td>
                      <td>{item.precio}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <button
          className="btn btn-secondary mt-3"
          onClick={() => setSelectedFactura(null)}
        >
          Regresar
        </button>
      </div>
    );
  }

  // -----------------------------------------------------
  // 4) RENDER PRINCIPAL: LISTA DE FACTURAS (cuando selectedFactura es null)
  // -----------------------------------------------------
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
                  <button
                    className="btn btn-primary me-2"
                    onClick={() =>
                      alert(`Pagando DE UNA la factura con ID: ${factura.id}`)
                    }
                  >
                    DE UNA
                  </button>
                  <button
                    className="btn btn-warning me-2"
                    onClick={() =>
                      alert(`Pagando con DEPÓSITO la factura con ID: ${factura.id}`)
                    }
                  >
                    DEPÓSITO
                  </button>
                  {/* BOTÓN para ver sólo esta factura */}
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
                  {/* BOTÓN para ver sólo esta factura */}
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
