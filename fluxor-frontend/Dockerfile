# Etapa 1: Build da aplicação Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências com legacy peer deps
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação em modo produção
RUN npm run build

# Etapa 2: Servir com Node.js (para Railway)
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos buildados
COPY --from=build /app/dist/fluxor-atendimento/browser ./dist

# Copiar server e dependências
COPY --from=build /app/server.js ./
COPY --from=build /app/package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Railway usa porta dinâmica via $PORT
EXPOSE 4200

# Comando de inicialização
CMD ["node", "server.js"]
