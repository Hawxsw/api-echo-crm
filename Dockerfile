# Multi-stage build para otimização
FROM node:20-alpine AS base

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Stage de build
FROM base AS builder

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN pnpm prisma generate

# Build da aplicação
RUN pnpm run build

# Stage de produção
FROM node:20-alpine AS production

# Instalar pnpm e netcat
RUN npm install -g pnpm && apk add --no-cache netcat-openbsd

WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar dependências de produção + Prisma CLI
RUN pnpm install --prod --frozen-lockfile
RUN pnpm add prisma

# Copiar arquivos necessários do builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8000
ENV NODE_OPTIONS=--max-old-space-size=512

# Gerar cliente Prisma na imagem de produção
RUN pnpm prisma generate

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expor porta
EXPOSE 8000

# Health check básico - apenas verifica se a porta está aberta
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD nc -z 0.0.0.0 8000 || exit 1

# Comando de inicialização com debug detalhado
CMD ["sh", "-c", "echo 'Starting migrations...' && pnpm prisma migrate deploy && echo 'Migrations completed!' && echo 'Starting app with debug...' && node --trace-warnings dist/main"]

