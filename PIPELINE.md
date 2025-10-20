# 🚀 Pipeline de Testes - GitHub Actions

## 📋 O que a Pipeline Faz

A pipeline executa automaticamente quando há commits na branch `master` ou `main` e:

1. **Instala dependências** com `npm ci`
2. **Executa linting** com `npm run lint`
3. **Roda testes unitários** com `npm run test`
4. **Roda testes e2e** com `npm run test:e2e`
5. **Gera coverage** com `npm run test:cov`

## 🛠️ Serviços Utilizados

A pipeline utiliza os seguintes serviços:

- **PostgreSQL** - Banco de dados principal
- **MongoDB** - Banco de dados para logs
- **Redis** - Cache
- **RabbitMQ** - Mensageria

## 📁 Arquivo da Pipeline

A pipeline está configurada em `.github/workflows/test.yml`

## 🚀 Como Funciona

### 1. Trigger

- Push para `master` ou `main`
- Pull Request para `master` ou `main`

### 2. Ambiente

- Ubuntu Latest
- Node.js 18
- Serviços Docker (PostgreSQL, MongoDB, Redis, RabbitMQ)

### 3. Passos

1. Checkout do código
2. Setup do Node.js
3. Instalação de dependências
4. Linting
5. Testes unitários
6. Testes e2e
7. Coverage

## 📊 Resultados

- ✅ **Sucesso**: Todos os testes passaram
- ❌ **Falha**: Algum teste falhou ou linting encontrou problemas

## 🔧 Configuração Local

Para rodar os mesmos testes localmente:

```bash
# Instalar dependências
npm install

# Rodar linting
npm run lint

# Rodar testes unitários
npm run test

# Rodar testes e2e
npm run test:e2e

# Gerar coverage
npm run test:cov
```

## 📈 Coverage

A pipeline gera relatório de coverage que pode ser visualizado nos artifacts do GitHub Actions.

## 🎯 Objetivo

Garantir que todo código commitado na branch principal:

- Passa em todos os testes
- Segue as regras de linting
- Mantém boa cobertura de testes
- Funciona corretamente com todos os serviços
