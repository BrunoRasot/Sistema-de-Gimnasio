FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "CI=true pnpm install && pnpm dev"]