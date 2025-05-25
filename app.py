# Paso 1: Agregar Categorías y Actualizar DB y Endpoints
# Paso 2: Autenticación de Usuarios
# Paso 3: Edición y Eliminación Individual
# Paso 4: UI Moderna y Responsiva (sólo base)

# -----------------------------
# BACKEND: Flask (app.py)
# -----------------------------

# --- IMPORTS ACTUALIZADOS ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- BASE DE DATOS ---
def conectar_db():
    return sqlite3.connect("finanzas.db")

# --- INICIALIZAR DB ---
def init_db():
    conn = conectar_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        password TEXT
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS ingresos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL,
        fecha TEXT,
        categoria TEXT,
        usuario_id INTEGER
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL,
        fecha TEXT,
        categoria TEXT,
        usuario_id INTEGER
    )
    """)
    conn.commit()
    conn.close()

init_db()

# --- AUTENTICACIÓN ---
@app.route('/api/registro', methods=['POST'])
def registro():
    data = request.json
    nombre = data.get("nombre")
    password = data.get("password")
    if not nombre or not password:
        return jsonify({"error": "Datos incompletos"}), 400

    hash_pass = generate_password_hash(password)
    try:
        conn = conectar_db()
        c = conn.cursor()
        c.execute("INSERT INTO usuarios (nombre, password) VALUES (?, ?)", (nombre, hash_pass))
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Usuario registrado"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Usuario ya existe"}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    nombre = data.get("nombre")
    password = data.get("password")

    conn = conectar_db()
    c = conn.cursor()
    c.execute("SELECT id, password FROM usuarios WHERE nombre = ?", (nombre,))
    row = c.fetchone()
    conn.close()

    if row and check_password_hash(row[1], password):
        return jsonify({"mensaje": "Login exitoso", "usuario_id": row[0]})
    return jsonify({"error": "Credenciales inválidas"}), 401

# --- ENDPOINTS ACTUALIZADOS ---
@app.route('/api/ingreso', methods=['POST'])
def agregar_ingreso():
    data = request.json
    monto, fecha, categoria, usuario_id = data.get("monto"), data.get("fecha"), data.get("categoria"), data.get("usuario_id")
    if None in (monto, fecha, categoria, usuario_id):
        return jsonify({"error": "Datos incompletos"}), 400

    conn = conectar_db()
    c = conn.cursor()
    c.execute("INSERT INTO ingresos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)", (monto, fecha, categoria, usuario_id))
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Ingreso registrado"})

@app.route('/api/gasto', methods=['POST'])
def agregar_gasto():
    data = request.json
    monto, fecha, categoria, usuario_id = data.get("monto"), data.get("fecha"), data.get("categoria"), data.get("usuario_id")
    if None in (monto, fecha, categoria, usuario_id):
        return jsonify({"error": "Datos incompletos"}), 400

    conn = conectar_db()
    c = conn.cursor()
    c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)", (monto, fecha, categoria, usuario_id))
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Gasto registrado"})

@app.route('/api/datos/<int:usuario_id>')
def obtener_datos(usuario_id):
    conn = conectar_db()
    c = conn.cursor()
    c.execute("SELECT * FROM ingresos WHERE usuario_id = ? ORDER BY fecha ASC", (usuario_id,))
    ingresos = c.fetchall()
    c.execute("SELECT * FROM gastos WHERE usuario_id = ? ORDER BY fecha ASC", (usuario_id,))
    gastos = c.fetchall()
    conn.close()
    return jsonify({
        "ingresos": [{"id": r[0], "monto": r[1], "fecha": r[2], "categoria": r[3]} for r in ingresos],
        "gastos": [{"id": r[0], "monto": r[1], "fecha": r[2], "categoria": r[3]} for r in gastos]
    })

@app.route('/api/ingreso/<int:id>', methods=['PUT', 'DELETE'])
def editar_eliminar_ingreso(id):
    conn = conectar_db()
    c = conn.cursor()
    if request.method == 'PUT':
        data = request.json
        c.execute("UPDATE ingresos SET monto = ?, fecha = ?, categoria = ? WHERE id = ?", (data['monto'], data['fecha'], data['categoria'], id))
    else:
        c.execute("DELETE FROM ingresos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Operación completada"})

@app.route('/api/gasto/<int:id>', methods=['PUT', 'DELETE'])
def editar_eliminar_gasto(id):
    conn = conectar_db()
    c = conn.cursor()
    if request.method == 'PUT':
        data = request.json
        c.execute("UPDATE gastos SET monto = ?, fecha = ?, categoria = ? WHERE id = ?", (data['monto'], data['fecha'], data['categoria'], id))
    else:
        c.execute("DELETE FROM gastos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Operación completada"})

if __name__ == '__main__':
    app.run(debug=True)
