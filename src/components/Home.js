// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaHandshake } from 'react-icons/fa'; // Iconos de ejemplo
import './Home.css'; // <-- Importamos un CSS opcional para estilos extra

const Home = () => {
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

      {/* Contenedor que en móviles (xs) apila los botones y en pantallas medianas/altas los alinea */}
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
