FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "CI=true pnpm install && npx prisma generate && pnpm dev"]