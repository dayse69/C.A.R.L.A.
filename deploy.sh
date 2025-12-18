#!/bin/bash

echo "🔄 Atualizando CARLA..."

git pull || { echo "❌ Erro no git pull"; exit 1; }

echo "📦 Instalando dependências..."
npm install || { echo "❌ Erro no npm install"; exit 1; }

echo "🏗️ Buildando projeto..."
npm run build || { echo "❌ Erro no build"; exit 1; }

echo "♻️ Reiniciando CARLA (PM2)..."
pm2 restart CARLA || pm2 start build/discord/index.js --name CARLA --node-args="-r dotenv/config"

echo "✅ CARLA atualizada e rodando!"
