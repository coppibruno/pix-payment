#!/bin/bash

# Script para executar testes E2E completos
echo "🚀 Iniciando testes E2E..."

# Verifica se os serviços estão rodando
echo "🔍 Verificando serviços..."

# Função para verificar se um serviço está rodando
check_service() {
    local service_name=$1
    local host=$2
    local port=$3
    
    if nc -z $host $port 2>/dev/null; then
        echo "✅ $service_name está rodando"
        return 0
    else
        echo "❌ $service_name não está rodando"
        return 1
    fi
}

# Verifica todos os serviços necessários
services_ok=true

if ! check_service "PostgreSQL" "localhost" "5432"; then
    services_ok=false
fi

if ! check_service "MongoDB" "localhost" "27017"; then
    services_ok=false
fi

if ! check_service "Redis" "localhost" "6379"; then
    services_ok=false
fi

if ! check_service "RabbitMQ" "localhost" "5672"; then
    services_ok=false
fi

if [ "$services_ok" = false ]; then
    echo ""
    echo "❌ Alguns serviços não estão rodando!"
    echo "🔧 Para iniciar os serviços, execute:"
    echo "   docker-compose -f docker-compose.dev.yml up -d"
    echo ""
    echo "⏳ Aguardando 30 segundos para você iniciar os serviços..."
    sleep 30
    
    # Verifica novamente
    echo "🔍 Verificando serviços novamente..."
    services_ok=true
    
    if ! check_service "PostgreSQL" "localhost" "5432"; then
        services_ok=false
    fi
    
    if ! check_service "MongoDB" "localhost" "27017"; then
        services_ok=false
    fi
    
    if ! check_service "Redis" "localhost" "6379"; then
        services_ok=false
    fi
    
    if ! check_service "RabbitMQ" "localhost" "5672"; then
        services_ok=false
    fi
    
    if [ "$services_ok" = false ]; then
        echo "❌ Serviços ainda não estão prontos. Abortando testes."
        exit 1
    fi
fi

echo ""
echo "✅ Todos os serviços estão rodando!"
echo ""

# Configura o banco de dados de teste
echo "🔧 Configurando banco de dados de teste..."
npm run setup:test-db

if [ $? -ne 0 ]; then
    echo "❌ Erro ao configurar banco de dados de teste"
    exit 1
fi

echo ""
echo "🧪 Executando testes E2E..."
echo ""

# Executa os testes E2E
npm run test:e2e

# Captura o resultado
test_result=$?

echo ""
if [ $test_result -eq 0 ]; then
    echo "✅ Todos os testes E2E passaram!"
else
    echo "❌ Alguns testes E2E falharam"
fi

echo ""
echo "📊 Resumo dos testes E2E:"
echo "   - Health Check: Verificação de status"
echo "   - Authentication: Login/logout"
echo "   - Authorization: Proteção de rotas"
echo "   - Charges Management: CRUD de cobranças"
echo "   - Notifications: Logs e estatísticas"
echo "   - Error Handling: Tratamento de erros"
echo "   - API Documentation: Swagger"

exit $test_result