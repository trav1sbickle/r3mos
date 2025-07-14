import React from 'react';
import { Link } from 'react-router-dom';
import UsageGuide from './UsageGuide';

function Support() {
  return (
    <div className="app">
      <h1 id="TituloPrincipal">Soporte</h1>

      <div className="navbar-crema">
        <Link to="/">Inicio</Link>
      </div>

      <section>
        <h3>Contáctanos</h3>
        <p>📧 Email: soporte@empresa-ficticia.com</p>
        <p>📞 Teléfono: +54 11 1234-5678</p>
        <p>📍 Dirección: Av. Ficticia 1234, Buenos Aires, Argentina</p>
      </section>

      <section>
        <h3>Ubicación de Nuestras Oficinas</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <iframe
            title="Ubicación Oficinas Ficticias"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.7999567332353!2d-58.437089624259995!3d-34.60909475799956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb7e7583d6b7%3A0x8be5e8c62608c0e7!2sFacultad%20de%20Ingenier%C3%ADa%20de%20la%20UBA!5e0!3m2!1ses-419!2sar!4v1720962724573!5m2!1ses-419!2sar"
            width="400"
            height="300"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  );
}

export default Support;
