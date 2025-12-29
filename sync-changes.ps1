# Script para sincronizar cambios desde la ruta de trabajo a la ruta de build
param(
    [string]$SourcePath = "C:\Users\Eduar\OneDrive\Documents\Cursor\TeamLink",
    [string]$DestPath = "C:\TeamLink"
)

Write-Host "Sincronizando desde: $SourcePath" -ForegroundColor Cyan
Write-Host "Hacia: $DestPath" -ForegroundColor Cyan
Write-Host ""

# Archivos de configuración críticos
$configFiles = @(
    "app.json",
    "package.json",
    "eas.json",
    ".npmrc"
)

# Archivos de código fuente principales
$sourceFiles = @(
    "App.js",
    "index.js",
    "babel.config.js",
    "metro.config.js"
)

# Sincronizar archivos de configuración
foreach ($file in $configFiles) {
    $source = Join-Path $SourcePath $file
    $dest = Join-Path $DestPath $file
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "✓ $file" -ForegroundColor Green
    }
}

# Sincronizar archivos de código
foreach ($file in $sourceFiles) {
    $source = Join-Path $SourcePath $file
    $dest = Join-Path $DestPath $file
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "✓ $file" -ForegroundColor Green
    }
}

# Sincronizar carpeta src completa
$srcSource = Join-Path $SourcePath "src"
$srcDest = Join-Path $DestPath "src"

if (Test-Path $srcSource) {
    if (Test-Path $srcDest) {
        Remove-Item -Path $srcDest -Recurse -Force
    }
    Copy-Item -Path $srcSource -Destination $srcDest -Recurse -Force
    Write-Host "✓ src/ (carpeta completa)" -ForegroundColor Green
}

Write-Host "`nSincronizacion completada!" -ForegroundColor Cyan

