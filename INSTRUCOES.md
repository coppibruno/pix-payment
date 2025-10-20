# 📋 Instruções de Uso - Gateway Pix

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd pix-payment

# Execute o script de setup automático
./scripts/setup.sh
```

### 2. Execução Manual (Alternativa)

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Inicie os serviços de banco de dados
docker-compose -f docker-compose.dev.yml up -d

# Aguarde os serviços ficarem prontos (10-15 segundos)
sleep 15

# Inicialize o banco de dados
docker exec -i pix_payment_postgres_dev psql -U postgres -d pix_payment < scripts/init-database.sql

# Execute a aplicação
npm run start:dev
```

## 🧪 Testando a API

### 1. Criar uma Cobrança

```bash
curl -X POST http://localhost:3000/charges \
  -H "Content-Type: application/json" \
  -d '{
    "payer_name": "João Silva",
    "payer_document": "12345678901",
    "amount": 10000,
    "description": "Pagamento de serviços"
  }'
```

### 2. Consultar Cobrança

```bash
curl http://localhost:3000/charges/{charge_id}
```

### 3. Simular Pagamento

```bash
curl -X POST http://localhost:3000/charges/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "charge_id": "uuid-da-cobranca"
  }'
```

### 4. Verificar Status dos Serviços

```bash
curl http://localhost:3000/health
```

## 📊 Monitoramento

### Serviços Disponíveis

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Logs

```bash
# Ver logs da aplicação
docker logs pix_payment_app

# Ver logs do PostgreSQL
docker logs pix_payment_postgres_dev

# Ver logs do MongoDB
docker logs pix_payment_mongodb_dev

# Ver logs do Redis
docker logs pix_payment_redis_dev

# Ver logs do RabbitMQ
docker logs pix_payment_rabbitmq_dev
```

## 🧪 Executando Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e

# Todos os testes
npm run test && npm run test:e2e
```

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── modules/
│   ├── charges/           # Módulo de cobranças
│   └── notifications/     # Módulo de notificações
├── database/
│   ├── entities/          # Entidades PostgreSQL
│   └── schemas/           # Schemas MongoDB
├── workers/               # Workers de processamento
├── common/                # Utilitários comuns
└── config/                # Configurações
```

### Comandos Úteis

```bash
# Desenvolvimento com hot reload
npm run start:dev

# Build para produção
npm run build

# Executar em produção
npm run start:prod

# Linting
npm run lint

# Formatação de código
npm run format
```

## 🐳 Docker

### Desenvolvimento

```bash
# Iniciar apenas os bancos de dados
docker-compose -f docker-compose.dev.yml up -d

# Parar os serviços
docker-compose -f docker-compose.dev.yml down
```

### Produção

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se os containers estão rodando: `docker ps`
   - Aguarde alguns segundos para os serviços ficarem prontos

2. **Erro de permissão no script setup.sh**
   ```bash
   chmod +x scripts/setup.sh
   ```

3. **Porta já em uso**
   - Pare outros serviços que possam estar usando as portas 3000, 5432, 27017, 6379, 5672, 15672

4. **Erro de dependências**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Limpeza Completa

```bash
# Parar e remover todos os containers
docker-compose down -v

# Remover volumes
docker volume prune

# Limpar cache do npm
npm cache clean --force
```

## 📈 Performance

### Otimizações Implementadas

- **Cache Redis**: Consultas de cobranças em < 10ms
- **Connection Pooling**: Otimização de conexões com banco
- **Worker Assíncrono**: Processamento em background
- **Índices de Banco**: Consultas otimizadas

### Monitoramento

- Health check endpoint: `/health`
- Logs estruturados
- Métricas de performance
- Monitoramento de filas RabbitMQ

## 🚀 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=your-secure-password
MONGODB_URI=mongodb://your-mongo-host:27017/pix_payment_logs
REDIS_HOST=your-redis-host
RABBITMQ_URL=amqp://your-rabbitmq-host:5672
JWT_SECRET=your-very-secure-secret
```

### Build e Deploy

```bash
# Build da aplicação
npm run build

# Executar em produção
npm run start:prod
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs da aplicação
2. Consulte a documentação Swagger em `/api`
3. Execute o health check em `/health`
4. Verifique se todos os serviços estão rodando
