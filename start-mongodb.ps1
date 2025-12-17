# Script para iniciar MongoDB SEM autenticação (desenvolvimento)
# Execute com: .\start-mongodb.ps1

Write-Host "🔄 Parando MongoDB atual..." -ForegroundColor Yellow
Stop-Service MongoDB -ErrorAction SilentlyContinue
Stop-Process -Name mongod -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🚀 Iniciando MongoDB sem autenticação..." -ForegroundColor Green

# Criar diretório de dados se não existir
if (-not (Test-Path "C:\data\db")) {
    New-Item -Path "C:\data\db" -ItemType Directory -Force
    Write-Host "✅ Diretório C:\data\db criado" -ForegroundColor Green
}

# Iniciar MongoDB sem autenticação
$mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"

if (Test-Path $mongoPath) {
    Write-Host "✅ MongoDB encontrado em: $mongoPath" -ForegroundColor Green
    Write-Host "⚠️  Pressione Ctrl+C para parar o MongoDB" -ForegroundColor Yellow
    Write-Host ""
    & $mongoPath --dbpath "C:\data\db" --noauth --bind_ip 127.0.0.1
} else {
    Write-Host "❌ MongoDB não encontrado em: $mongoPath" -ForegroundColor Red
    Write-Host "Verifique o caminho da instalação" -ForegroundColor Yellow
}
