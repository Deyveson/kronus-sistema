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

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist/fluxor-atendimento/browser /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
