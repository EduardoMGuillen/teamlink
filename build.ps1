# Script para build con scope limitado
$env:EAS_NO_VCS = "1"
$env:EAS_BUILD_WORKINGDIR = $PWD

# Cambiar al directorio del proyecto
Set-Location $PSScriptRoot

# Ejecutar build
eas build --profile development --platform ios

