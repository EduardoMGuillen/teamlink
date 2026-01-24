# Script para aplicar cambios en ambas rutas
$oldPath = "C:\Users\Eduar\OneDrive\Documents\Cursor\TeamLink"
$newPath = "C:\TeamLink"

# Lista de archivos que necesitan sincronizarse
$filesToSync = @(
    "app.json",
    "app.config.js",
    "package.json",
    "eas.json",
    "App.js",
    "index.js",
    "babel.config.js",
    "metro.config.js",
    ".npmrc"
)

Write-Host "Sincronizando archivos entre rutas..." -ForegroundColor Cyan

foreach ($file in $filesToSync) {
    $sourceFile = Join-Path $oldPath $file
    $destFile = Join-Path $newPath $file
    
    if (Test-Path $sourceFile) {
        Copy-Item -Path $sourceFile -Destination $destFile -Force
        Write-Host "✓ Sincronizado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠ No encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nSincronización completada!" -ForegroundColor Cyan

