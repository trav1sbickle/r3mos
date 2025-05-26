# modelo_gastos.py

import sqlite3
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LinearRegression
import numpy as np

DB_PATH = 'finanzas.db'


def cargar_gastos_por_mes(usuario_id=1):
    conn = sqlite3.connect(DB_PATH)
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


if __name__ == '__main__':
    usuario_id = 1
    df_gastos = cargar_gastos_por_mes(usuario_id)
    print("Gastos mensuales:\n", df_gastos)
    
    pred, _ = entrenar_modelo(df_gastos)
    print(f"\n🧠 Predicción de gastos para el mes siguiente: ${pred:,.2f} ARS")
