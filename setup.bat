@echo off
echo === WarmTracker Setup ===
echo.

cd /d "%~dp0"

echo [1/4] Instalando dependencias...
call npm install
if errorlevel 1 (
  echo ERRO: npm install falhou
  pause
  exit /b 1
)

echo [2/4] Gerando cliente Prisma...
call npx prisma generate
if errorlevel 1 (
  echo ERRO: prisma generate falhou
  pause
  exit /b 1
)

echo [3/4] Criando banco de dados...
call npx prisma db push
if errorlevel 1 (
  echo ERRO: prisma db push falhou
  pause
  exit /b 1
)

echo [4/4] Tudo pronto!
echo.
echo Para iniciar: npm run dev
echo Acesse: http://localhost:3000
echo.
pause
