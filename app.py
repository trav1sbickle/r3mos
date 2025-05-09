from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Función para conectar con la base de datos
def conectar_db():
    return sqlite3.connect('finanzas.db')

# Función para verificar si ya existe un ingreso o gasto para una fecha
def obtener_monto_existente(tabla, fecha):
    conn = conectar_db()
    c = conn.cursor()
    c.execute(f"SELECT SUM(monto) FROM {tabla} WHERE fecha = ?", (fecha,))
    monto = c.fetchone()[0] or 0  # Si no hay registros, el monto será 0
    conn.close()
    return monto

# Endpoint para agregar ingresos
@app.route('/api/ingreso', methods=['POST'])
def agregar_ingreso():
    data = request.json  # Recibe los datos enviados desde el frontend
    monto = data.get("monto")
    fecha = data.get("fecha")

    if monto is None or fecha is None:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = conectar_db()
    c = conn.cursor()
    
    # Verificar si ya hay un ingreso para esa fecha
    monto_existente = obtener_monto_existente("ingresos", fecha)
    nuevo_monto = monto_existente + monto
    
    # Actualizar el monto o insertar uno nuevo
    c.execute("DELETE FROM ingresos WHERE fecha = ?", (fecha,))  # Eliminar los registros previos
    c.execute("INSERT INTO ingresos (monto, fecha) VALUES (?, ?)", (nuevo_monto, fecha))
    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Ingreso agregado correctamente"})

# Endpoint para agregar gastos
@app.route('/api/gasto', methods=['POST'])
def agregar_gasto():
    data = request.json  # Recibe los datos enviados desde el frontend
    monto = data.get("monto")
    fecha = data.get("fecha")

    if monto is None or fecha is None:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = conectar_db()
    c = conn.cursor()

    # Verificar si ya hay un gasto para esa fecha
    monto_existente = obtener_monto_existente("gastos", fecha)
    nuevo_monto = monto_existente + monto

    # Actualizar el monto o insertar uno nuevo
    c.execute("DELETE FROM gastos WHERE fecha = ?", (fecha,))  # Eliminar los registros previos
    c.execute("INSERT INTO gastos (monto, fecha) VALUES (?, ?)", (nuevo_monto, fecha))
    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Gasto agregado correctamente"})

# Ruta para obtener los datos de ingresos y gastos
@app.route('/api/datos')
def obtener_datos():
    conn = conectar_db()
    c = conn.cursor()
    
    # Obtener los datos de ingresos ordenados por fecha
    c.execute('SELECT * FROM ingresos ORDER BY fecha ASC')  # ASC para orden ascendente
    ingresos = c.fetchall()
    
    # Obtener los datos de gastos ordenados por fecha
    c.execute('SELECT * FROM gastos ORDER BY fecha ASC')  # ASC para orden ascendente
    gastos = c.fetchall()
    
    conn.close()
    
    # Formatear los datos para enviarlos como JSON
    datos = {
        "ingresos": [{"id": row[0], "monto": row[1], "fecha": row[2]} for row in ingresos],
        "gastos": [{"id": row[0], "monto": row[1], "fecha": row[2]} for row in gastos]
    }
    
    return jsonify(datos)

@app.route('/')
def home():
    return "¡Bienvenido al Dashboard de Análisis Financiero!"
# Ruta para borrar todos los datos
@app.route('/api/borrar', methods=['DELETE'])
def borrar_datos():
    confirmacion = request.args.get('confirmacion')  # Obtener la confirmación desde la URL

    if confirmacion != "si-borrar":
        return jsonify({"error": "No se ha confirmado la acción de borrar los datos."}), 400

    try:
        conn = conectar_db()
        c = conn.cursor()
        
        # Borrar todos los registros de las tablas
        c.execute('DELETE FROM ingresos')
        c.execute('DELETE FROM gastos')
        
        conn.commit()
        conn.close()

        return jsonify({"mensaje": "Datos borrados correctamente. Esta acción no se puede deshacer."})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
