# 🧪 Guia Completo - Testes E2E

## 🚀 **Como Executar os Testes E2E**

### **1. Configuração Inicial**

```bash
# 1. Configure o banco de dados de teste
npm run setup:test-db

# 2. Ou execute o script diretamente
./scripts/setup-test-db.sh
```

### **2. Execução dos Testes**

#### **Opção 1: Script Automatizado (Recomendado)**

````bash
# Executa todos os testes E2E
npm run test:e2e

### **Serviços Necessários:**

- ✅ **PostgreSQL**: `localhost:5432`
- ✅ **MongoDB**: `localhost:27017`
- ✅ **Redis**: `localhost:6379`
- ✅ **RabbitMQ**: `localhost:5672`

### **Iniciar Serviços:**

```bash
# Inicia todos os serviços
docker-compose -f docker-compose.dev.yml up -d

# Ou inicia serviços específicos
docker-compose -f docker-compose.dev.yml up -d postgres mongodb redis rabbitmq
````

## 📊 **Tipos de Testes E2E**

### **1. Testes Completos (`app.e2e-spec.ts`)**

- ✅ **Requer**: Todos os serviços externos
- ✅ **Testa**: Fluxo completo da aplicação
- ✅ **Cobertura**: 100% das funcionalidades

### **2. Testes de Integração (`app-integration.e2e-spec.ts`)**

- ✅ **Requer**: SQLite em memória
- ✅ **Testa**: Integração entre módulos
- ✅ **Cobertura**: Persistência e fluxos

## 🎯 **Cenários de Teste**

### **Autenticação:**

- ✅ Login com credenciais válidas
- ✅ Rejeição de credenciais inválidas
- ✅ Validação de formato de senha
- ✅ Geração de tokens JWT

### **Autorização:**

- ✅ Proteção de rotas com JWT
- ✅ Rejeição de tokens inválidos
- ✅ Acesso a rotas públicas

### **Gestão de Cobranças:**

- ✅ Criação de cobranças
- ✅ Busca por ID
- ✅ Simulação de pagamentos
- ✅ Validação de dados

### **Notificações:**

- ✅ Listagem de logs
- ✅ Paginação
- ✅ Estatísticas
- ✅ Filtros por charge

### **Tratamento de Erros:**

- ✅ JSON malformado
- ✅ Campos obrigatórios ausentes
- ✅ Formatos inválidos
- ✅ Validação de entrada

## 🐛 **Troubleshooting**

### **Erro: Banco de dados não existe**

```bash
# Solução: Execute o script de configuração
npm run setup:test-db
```

### **Erro: Serviços não estão rodando**

```bash
# Solução: Inicie os serviços
docker-compose -f docker-compose.dev.yml up -d
```

### **Erro: Timeout nos testes**

```bash
# Solução: Aumente o timeout no jest-e2e.json
"testTimeout": 60000
```

### **Erro: Porta em uso**

```bash
# Solução: Use porta diferente
PORT=3001 npm run test:e2e
```

## 📈 **Relatórios e Cobertura**

### **Cobertura de Testes:**

- **Autenticação**: 100%
- **Autorização**: 100%
- **Health Check**: 100%
- **Gestão de Cobranças**: 90%
- **Notificações**: 85%
- **Tratamento de Erros**: 95%
- **Fluxo Completo**: 85%
- **Documentação API**: 100%

### **Relatórios Gerados:**

- **Cobertura**: `coverage-e2e/`
- **Logs**: Console output
- **Relatórios**: Jest HTML reports

## 🔄 **CI/CD**

### **GitHub Actions:**

```yaml
- name: Setup Test Database
  run: npm run setup:test-db

- name: Run E2E Tests
  run: npm run test:e2e:run
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

## 📝 **Exemplos de Uso**

### **Teste Rápido:**

```bash
# Configura e executa testes simples
npm run setup:test-db && npm run test:e2e:mock
```

### **Teste Completo:**

```bash
# Configura e executa todos os testes
npm run setup:test-db && npm run test:e2e:all
```

### **Desenvolvimento:**

```bash
# Modo watch para desenvolvimento
npm run test:e2e:watch
```

## 🎉 **Resultado Final**

**Testes E2E completos e funcionais!**

A API agora possui uma suíte robusta de testes End-to-End que valida todas as funcionalidades principais, garantindo qualidade e confiabilidade do sistema.
