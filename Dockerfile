FROM node:20.12-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./
COPY constants.json ./

# Instalar dependências
RUN npm ci --only=production && npm ci --only=development

# Copiar código fonte
COPY src ./src

# Build do TypeScript
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm ci --only=production

# Expor porta (se necessário para o bot)
EXPOSE 3000

# Comando para iniciar o bot
CMD ["npm", "start"]
