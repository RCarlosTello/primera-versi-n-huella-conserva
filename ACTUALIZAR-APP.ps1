# HUELLA CONSERVA - Script de actualizacion automatica
# Ejecutar desde PowerShell: & "ruta\ACTUALIZAR-APP.ps1"

$PROJECT     = "C:\hc-build-local\version2app"
$FUENTE      = "C:\hc-build-local\huella-mejorado"
$PROYECTO_CF = "huella-v1"

Clear-Host
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   HUELLA CONSERVA - Actualizacion App     " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Verificar carpeta del proyecto
Write-Host "[1/4] Verificando carpetas..." -ForegroundColor Yellow

if (-not (Test-Path $PROJECT)) {
    Write-Host "  ERROR: No se encontro la carpeta: $PROJECT" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "  OK: Carpeta del proyecto encontrada" -ForegroundColor Green

# PASO 2: Copiar archivos si existe la carpeta fuente
if (Test-Path $FUENTE) {
    Write-Host ""
    Write-Host "[2/4] Copiando archivos actualizados..." -ForegroundColor Yellow
    Copy-Item -Path "$FUENTE\*" -Destination $PROJECT -Recurse -Force
    Write-Host "  OK: Archivos copiados" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/4] Usando archivos existentes en $PROJECT" -ForegroundColor Yellow
}

# PASO 3: Compilar
Write-Host ""
Write-Host "[3/4] Compilando la app..." -ForegroundColor Yellow

Set-Location $PROJECT
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ERROR: Fallo la compilacion." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "  OK: Compilacion exitosa" -ForegroundColor Green

# PASO 4: Subir a Cloudflare
Write-Host ""
Write-Host "[4/4] Subiendo a Cloudflare Pages..." -ForegroundColor Yellow

npx wrangler pages deploy dist --project-name=$PROYECTO_CF --commit-dirty=true

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ERROR: Fallo al subir a Cloudflare." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   App actualizada exitosamente            " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL: https://huella-v1.pages.dev" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para cerrar"
