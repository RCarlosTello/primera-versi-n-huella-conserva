$ErrorActionPreference = "Stop"
$source = "g:\Mi unidad\Conserva\prueba huella conserva"
$dest = "$env:TEMP\huella_build"

Write-Host "Limpiando directorio destino..."
if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
}
New-Item -ItemType Directory -Force -Path $dest

Write-Host "Copiando archivos del proyecto (excluyendo carpetas pesadas/bloqueadas)..."
# robocopy returns < 8 for successful copies
& robocopy "$source" "$dest" /E /XD node_modules .git .github /XF *.log | Out-Null

Write-Host "Instalando dependencias (npm install)..."
Set-Location $dest
& npm install --no-audit --no-fund --legacy-peer-deps

Write-Host "Sincronizando Capacitor..."
& npx cap sync android

Write-Host "Compilando APK en Android..."
Set-Location "$dest\android"
# Iniciar compilación de Gradle
& .\gradlew assembleDebug

Write-Host "Copiando APK de regreso..."
$apkPath = "$dest\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath -Destination "$source\app-debug.apk" -Force
    Write-Host "¡APK compilado y copiado a tu carpeta principal como app-debug.apk!"
}
else {
    Write-Host "Error: No se encontro el APK generado."
}
