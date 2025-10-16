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

# Instalar dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Adicionar Prisma CLI para migrations e generate
RUN pnpm add -D prisma

# Copiar arquivos necessários do builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8000

# Gerar cliente Prisma na imagem de produção
RUN pnpm prisma generate

# Expor porta
EXPOSE 8000

# Comando de inicialização: iniciar app diretamente (evita bloquear healthcheck)
CMD ["node", "dist/main"]

