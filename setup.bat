@echo off
echo ==========================================
echo   SETUP AUTOMATICO - DASHBOARD FINANCIERO
echo ==========================================

:: Crear entorno virtual si no existe
if not exist "venv\" (
    echo [1/6] Creando entorno virtual...
    python -m venv venv
)

:: Activar entorno virtual
call venv\Scripts\activate

:: Instalar dependencias de Python
echo [2/6] Instalando dependencias de Python...
pip install flask flask-cors werkzeug pandas numpy scikit-learn

:: Generar requirements.txt
echo [3/6] Guardando requirements.txt...
pip freeze > requirements.txt

:: Instalar dependencias de React (npm)
echo [4/6] Instalando dependencias de React (npm)...
cd frontend
if not exist "node_modules\" (
    call npm install
) else (
    echo node_modules ya existe, omitiendo npm install.
)
cd ..

:: Crear script para simular datos
echo [5/6] Generando simular.bat...
echo curl -X POST http://localhost:5000/api/simular > simular.bat

:: Terminado
echo [6/6] ¡Setup completo!

echo ------------------------------------------
echo Puedes iniciar Flask con: venv\Scripts\activate && python app.py
echo Y React con: cd frontend && npm start
echo Para poblar la base de datos, ejecuta: simular.bat
echo ------------------------------------------
pause
