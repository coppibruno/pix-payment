# 🗄️ Demonstração - Comunicação com Bancos Relacionais e Não-Relacionais

## 🎯 Objetivo

Demonstrar que a aplicação consegue se comunicar com:

- **PostgreSQL** (banco relacional) - para dados de cobranças
- **MongoDB** (banco não-relacional) - para logs de notificações

## 🚀 Fluxo Completo

### 1. Criar Cobrança (PostgreSQL)

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

**Resultado**: Cobrança salva no PostgreSQL com status `pending`

### 2. Simular Pagamento (RabbitMQ)

```bash
curl -X POST http://localhost:3000/charges/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "charge_id": "uuid-da-cobranca"
  }'
```

**Resultado**: Mensagem enviada para fila RabbitMQ

### 3. Worker Processa (PostgreSQL + MongoDB)

O worker automaticamente:

1. **Lê a mensagem** da fila RabbitMQ
2. **Atualiza o status** no PostgreSQL (pending → paid)
3. **Salva o log** no MongoDB

### 4. Verificar Resultados

#### 4.1 Status da Cobrança (PostgreSQL)

```bash
curl http://localhost:3000/charges/uuid-da-cobranca
```

**Resultado esperado**: Status `paid`

#### 4.2 Logs de Notificação (MongoDB)

```bash
curl http://localhost:3000/notifications
```

**Resultado esperado**: Log com detalhes da notificação

#### 4.3 Logs por Cobrança (MongoDB)

```bash
curl http://localhost:3000/notifications/charge/uuid-da-cobranca
```

**Resultado esperado**: Logs específicos da cobrança

#### 4.4 Estatísticas (MongoDB)

```bash
curl http://localhost:3000/notifications/stats
```

**Resultado esperado**: Estatísticas dos logs

#### 4.5 Health Check (Ambos os Bancos)

```bash
curl http://localhost:3000/health
```

**Resultado esperado**: Status de ambos os bancos

## 📊 Estrutura dos Dados

### PostgreSQL (Relacional)

```sql
-- Tabela: charges
CREATE TABLE charges (
    id UUID PRIMARY KEY,
    payer_name VARCHAR(255),
    payer_document VARCHAR(20),
    amount BIGINT,
    description TEXT,
    pix_key VARCHAR(255),
    expiration_date TIMESTAMP,
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### MongoDB (Não-Relacional)

```javascript
// Coleção: notificationlogs
{
  _id: ObjectId,
  charge_id: "uuid-da-cobranca",
  received_at: ISODate,
  previous_status: "pending",
  new_status: "paid",
  message_id: "msg_123",
  metadata: {
    processed_at: ISODate,
    worker_id: 12345,
    rabbitmq_message: { ... }
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔍 Verificações

### 1. PostgreSQL

- Cobrança criada com status `pending`
- Status atualizado para `paid` após processamento
- Dados relacionais estruturados

### 2. MongoDB

- Log de notificação salvo
- Metadados flexíveis (objeto JSON)
- Timestamps automáticos
- Dados não-relacionais

### 3. RabbitMQ

- Fila `pix_payments` criada
- Mensagens sendo processadas
- Worker funcionando

## 📈 Logs da Aplicação

```
[RabbitMQService] Conectado ao RabbitMQ
[RabbitMQService] Notificação de pagamento enviada para charge_id: uuid
[RabbitMQConsumerWorker] Worker de pagamentos iniciado
[RabbitMQConsumerWorker] Processando notificação de pagamento para charge_id: uuid
[RabbitMQConsumerWorker] Cobrança uuid atualizada para status: paid
[RabbitMQConsumerWorker] Log de notificação salvo no MongoDB para charge_id: uuid
```

## 🎯 Demonstração Completa

1. **Inicie os serviços**: `docker-compose -f docker-compose.dev.yml up -d`
2. **Inicie a aplicação**: `npm run start:dev`
3. **Execute o fluxo completo** acima
4. **Verifique ambos os bancos** funcionando
5. **Monitore os logs** da aplicação

## ✅ Resultado Final

- ✅ **PostgreSQL**: Dados estruturados de cobranças
- ✅ **MongoDB**: Logs flexíveis de notificações
- ✅ **RabbitMQ**: Comunicação assíncrona
- ✅ **Worker**: Processamento automático
- ✅ **APIs**: Endpoints para consultar ambos os bancos
- ✅ **Health Check**: Monitoramento de ambos os bancos

A aplicação demonstra claramente a capacidade de trabalhar com bancos relacionais e não-relacionais simultaneamente! 🎉
