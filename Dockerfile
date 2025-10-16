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

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar dependências (incluindo Prisma CLI)
RUN pnpm install --frozen-lockfile

# Copiar arquivos necessários do builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=512

# Gerar cliente Prisma na imagem de produção
RUN pnpm prisma generate

# Remover dependências de desenvolvimento após gerar Prisma
RUN pnpm prune --prod

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]

