// src/components/admin/Admin.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminMenu from './AdminMenu';
import './Admin.css';

const Admin = () => {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('techLogged'));
  
  // Estado para nombre y cédula
  const [nombreAgente, setNombreAgente] = useState(localStorage.getItem('clienteNombre') || '');
  const [cedulaAgente, setCedulaAgente] = useState(localStorage.getItem('clienteCedula') || '');

  // Estados para el formulario de login
  const [cedula, setCedula] = useState('');
  const [codigo, setCodigo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para el menú lateral
  const [menuOpen, setMenuOpen] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    fetch(`${process.env.REACT_APP_API_URL_CLIENTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
      },
      body: JSON.stringify({
        token: process.env.REACT_APP_API_TOKEN,
        cedula: cedula,
        codigo: codigo
      })
    })
      .then((res) => res.json())
      .then((data) => {
        // Verifica que la respuesta tenga estado "exito" y que el token_cliente no esté vacío
        if (
          data.estado === 'exito' &&
          data.datos &&
          data.datos.length > 0 &&
          data.datos[0].token_cliente &&
          data.datos[0].token_cliente.trim() !== ''
        ) {
          // Guardar flag de sesión
          localStorage.setItem('techLogged', 'true');
          // Guardar token
          localStorage.setItem('clienteToken', data.datos[0].token_cliente);

          // Guardar nombre y cédula
          const nombre = data.datos[0].nombre || 'Usuario';
          const cedulaResp = data.datos[0].cedula || '';

          setNombreAgente(nombre);
          setCedulaAgente(cedulaResp);

          localStorage.setItem('clienteNombre', nombre);
          localStorage.setItem('clienteCedula', cedulaResp);

          setIsAuthenticated(true);
        } else {
          setError('Usuario no autorizado, comuníquese con el administrador');
        }
      })
      .catch((err) => {
        console.error('Error en el login:', err);
        setError('Error en la conexión');
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('techLogged');
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteCedula');
    setIsAuthenticated(false);
    setNombreAgente('');
    setCedulaAgente('');
  };

  // Alternar el menú lateral
  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!isAuthenticated) {
    // Mostrar formulario de login
    return (
      <div className="container mt-5" style={{ maxWidth: '400px' }}>
        <h2>Login Admin</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label>Cédula:</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3" style={{ position: 'relative' }}>
            <label>Código:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="form-control"
              required
            />
            <span
              onClick={toggleShowPassword}
              style={{
                position: 'absolute',
                top: '38px',
                right: '10px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="btn btn-primary">
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-3">
          <strong>Autenticación vía API</strong>
        </p>
      </div>
    );
  }

  // Mostrar panel administrativo si está autenticado
  return (
    <div className="admin-container">
      <div className={`sidebar ${menuOpen ? 'expanded' : 'collapsed'}`}>
        <div className="profile-section">
          <div className="profile-info">
            {/* Mostrar el nombre y debajo la cédula */}
            <h3 className="profile-name">{nombreAgente}</h3>
            <span className="profile-role">{cedulaAgente}</span>
          </div>
        </div>

        <button className="toggle-btn" onClick={toggleMenu}>
          {menuOpen ? '<' : '>'}
        </button>

        <AdminMenu menuOpen={menuOpen} handleLogout={handleLogout} />
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
