import React from 'react';
import { Link } from 'react-router-dom';

function UsageGuide() {
  return (
    <div className="app">
      <h1 id="TituloPrincipal">Guía de Uso</h1>

      <div className="navbar-crema">
        <Link to="/">Inicio</Link>
        <Link to="/support">Soporte</Link>
      </div>

      <section>
        <h3>¿Qué es el Dashboard Financiero?</h3>
        <p>
          Este dashboard está diseñado para ayudarte a gestionar tus finanzas personales.
          Podrás registrar tus ingresos, tus gastos, visualizar la evolución en gráficos
          y obtener una predicción de gastos futuros basada en tus hábitos.
        </p>
      </section>

      <section>
        <h3>Pasos para Usar la Plataforma</h3>
        <ol>
          <li><strong>Registrate</strong> si es tu primera vez o <strong>Iniciá sesión</strong> si ya tenés una cuenta.</li>
          <li>Agregá tus <strong>Ingresos</strong> usando el formulario de "Agregar Ingreso".</li>
          <li>Registrá tus <strong>Gastos</strong> en la sección de "Agregar Gasto".</li>
          <li>Consultá los <strong>listados de ingresos y gastos</strong> en las tablas.</li>
          <li>Visualizá la evolución de tus finanzas en el <strong>gráfico comparativo</strong>.</li>
          <li>Usá la opción <strong>Predecir gastos del próximo mes</strong> para obtener una estimación.</li>
        </ol>
      </section>

      <section>
        <h3>Consejos Útiles</h3>
        <ul>
          <li>Registrá tus movimientos diariamente para obtener mejores predicciones.</li>
          <li>Utilizá las categorías disponibles para una mejor organización.</li>
          <li>Consultá la sección de <strong>Soporte</strong> si necesitás ayuda adicional.</li>
        </ul>
      </section>
    </div>
  );
}

export default UsageGuide;
