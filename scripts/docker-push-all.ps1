$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

docker push abidtanoli/cricall-backend:v1
docker push abidtanoli/cricall-user-frontend:v1
docker push abidtanoli/cricall-admin-frontend:v1
