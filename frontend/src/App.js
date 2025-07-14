import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import UsageGuide from './UsageGuide';
import Support from './Support';
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
  const [vista, setVista] = useState(null); // 'ingresos', 'gastos' o null
  const [usuario, setUsuario] = useState(null);
  const [auth, setAuth] = useState({ nombre: '', password: '' });
  const [datos, setDatos] = useState({ ingresos: [], gastos: [] });
  const [formIngreso, setFormIngreso] = useState({ monto: '', fecha: '', categoria: '' });
  const [formGasto, setFormGasto] = useState({ monto: '', fecha: '', categoria: '' });
  const [prediccion, setPrediccion] = useState(null);
  const [errorPrediccion, setErrorPrediccion] = useState(null);
  const [cargandoPrediccion, setCargandoPrediccion] = useState(false);

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

  const fetchPrediccion = () => {
    setCargandoPrediccion(true);
    setErrorPrediccion(null);
    
    fetch(`http://127.0.0.1:5000/api/prediccion/${usuario}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
      })
      .then(data => {
        if (data && typeof data.prediccion !== 'undefined') {
          setPrediccion({
            monto: Number(data.prediccion),
            meses: data.meses_analizados || 'varios'
          });
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      })
      .catch(error => {
        console.error('Error fetching prediction:', error);
        setErrorPrediccion(error.message || 'Error al obtener la predicción');
      })
      .finally(() => {
        setCargandoPrediccion(false);
      });
  };

  const renderUltimos = (tipo) => {
    const ultimos = [...datos[tipo]].slice(-3);
    return (
      <table>
        <thead>
          <tr><th>Fecha</th><th>Monto</th><th>Categoría</th></tr>
        </thead>
        <tbody>
          {ultimos.map(item => (
            <tr key={item.id}>
              <td>{item.fecha}</td>
              <td>{item.monto}</td>
              <td>{item.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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
    <Router>
      <div className="auth-container">
        <h2>Iniciar sesión o Registrarse</h2>
        <input placeholder="Usuario" onChange={e => setAuth({ ...auth, nombre: e.target.value })} />
        <input placeholder="Contraseña" type="password" onChange={e => setAuth({ ...auth, password: e.target.value })} />
        <button onClick={() => handleAuth('login')}>Iniciar sesión</button>
        <button onClick={() => handleAuth('registro')}>Registrarse</button>
      </div>
    </Router>
  );

  return (
    <Router>
      <div className="app">
        <nav className="navbar-crema">
          <Link to="/support">Soporte</Link>
          <Link to="/guia">Guía de Uso</Link>
        </nav>

        <Routes>
          <Route path="/guia" element={<UsageGuide />} />
          <Route path="/support" element={<Support />} />
          <Route path="/" element={
            <>
              <h1>Dashboard Financiero</h1>

              <section>
                <h2>Cargar gastos por CSV</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('file', e.target.csvFile.files[0]);
                    formData.append('usuario_id', usuario);

                    fetch('http://127.0.0.1:5000/api/cargar_csv', {
                      method: 'POST',
                      body: formData
                    })
                      .then(res => res.json())
                      .then(data => {
                        alert(data.mensaje || data.error);
                        fetchDatos(usuario);
                      })
                      .catch(err => {
                        console.error("Error al cargar CSV:", err);
                        alert("Ocurrió un error al cargar el archivo");
                      });
                  }}
                >
                  <input type="file" name="csvFile" accept=".csv" required />
                  <button type="submit">Subir archivo</button>
                </form>
              </section>
              <section>
                <h2>Cargar ingresos por CSV</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('file', e.target.csvFile.files[0]);
                    formData.append('usuario_id', usuario);

                    fetch('http://127.0.0.1:5000/api/cargar_csv_ingresos', {
                      method: 'POST',
                      body: formData
                    })
                      .then(res => res.json())
                      .then(data => {
                        alert(data.mensaje || data.error);
                        fetchDatos(usuario);
                      })
                      .catch(err => {
                        console.error("Error al cargar ingresos CSV:", err);
                        alert("Error al cargar el archivo");
                      });
                  }}
                >
                  <input type="file" name="csvFile" accept=".csv" required />
                  <button type="submit">Subir archivo</button>
                </form>
              </section>

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

              {!vista && (
                <>
                  <section>
                    <h2>Últimos Ingresos</h2>
                    {renderUltimos('ingresos')}
                    <button onClick={() => setVista('ingresos')}>Ver todos</button>
                  </section>

                  <section>
                    <h2>Últimos Gastos</h2>
                    {renderUltimos('gastos')}
                    <button onClick={() => setVista('gastos')}>Ver todos</button>
                  </section>
                </>
              )}

              {vista && (
                <section>
                  <button onClick={() => setVista(null)}>⬅ Volver</button>
                  <h2>Todos los {vista}</h2>
                  {renderTabla(vista)}
                </section>
              )}

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

              <section className="prediction-section">
                <h2>🔮 Predicción de Gastos</h2>
                <div className="prediction-controls">
                  <button 
                    onClick={fetchPrediccion}
                    disabled={cargandoPrediccion}
                    className={`prediction-button ${cargandoPrediccion ? 'loading' : ''}`}
                  >
                    {cargandoPrediccion ? (
                      <>
                        <span className="spinner"></span>
                        Calculando...
                      </>
                    ) : (
                      'Predecir gastos del próximo mes'
                    )}
                  </button>
                  
                  {errorPrediccion && (
                    <div className="prediction-error">
                      <span>⚠️</span> {errorPrediccion}
                    </div>
                  )}
                </div>

                {prediccion && (
                  <div className="prediction-result">
                    <div className="prediction-amount">
                      ${prediccion.monto.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      <span className="currency">ARS</span>
                    </div>
                    <div className="prediction-details">
                      <p>Estimación basada en tus últimos {prediccion.meses || 'varios'} meses de gastos</p>
                      <small>La predicción usa regresión lineal sobre tus datos históricos</small>
                    </div>
                  </div>
                )}
              </section>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;