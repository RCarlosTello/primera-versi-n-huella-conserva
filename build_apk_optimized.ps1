$ErrorActionPreference = "Stop"
$source = "C:\Users\ConservaHP\Downloads\Huella_Conserva_Offline\prueba huella conserva"
$dest = "$env:TEMP\huella_build_optimized"

Write-Host "Limpiando directorio destino..."
if (Test-Path $dest) {
    cmd.exe /c "rmdir /s /q `"$dest`""
}
New-Item -ItemType Directory -Force -Path $dest

Write-Host "Copiando archivos del proyecto (excluyendo carpetas pesadas/bloqueadas)..."
# robocopy returns < 8 for successful copies
& robocopy "$source" "$dest" /E /XD node_modules .git .github /XF *.log | Out-Null

Write-Host "Instalando dependencias (npm install)..."
Set-Location $dest
& npm install --no-audit --no-fund --legacy-peer-deps

Write-Host "Copiando carpeta WWW desde fuente directa (debido a nuevo empaquetado)..."
if (Test-Path "$dest\www") { cmd.exe /c "rmdir /s /q `"$dest\www`"" }
New-Item -ItemType Directory -Force -Path "$dest\www" | Out-Null
Copy-Item "$source\www\*" -Destination "$dest\www" -Recurse -Force

Write-Host "Sincronizando Capacitor..."
& npx cap sync android

Write-Host "Compilando APK optimizado en Android..."
Set-Location "$dest\android"
# Iniciar compilación de Gradle en modo Release
& .\gradlew assembleRelease

Write-Host "Copiando APK optimizado de regreso..."
$apkPath = "$dest\android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath -Destination "$source\huellaconserva1.apk" -Force
    Write-Host "¡APK optimizado compilado y copiado a tu carpeta principal como huellaconserva1.apk!"
}
else {
    Write-Host "Error: No se encontró el APK generado en la ruta esperada."
}
