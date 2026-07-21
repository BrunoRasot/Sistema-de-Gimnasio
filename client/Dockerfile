FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copiamos los archivos
COPY . .

EXPOSE 5173

# Instalamos las dependencias específicas de Linux justo al arrancar y luego levantamos Vite
CMD ["sh", "-c", "CI=true pnpm install && pnpm dev"]