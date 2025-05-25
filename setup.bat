@echo off
echo ==========================================
echo   SETUP AUTOMATICO - DASHBOARD FINANCIERO
echo ==========================================

:: Crear entorno virtual si no existe
if not exist "venv\" (
    echo [1/5] Creando entorno virtual...
    python -m venv venv
)

:: Activar entorno virtual
call venv\Scripts\activate

:: Instalar dependencias de Python
echo [2/5] Instalando dependencias de Python...
pip install flask flask-cors werkzeug

:: Generar requirements.txt
echo [3/5] Guardando requirements.txt...
pip freeze > requirements.txt

:: Instalar dependencias frontend
echo [4/5] Instalando dependencias de React (npm)...
cd frontend
if not exist "node_modules\" (
    call npm install
) else (
    echo node_modules ya existe, omitiendo npm install.
)
cd ..

:: Terminado
echo [5/5] ¡Setup completo!

echo ------------------------------------------
echo Puedes iniciar Flask con: venv\Scripts\activate && python app.py
echo Y React con: cd frontend && npm start
echo ------------------------------------------
pause
