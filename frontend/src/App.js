import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [datos, setDatos] = useState({ ingresos: [], gastos: [] });
  const [montoIngreso, setMontoIngreso] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [fechaGasto, setFechaGasto] = useState('');

  // Obtener datos del backend
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/datos')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDatos(data);
      })
      .catch((error) => console.error('Error al obtener los datos:', error));
  }, []);

  // Preparar los datos para los gráficos
  const data = datos.ingresos.map((ingreso, index) => ({
    name: ingreso.fecha,
    ingreso: ingreso.monto,
    gasto: datos.gastos[index] ? datos.gastos[index].monto : 0,
  }));

  // Función para manejar el envío del formulario de ingreso
  const agregarIngreso = (e) => {
    e.preventDefault();

    const newIngreso = {
      monto: parseFloat(montoIngreso),
      fecha: fechaIngreso,
    };

    fetch('http://127.0.0.1:5000/api/ingreso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIngreso),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMontoIngreso('');
        setFechaIngreso('');
        // Volver a obtener los datos actualizados
        fetch('http://127.0.0.1:5000/api/datos')
          .then((response) => response.json())
          .then((data) => setDatos(data))
          .catch((error) => console.error('Error al obtener los datos:', error));
      })
      .catch((error) => console.error('Error al agregar ingreso:', error));
  };

  // Función para manejar el envío del formulario de gasto
  const agregarGasto = (e) => {
    e.preventDefault();

    const newGasto = {
      monto: parseFloat(montoGasto),
      fecha: fechaGasto,
    };

    fetch('http://127.0.0.1:5000/api/gasto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGasto),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMontoGasto('');
        setFechaGasto('');
        // Volver a obtener los datos actualizados
        fetch('http://127.0.0.1:5000/api/datos')
          .then((response) => response.json())
          .then((data) => setDatos(data))
          .catch((error) => console.error('Error al obtener los datos:', error));
      })
      .catch((error) => console.error('Error al agregar gasto:', error));
  };

  function borrarDatos() {
    const confirmar = window.confirm("¡Advertencia! Esta acción eliminará todos los ingresos y gastos. ¿Estás seguro de que deseas continuar?");
    
    if (confirmar) {
      // Realizar la petición para borrar los datos
      fetch("http://127.0.0.1:5000/api/borrar?confirmacion=si-borrar", {
        method: "DELETE"
      })
      .then(response => response.json())
      .then(data => {
        alert(data.mensaje || data.error);
        if (data.mensaje) {
          // Limpiar los datos en el frontend
          setDatos({ ingresos: [], gastos: [] });
        }
      })
      .catch(error => console.error("Error al borrar los datos:", error));
    } else {
      alert("La operación de borrado fue cancelada.");
    }
  }
  
  return (
    <div>
      <h1>Dashboard Financiero</h1>
  
      {/* Formulario de Ingreso */}
      <form onSubmit={agregarIngreso}>
        <h3>Agregar Ingreso</h3>
        <input
          type="number"
          value={montoIngreso}
          onChange={(e) => setMontoIngreso(e.target.value)}
          placeholder="Monto"
          required
        />
        <input
          type="date"
          value={fechaIngreso}
          onChange={(e) => setFechaIngreso(e.target.value)}
          required
        />
        <button type="submit">Agregar Ingreso</button>
      </form>
  
      {/* Formulario de Gasto */}
      <form onSubmit={agregarGasto}>
        <h3>Agregar Gasto</h3>
        <input
          type="number"
          value={montoGasto}
          onChange={(e) => setMontoGasto(e.target.value)}
          placeholder="Monto"
          required
        />
        <input
          type="date"
          value={fechaGasto}
          onChange={(e) => setFechaGasto(e.target.value)}
          required
        />
        <button type="submit">Agregar Gasto</button>
      </form>
  
      {/* Botón para borrar todos los datos */}
      <button onClick={borrarDatos} style={{ marginTop: '20px', backgroundColor: 'red', color: 'white' }}>
        Borrar Todos los Datos
      </button>
  
      {/* Gráfico */}
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
    </div>
  );
}

export default App;
