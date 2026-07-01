param(
    [string]$ApiUrl = "http://localhost:5000/api",
    [string]$SocketUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot
try {
    docker build `
        --platform linux/amd64 `
        --build-arg "VITE_API_URL=$ApiUrl" `
        --build-arg "VITE_SOCKET_URL=$SocketUrl" `
        -f .\Frontend\Admin\Dockerfile `
        -t abidtanoli/cricall-admin-frontend:v1 `
        .\Frontend
}
finally {
    Pop-Location
}
