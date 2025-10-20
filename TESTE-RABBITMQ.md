# 🐰 Guia de Teste - RabbitMQ

## 🚀 Como Testar a Comunicação com RabbitMQ

### 1. Iniciar os Serviços

```bash
# Inicia apenas os bancos de dados e RabbitMQ
docker-compose -f docker-compose.dev.yml up -d

# Aguarda os serviços ficarem prontos
sleep 10
```

### 2. Verificar se o RabbitMQ está Rodando

```bash
# Testa a conexão com RabbitMQ
node test-rabbitmq.js
```

### 3. Iniciar a Aplicação

```bash
# Em outro terminal
npm run start:dev
```

### 4. Testar a API

#### 4.1 Criar uma Cobrança

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

**Resposta esperada:**

```json
{
  "charge_id": "uuid-da-cobranca",
  "pix_key": "pix-abc123",
  "expiration_date": "2024-01-02T10:00:00.000Z",
  "status": "pending",
  "payer_name": "João Silva",
  "payer_document": "12345678901",
  "amount": 10000,
  "description": "Pagamento de serviços",
  "created_at": "2024-01-01T10:00:00.000Z"
}
```

#### 4.2 Simular Pagamento (Envia para RabbitMQ)

```bash
curl -X POST http://localhost:3000/charges/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "charge_id": "uuid-da-cobranca-criada-acima"
  }'
```

**Resposta esperada:**

```json
{
  "message": "Notificação de pagamento enviada para a fila RabbitMQ"
}
```

#### 4.3 Verificar Status da Cobrança

```bash
curl http://localhost:3000/charges/uuid-da-cobranca-criada-acima
```

**Resposta esperada (após processamento):**

```json
{
  "charge_id": "uuid-da-cobranca",
  "status": "paid",
  ...
}
```

### 5. Monitorar o RabbitMQ

1. **Acesse o painel do RabbitMQ**: http://localhost:15672
2. **Login**: admin / admin
3. **Vá para a aba "Queues"**
4. **Você deve ver a fila "pix_payments"**
5. **Clique na fila para ver as mensagens**

### 6. Verificar Logs no MongoDB

#### 6.1 Listar todos os logs de notificação

```bash
curl http://localhost:3000/notifications
```

#### 6.2 Buscar logs por charge_id

```bash
curl http://localhost:3000/notifications/charge/uuid-da-cobranca
```

#### 6.3 Ver estatísticas dos logs

```bash
curl http://localhost:3000/notifications/stats
```

#### 6.4 Verificar health check (PostgreSQL + MongoDB)

```bash
curl http://localhost:3000/health
```

### 7. Verificar Logs da Aplicação

No terminal onde a aplicação está rodando, você deve ver logs como:

```
[RabbitMQService] Conectado ao RabbitMQ
[RabbitMQService] Notificação de pagamento enviada para charge_id: uuid-da-cobranca
[RabbitMQConsumerWorker] Worker de pagamentos iniciado
[RabbitMQConsumerWorker] Processando notificação de pagamento para charge_id: uuid-da-cobranca
[RabbitMQConsumerWorker] Cobrança uuid-da-cobranca atualizada para status: paid
```

### 8. Fluxo Completo de Teste

1. **Criar cobrança** → Status: `pending`
2. **Simular pagamento** → Mensagem enviada para RabbitMQ
3. **Worker processa** → Status muda para `paid`
4. **Consultar cobrança** → Status: `paid`

### 🔧 Troubleshooting

#### Erro de Conexão com RabbitMQ

```bash
# Verificar se o container está rodando
docker ps | grep rabbitmq

# Ver logs do RabbitMQ
docker logs pix_payment_rabbitmq_dev

# Reiniciar o RabbitMQ
docker restart pix_payment_rabbitmq_dev
```

#### Erro de Autenticação

Se aparecer erro `ACCESS_REFUSED`, verifique se:

- O usuário `admin` existe no RabbitMQ
- A senha está correta
- O RabbitMQ está configurado corretamente

#### Fila Não Aparece

Se a fila não aparecer no painel:

- Verifique se a aplicação está rodando
- Verifique os logs da aplicação
- Execute o teste: `node test-rabbitmq.js`

### 📊 Monitoramento

- **RabbitMQ Management**: http://localhost:15672
- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### 🎯 Resultado Esperado

Após seguir todos os passos, você deve ver:

1. ✅ Fila `pix_payments` criada no RabbitMQ
2. ✅ Mensagens sendo enviadas para a fila
3. ✅ Worker processando as mensagens
4. ✅ Status das cobranças sendo atualizado
5. ✅ Logs mostrando todo o fluxo
