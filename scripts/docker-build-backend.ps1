$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot
try {
    docker build --platform linux/amd64 -t abidtanoli/cricall-backend:v1 .\Backend
}
finally {
    Pop-Location
}
