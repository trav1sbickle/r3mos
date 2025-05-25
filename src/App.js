// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [auth, setAuth] = useState({ nombre: '', password: '' });
  const [datos, setDatos] = useState({ ingresos: [], gastos: [] });
  const [formIngreso, setFormIngreso] = useState({ monto: '', fecha: '', categoria: '' });
  const [formGasto, setFormGasto] = useState({ monto: '', fecha: '', categoria: '' });

  const categorias = ['Salario', 'Freelance', 'Alimentos', 'Transporte', 'Ocio', 'Otros'];

  const fetchDatos = (usuario_id) => {
    if (!usuario_id) return;
    fetch(`http://127.0.0.1:5000/api/datos/${usuario_id}`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener datos");
        return res.json();
      })
      .then(data => setDatos(data))
      .catch(err => console.error("fetchDatos error:", err));
  };

  const handleAuth = (tipo) => {
    if (!auth.nombre || !auth.password) {
      alert("Ingrese nombre y contraseña");
      return;
    }

    fetch(`http://127.0.0.1:5000/api/${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auth)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en autenticación");
        return res.json();
      })
      .then(data => {
        if (data.usuario_id) {
          setUsuario(data.usuario_id);
          fetchDatos(data.usuario_id);
        } else {
          alert(data.mensaje || data.error);
        }
      })
      .catch(err => {
        console.error("handleAuth error:", err);
        alert("No se pudo autenticar");
      });
  };

  const handleSubmit = (tipo, form) => {
    if (!usuario || !form.monto || !form.fecha || !form.categoria) {
      alert("Completa todos los campos");
      return;
    }

    fetch(`http://127.0.0.1:5000/api/${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, usuario_id: usuario })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en envío");
        return res.json();
      })
      .then(data => {
        console.log(data);
        fetchDatos(usuario);
      })
      .catch(err => {
        console.error("handleSubmit error:", err);
        alert("Error al enviar los datos");
      });
  };

  const handleDelete = (tipo, id) => {
    fetch(`http://127.0.0.1:5000/api/${tipo}/${id}`, { method: 'DELETE' })
      .then(() => fetchDatos(usuario))
      .catch(err => console.error("handleDelete error:", err));
  };

  const renderTabla = (tipo) => (
    <table>
      <thead>
        <tr><th>Fecha</th><th>Monto</th><th>Categoría</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {datos[tipo].map(item => (
          <tr key={item.id}>
            <td>{item.fecha}</td>
            <td>{item.monto}</td>
            <td>{item.categoria}</td>
            <td>
              <button onClick={() => handleDelete(tipo, item.id)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const data = datos.ingresos.map((ingreso, index) => ({
    name: ingreso.fecha,
    ingreso: ingreso.monto,
    gasto: datos.gastos[index] ? datos.gastos[index].monto : 0
  }));

  if (!usuario) return (
    <div className="auth-container">
      <h2>Iniciar sesión o Registrarse</h2>
      <input placeholder="Usuario" onChange={e => setAuth({ ...auth, nombre: e.target.value })} />
      <input placeholder="Contraseña" type="password" onChange={e => setAuth({ ...auth, password: e.target.value })} />
      <button onClick={() => handleAuth('login')}>Iniciar sesión</button>
      <button onClick={() => handleAuth('registro')}>Registrarse</button>
    </div>
  );

  return (
    <div className="app">
      <h1>Dashboard Financiero</h1>

      <section>
        <h3>Agregar Ingreso</h3>
        <input type="number" placeholder="Monto" value={formIngreso.monto} onChange={e => setFormIngreso({ ...formIngreso, monto: e.target.value })} />
        <input type="date" value={formIngreso.fecha} onChange={e => setFormIngreso({ ...formIngreso, fecha: e.target.value })} />
        <select onChange={e => setFormIngreso({ ...formIngreso, categoria: e.target.value })} defaultValue="">
          <option disabled value="">Selecciona categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => handleSubmit('ingreso', formIngreso)}>Agregar Ingreso</button>
      </section>

      <section>
        <h3>Agregar Gasto</h3>
        <input type="number" placeholder="Monto" value={formGasto.monto} onChange={e => setFormGasto({ ...formGasto, monto: e.target.value })} />
        <input type="date" value={formGasto.fecha} onChange={e => setFormGasto({ ...formGasto, fecha: e.target.value })} />
        <select onChange={e => setFormGasto({ ...formGasto, categoria: e.target.value })} defaultValue="">
          <option disabled value="">Selecciona categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => handleSubmit('gasto', formGasto)}>Agregar Gasto</button>
      </section>

      <section>
        <h2>Ingresos</h2>
        {renderTabla('ingresos')}
      </section>

      <section>
        <h2>Gastos</h2>
        {renderTabla('gastos')}
      </section>

      <section>
        <h2>Gráfico</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingreso" stroke="#8884d8" />
            <Line type="monotone" dataKey="gasto" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

export default App;
