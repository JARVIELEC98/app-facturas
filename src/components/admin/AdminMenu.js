// src/components/admin/AdminMenu.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaMoneyBillWave } from 'react-icons/fa';

const AdminMenu = ({ menuOpen, handleLogout }) => {
  return (
    <ul className="menu-list">
      <li>
        <Link to="/admin" className="menu-item">
          <FaHome style={{ marginRight: '12px' }} />
          {menuOpen && <span>Inicio</span>}
        </Link>
      </li>

      {/* Nuevo ítem de menú: Promesa de pago */}
      <li>
        <Link to="/admin/promesa" className="menu-item">
          <FaMoneyBillWave style={{ marginRight: '12px' }} />
          {menuOpen && <span>Promesa de pago</span>}
        </Link>
      </li>

      <li>
        <button className="menu-item" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: '12px' }} />
          {menuOpen && <span>Cerrar Sesión</span>}
        </button>
      </li>
    </ul>
  );
};

export default AdminMenu;
