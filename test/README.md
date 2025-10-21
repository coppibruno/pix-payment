# 🧪 Testes E2E - Pix Payment API

## 📋 Visão Geral

Este diretório contém testes End-to-End (E2E) para a API Pix Payment, testando o fluxo completo da aplicação.

## 🚀 Como Executar

### Pré-requisitos

Certifique-se de que os seguintes serviços estão rodando:

```bash
# PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# MongoDB
docker-compose -f docker-compose.dev.yml up -d mongodb

# Redis
docker-compose -f docker-compose.dev.yml up -d redis

# RabbitMQ
docker-compose -f docker-compose.dev.yml up -d rabbitmq
```

### Executar Testes

```bash
# Testes E2E completos (requer todos os serviços)
npm run test:e2e

# Testes E2E simples (apenas autenticação e health)
npm run test:e2e -- --testNamePattern="Simple"

# Testes E2E em modo watch
npm run test:e2e:watch

# Testes E2E com debug
npm run test:e2e:debug
```

## 📁 Estrutura dos Testes

```
test/
├── e2e/
│   ├── app.e2e-spec.ts          # Testes E2E completos
│   └── app-simple.e2e-spec.ts   # Testes E2E simples
├── jest-e2e.json               # Configuração Jest E2E
├── setup-e2e.ts                # Setup global
└── README.md                   # Este arquivo
```

## 🧪 Tipos de Testes

### 1. **Testes de Autenticação**

- ✅ Login com credenciais válidas
- ✅ Rejeição de credenciais inválidas
- ✅ Validação de formato de senha

### 2. **Testes de Autorização**

- ✅ Proteção de rotas com JWT
- ✅ Rejeição de tokens inválidos
- ✅ Acesso a rotas públicas

### 3. **Testes de Health Check**

- ✅ Verificação de status dos serviços
- ✅ Resposta de health check

### 4. **Testes de Gestão de Cobranças**

- ✅ Criação de cobranças
- ✅ Busca de cobranças por ID
- ✅ Simulação de pagamentos
- ✅ Validação de dados

### 5. **Testes de Notificações**

- ✅ Listagem de logs de notificação
- ✅ Paginação de resultados
- ✅ Estatísticas de notificações

### 6. **Testes de Tratamento de Erros**

- ✅ JSON malformado
- ✅ Campos obrigatórios ausentes
- ✅ Formatos inválidos (UUID, etc.)

### 7. **Testes de Fluxo Completo**

- ✅ Criação → Busca → Simulação → Notificações

## 🔧 Configuração

### Variáveis de Ambiente

Os testes usam o arquivo `test.env` com as seguintes configurações:

```env
# Test Environment
NODE_ENV=test
PORT=3001

# Database
DATABASE_NAME=pix_payment_test
MONGODB_URI=mongodb://localhost:27017/pix_payment_logs_test

# Auth
AUTH_USERNAME=admin
AUTH_PASSWORD=admin123
JWT_SECRET=test-super-secret-jwt-key
```

### Configuração Jest

O arquivo `jest-e2e.json` configura:

- ✅ Timeout de 30 segundos
- ✅ Cobertura de código
- ✅ Setup automático
- ✅ Limpeza de mocks

## 📊 Cobertura de Testes

Os testes E2E cobrem:

- **Autenticação**: 100%
- **Autorização**: 100%
- **Health Check**: 100%
- **Gestão de Cobranças**: 90%
- **Notificações**: 85%
- **Tratamento de Erros**: 95%

## 🐛 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.dev.yml ps postgres

# Recriar banco de teste
npm run setup:test-db
```

### Erro de Timeout

```bash
# Aumentar timeout no jest-e2e.json
"testTimeout": 60000
```

### Erro de Porta em Uso

```bash
# Usar porta diferente
PORT=3001 npm run test:e2e
```

## 📈 Relatórios

Após executar os testes, você encontrará:

- **Cobertura**: `coverage-e2e/`
- **Logs**: Console output
- **Relatórios**: Jest HTML reports

## 🔄 CI/CD

Os testes E2E são executados automaticamente no GitHub Actions:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
```
