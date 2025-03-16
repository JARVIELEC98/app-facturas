// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaCliente from './components/ConsultaCliente';
import Facturas from './components/Facturas';
import Payphone from './components/Payphone';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/payphone" element={<Payphone />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
