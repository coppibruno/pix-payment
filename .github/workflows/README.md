# GitHub Actions CI/CD Pipelines

Este diretório contém as configurações de pipeline do GitHub Actions para o projeto PIX Payment.

## 📋 Pipelines Disponíveis

### 1. CI Pipeline (`ci.yml`)

**Arquivo principal de integração contínua**

- **Triggers**: Push e Pull Requests para branches `main` e `develop`
- **Jobs**:
  - `build`: Compila o projeto para verificar se não há erros de build
  - `lint-and-format`: Verifica formatação (Prettier) e regras de lint (ESLint)
  - `test`: Executa testes unitários e e2e com serviços de banco de dados

**Serviços utilizados nos testes**:

- PostgreSQL 15
- Redis 7
- MongoDB 6
- RabbitMQ 3

## 🔧 Configurações

### Cache

- **Node.js**: Cache automático de dependências npm
- **Dependências**: Cache baseado no `package-lock.json`

### Variáveis de Ambiente

Todas as pipelines utilizam variáveis de ambiente padronizadas para testes:

```yaml
DATABASE_HOST: localhost
DATABASE_PORT: 5432
DATABASE_USERNAME: postgres
DATABASE_PASSWORD: postgres
DATABASE_NAME: pix_payment_test
MONGODB_URI: mongodb://root:password@localhost:27017/pix_payment_test
REDIS_HOST: localhost
REDIS_PORT: 6379
RABBITMQ_URL: amqp://admin:admin@localhost:5672
JWT_SECRET: test-secret-key
NODE_ENV: test
```

### Health Checks

Todos os serviços incluem health checks para garantir que estejam prontos antes dos testes:

- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`
- **MongoDB**: `mongosh --eval 'db.runCommand("ping").ok'`
- **RabbitMQ**: `rabbitmq-diagnostics -q ping`

## 📊 Relatórios

### Cobertura de Código

- **Geração**: `npm run test:cov`
- **Upload**: Automático para Codecov
- **Arquivo**: `./coverage/lcov.info`

### Badges

Badges de status são exibidos no README principal:

- Status da pipeline
- Cobertura de código
- Licença do projeto

## 🚀 Como Usar

### Execução Local

Para testar localmente os mesmos comandos da pipeline:

```bash
# Instalar dependências
npm ci

# Verificar formatação
npm run format -- --check

# Executar lint
npm run lint

# Executar testes
npm run test

# Executar testes e2e
npm run test:e2e

# Gerar relatório de cobertura
npm run test:cov
```

### Debugging

Para debugar problemas na pipeline:

1. Verifique os logs no GitHub Actions
2. Execute os comandos localmente com as mesmas variáveis de ambiente
3. Verifique se todos os serviços estão rodando corretamente

## 🔄 Workflow de Dependências

```
build ──┐
        ├── test
lint ───┘
```

- `build` e `lint-and-format` executam em paralelo
- `test` só executa após `build` e `lint-and-format` completarem com sucesso

## 📝 Manutenção

### Adicionando Novos Testes

1. Adicione os testes no código
2. A pipeline executará automaticamente
3. Verifique se as variáveis de ambiente estão corretas

### Modificando Serviços

1. Atualize as versões das imagens Docker
2. Ajuste as variáveis de ambiente se necessário
3. Teste localmente antes de fazer commit

### Adicionando Novos Jobs

1. Crie um novo job no arquivo `ci.yml`
2. Configure as dependências com `needs:`
3. Adicione os steps necessários

## 🐛 Troubleshooting

### Problemas Comuns

**Falha no Health Check**:

- Verifique se as portas estão corretas
- Confirme se as credenciais estão corretas
- Aumente o timeout se necessário

**Falha nos Testes**:

- Verifique se as variáveis de ambiente estão corretas
- Confirme se todos os serviços estão rodando
- Execute os testes localmente primeiro

**Falha no Build**:

- Verifique se não há erros de TypeScript
- Confirme se todas as dependências estão instaladas
- Execute `npm run build` localmente
