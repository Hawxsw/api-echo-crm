FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

