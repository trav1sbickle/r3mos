# Paso 1: Agregar Categorías y Actualizar DB y Endpoints
# Paso 2: Autenticación de Usuarios
# Paso 3: Edición y Eliminación Individual
# Paso 4: UI Moderna y Responsiva (sólo base)
# Paso 5: Simulación de datos históricos para ML

# -----------------------------
# BACKEND: Flask (app.py)
# -----------------------------

# --- IMPORTS ACTUALIZADOS ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import random
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

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

# --- SIMULACIÓN DE DATOS ---
@app.route('/api/simular', methods=['POST'])
def simular_datos():
    usuario_id = 1
    conn = conectar_db()
    c = conn.cursor()

    start_date = datetime(2023, 6, 1)
    for month in range(12):
        current_month = start_date + timedelta(days=month * 30)
        fecha_str = current_month.strftime('%Y-%m-%d')

        # Ingreso fijo mensual
        c.execute("INSERT INTO ingresos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                  (1200000, fecha_str, 'Salario', usuario_id))

        # Gasto fijo: Alquiler
        alquiler_date = current_month.replace(day=2).strftime('%Y-%m-%d')
        c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                  (320000, alquiler_date, 'Alquiler', usuario_id))

        # Gasto: Comida (5 fechas/mes)
        for i in range(5):
            dia = random.randint(3, 28)
            monto = random.randint(40000, 60000)
            fecha = current_month.replace(day=dia).strftime('%Y-%m-%d')
            c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                      (monto, fecha, 'Comida', usuario_id))

        # Gasto: Transporte (4 fechas/mes)
        for i in range(4):
            dia = random.randint(1, 28)
            monto = random.randint(15000, 25000)
            fecha = current_month.replace(day=dia).strftime('%Y-%m-%d')
            c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                      (monto, fecha, 'Transporte', usuario_id))

        # Gasto: Ocio (2 fechas/mes)
        for i in range(2):
            dia = random.randint(10, 27)
            monto = random.randint(30000, 60000)
            fecha = current_month.replace(day=dia).strftime('%Y-%m-%d')
            c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                      (monto, fecha, 'Ocio', usuario_id))

        # Gasto: Otros (1-2 fechas/mes)
        for i in range(random.randint(1, 2)):
            dia = random.randint(5, 26)
            monto = random.randint(15000, 35000)
            fecha = current_month.replace(day=dia).strftime('%Y-%m-%d')
            c.execute("INSERT INTO gastos (monto, fecha, categoria, usuario_id) VALUES (?, ?, ?, ?)",
                      (monto, fecha, 'Otros', usuario_id))

    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Datos simulados insertados correctamente"})

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

def cargar_gastos_por_mes(usuario_id=1):
    conn = sqlite3.connect("finanzas.db")
    df = pd.read_sql_query("""
        SELECT fecha, monto FROM gastos WHERE usuario_id = ?
    """, conn, params=(usuario_id,))
    conn.close()

    df['fecha'] = pd.to_datetime(df['fecha'])
    df['mes'] = df['fecha'].dt.to_period('M')

    resumen = df.groupby('mes').sum(numeric_only=True).reset_index()
    resumen['mes'] = resumen['mes'].dt.to_timestamp()

    return resumen

def entrenar_modelo(gastos_por_mes):
    if len(gastos_por_mes) < 2:
        raise ValueError("Se necesitan al menos 2 meses para entrenar el modelo")

    gastos_por_mes = gastos_por_mes.sort_values('mes')
    gastos_por_mes['mes_num'] = np.arange(len(gastos_por_mes))

    X = gastos_por_mes[['mes_num']]
    y = gastos_por_mes['monto']

    modelo = LinearRegression()
    modelo.fit(X, y)

    siguiente_mes = [[len(gastos_por_mes)]]  # El próximo mes en secuencia
    prediccion = modelo.predict(siguiente_mes)[0]

    return prediccion, modelo
# --- PREDICCIÓN DE GASTOS ---
@app.route('/api/prediccion/<int:usuario_id>')
def obtener_prediccion(usuario_id):
    try:
        df_gastos = cargar_gastos_por_mes(usuario_id)
        if len(df_gastos) < 2:
            return jsonify({
                "error": "Se necesitan al menos 2 meses de datos",
                "status": "error"
            }), 400
            
        pred, _ = entrenar_modelo(df_gastos)
        
        # Asegurarse de que la predicción es un número float
        prediccion = float(pred)
        
        return jsonify({
            "prediccion": prediccion,
            "status": "success",
            "meses_analizados": len(df_gastos)
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500



if __name__ == '__main__':
    app.run(debug=True)
