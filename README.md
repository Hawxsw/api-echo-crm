# 🚀 Echo CRM - Sistema CRM Completo

Sistema CRM moderno e completo desenvolvido com NestJS, Prisma, PostgreSQL e WebSocket. Ideal para portfolio de desenvolvedor full-stack.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Testes](#testes)
- [API Documentation](#api-documentation)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)

## 🎯 Sobre o Projeto

Echo CRM é um sistema completo de gerenciamento de relacionamento com clientes (CRM) desenvolvido como projeto de portfolio. O sistema demonstra práticas modernas de desenvolvimento, arquitetura limpa, e implementação de funcionalidades complexas como chat em tempo real e kanban customizável.

### Características Principais

- ✅ **Autenticação e Autorização**: JWT + RBAC (Admin, Manager, Employee)
- ✅ **Gestão de Empresas**: Multi-tenancy com empresas e departamentos
- ✅ **Chat em Tempo Real**: WebSocket com Socket.io
- ✅ **WhatsApp Mockado**: Sistema de mensagens com respostas automáticas
- ✅ **Kanban Customizável**: Gestão de tarefas drag-and-drop
- ✅ **Documentação Automática**: Swagger/OpenAPI
- ✅ **Testes Completos**: Unitários e E2E
- ✅ **CI/CD**: GitHub Actions
- ✅ **Docker**: Containerização completa

## 🎨 Funcionalidades

### 1. Autenticação e Usuários

- Login e registro com JWT
- Refresh tokens
- Gestão de usuários (CRUD)
- Controle de acesso baseado em roles (ADMIN, MANAGER, EMPLOYEE)
- Perfil de usuário
- Status de usuários (ACTIVE, INACTIVE, SUSPENDED)

### 2. Empresas e Estrutura Organizacional

- Criação e gestão de empresas
- Departamentos customizáveis
- Associação de usuários a departamentos
- Métricas e estatísticas

### 3. Chat em Tempo Real

- Chat individual entre funcionários
- Grupos de chat
- Indicador de "digitando..."
- Marcação de mensagens como lidas
- Edição e exclusão de mensagens
- Histórico completo de conversas

### 4. WhatsApp (Mockado)

- Interface de mensagens semelhante ao WhatsApp
- Respostas automáticas para demonstração
- Atribuição de conversas a funcionários
- Status de mensagens (SENT, DELIVERED, READ)
- Gestão de conversas

### 5. Kanban

- Boards customizáveis por empresa
- Colunas personalizáveis com cores
- Cards com drag-and-drop
- Prioridades (LOW, MEDIUM, HIGH, URGENT)
- Atribuição de responsáveis
- Comentários em cards
- Anexos em cards
- Histórico de atividades
- Tags customizáveis
- Datas de vencimento

## 🛠️ Tecnologias

### Backend

- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma** - ORM moderno para TypeScript e Node.js
- **PostgreSQL** - Banco de dados relacional
- **Socket.io** - Biblioteca para WebSocket
- **Passport** - Middleware de autenticação
- **JWT** - JSON Web Tokens para autenticação
- **Zod** - Validação de schemas TypeScript-first
- **Bcrypt** - Hash de senhas

### Testes

- **Jest** - Framework de testes
- **Supertest** - Testes HTTP end-to-end

### DevOps

- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **GitHub Actions** - CI/CD

### Documentação

- **Swagger/OpenAPI** - Documentação interativa da API

## 🏗️ Arquitetura

O projeto segue os princípios SOLID e Clean Architecture:

```
src/
├── auth/                 # Módulo de autenticação
│   ├── decorators/      # Decorators customizados
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Guards de autenticação
│   ├── strategies/      # Estratégias Passport
│   └── tests/           # Testes unitários
├── common/              # Código compartilhado
│   ├── decorators/      # Decorators globais
│   ├── dto/             # DTOs globais
│   ├── filters/         # Exception filters
│   ├── guards/          # Guards globais
│   └── interceptors/    # Interceptors
├── prisma/              # Módulo Prisma
├── users/               # Módulo de usuários
├── company/             # Módulo de empresas
├── chat/                # Módulo de chat
│   └── chat.gateway.ts  # WebSocket gateway
├── whatsapp/            # Módulo WhatsApp
└── kanban/              # Módulo Kanban
```

### Padrões Utilizados

- **Repository Pattern**: Separação de lógica de negócio e acesso a dados
- **Dependency Injection**: Injeção de dependências nativa do NestJS
- **DTO Pattern**: Validação e transformação de dados
- **Guard Pattern**: Proteção de rotas
- **Interceptor Pattern**: Transformação de respostas

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Git

### Passos

1. **Clone o repositório**

```bash
git clone https://github.com/Hawxsw/echo-crm.git
cd echo-crm/api-echo-crm
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/echo_crm"

# JWT
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

## ⚙️ Configuração

### 1. Iniciar o PostgreSQL com Docker

```bash
docker-compose up -d postgres
```

### 2. Executar as migrations do Prisma

```bash
npm run prisma:migrate
```

### 3. Gerar o Prisma Client

```bash
npm run prisma:generate
```

### 4. (Opcional) Popular o banco com dados de exemplo

```bash
npm run prisma:seed
```

Isso criará:
- 1 empresa de demonstração
- 3 departamentos
- 4 usuários (admin, manager, 2 employees)
- 1 board kanban com cards
- Conversas de WhatsApp
- Chats em grupo

**Credenciais de teste:**
- Admin: `admin@echotech.com` / `senha123`
- Manager: `manager@echotech.com` / `senha123`
- Employee: `maria@echotech.com` / `senha123`
- Employee: `pedro@echotech.com` / `senha123`

## 🚀 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3000`

### Modo Produção

```bash
npm run build
npm run start:prod
```

### Com Docker

```bash
docker-compose up
```

## 🧪 Testes

### Testes Unitários

```bash
npm run test
```

### Testes E2E

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

### Watch Mode

```bash
npm run test:watch
```

## 📚 API Documentation

Após iniciar o servidor, acesse a documentação interativa do Swagger:

```
http://localhost:3000/api/docs
```

### Principais Endpoints

#### Autenticação

- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Obter perfil

#### Usuários

- `GET /api/v1/users` - Listar usuários
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/:id` - Buscar usuário
- `PATCH /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Remover usuário

#### Empresas

- `GET /api/v1/company` - Listar empresas
- `POST /api/v1/company` - Criar empresa
- `GET /api/v1/company/:id` - Buscar empresa
- `PATCH /api/v1/company/:id` - Atualizar empresa
- `POST /api/v1/company/:id/departments` - Criar departamento

#### Chat

- `GET /api/v1/chat` - Listar chats
- `POST /api/v1/chat` - Criar chat
- `POST /api/v1/chat/messages` - Enviar mensagem
- `GET /api/v1/chat/:id/messages` - Listar mensagens

**WebSocket Events:**
- `joinChat` - Entrar em uma sala de chat
- `sendMessage` - Enviar mensagem
- `typing` - Indicador de digitando
- `markAsRead` - Marcar como lido

#### WhatsApp

- `GET /api/v1/whatsapp/conversations` - Listar conversas
- `POST /api/v1/whatsapp/conversations` - Criar conversa
- `POST /api/v1/whatsapp/messages` - Enviar mensagem
- `GET /api/v1/whatsapp/conversations/:id/messages` - Listar mensagens

#### Kanban

- `GET /api/v1/kanban/boards` - Listar boards
- `POST /api/v1/kanban/boards` - Criar board
- `POST /api/v1/kanban/boards/:id/columns` - Criar coluna
- `POST /api/v1/kanban/columns/:id/cards` - Criar card
- `PATCH /api/v1/kanban/cards/:id/move` - Mover card
- `POST /api/v1/kanban/cards/:id/comments` - Adicionar comentário

## 📁 Estrutura do Projeto

```
api-echo-crm/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── seed.ts              # Seed de dados
├── src/
│   ├── auth/                # Autenticação
│   ├── common/              # Código compartilhado
│   ├── company/             # Empresas e departamentos
│   ├── chat/                # Chat em tempo real
│   ├── whatsapp/            # WhatsApp mockado
│   ├── kanban/              # Sistema Kanban
│   ├── prisma/              # Módulo Prisma
│   ├── users/               # Gestão de usuários
│   ├── app.module.ts        # Módulo principal
│   └── main.ts              # Arquivo de entrada
├── test/                    # Testes E2E
├── docker-compose.yml       # Configuração Docker
├── Dockerfile               # Dockerfile para produção
├── package.json             # Dependências
└── README.md                # Este arquivo
```

## 🚢 Deploy

### Heroku

1. **Prepare a aplicação**

```bash
heroku create echo-crm-api
heroku addons:create heroku-postgresql:hobby-dev
```

2. **Configure as variáveis de ambiente**

```bash
heroku config:set JWT_SECRET="seu-secret"
heroku config:set NODE_ENV="production"
```

3. **Deploy**

```bash
git push heroku main
```

4. **Execute as migrations**

```bash
heroku run npm run prisma:migrate
```

### Render

1. Crie um novo Web Service no Render
2. Conecte seu repositório
3. Configure as variáveis de ambiente
4. Adicione PostgreSQL no Render
5. Deploy automático via Git

### Docker

```bash
docker build -t echo-crm-api .
docker run -p 3000:3000 echo-crm-api
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT com expiração configurável
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Validação de inputs com Zod
- ✅ CORS configurável
- ✅ Rate limiting (recomendado adicionar)
- ✅ Helmet para headers de segurança (recomendado adicionar)

## 🤝 Contribuindo

Contribuições são bem-vindas! Este é um projeto de portfolio, mas sugestões e melhorias são sempre apreciadas.

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença UNLICENSED - veja o arquivo LICENSE para detalhes.

## 👤 Autor

Hawxsw
- GitHub: [@Hawxsw](https://github.com/Hawxsw)

## 🙏 Agradecimentos

- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
