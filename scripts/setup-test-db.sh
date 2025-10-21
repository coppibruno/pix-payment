#!/bin/bash

# Script para configurar banco de dados de teste
echo "🔧 Configurando ambiente de teste..."

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local service_name=$1
    local host=$2
    local port=$3
    local max_attempts=30
    local attempt=1

    echo "⏳ Aguardando $service_name ficar pronto..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            echo "✅ $service_name está pronto!"
            return 0
        fi
        echo "   Tentativa $attempt/$max_attempts - Aguardando $service_name..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name não ficou pronto após $max_attempts tentativas"
    return 1
}

# Verifica se o PostgreSQL está rodando via Docker
if docker ps | grep -q postgres; then
    echo "📦 PostgreSQL encontrado via Docker"
    
    # Aguarda PostgreSQL ficar pronto
    if wait_for_service "PostgreSQL" "localhost" "5432"; then
        # Cria banco de dados de teste se não existir
        if docker exec pix_payment_postgres_dev psql -U postgres -c "\l" 2>/dev/null | grep -q "pix_payment_test"; then
            echo "✅ Banco de teste 'pix_payment_test' já existe"
        else
            echo "🔨 Criando banco de teste 'pix_payment_test'..."
            docker exec pix_payment_postgres_dev psql -U postgres -c "CREATE DATABASE pix_payment_test;" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "✅ Banco de teste criado com sucesso!"
            else
                echo "❌ Erro ao criar banco de teste"
            fi
        fi
    else
        echo "❌ PostgreSQL não ficou pronto"
    fi
else
    echo "⚠️  PostgreSQL não encontrado via Docker"
    echo "🔧 Tentando conectar diretamente..."
    
    # Tenta conectar diretamente (se psql estiver instalado)
    if command -v psql &> /dev/null; then
        PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE pix_payment_test;" 2>/dev/null || echo "Banco de teste já existe ou erro na conexão"
    else
        echo "❌ psql não encontrado. Instale com: sudo apt install postgresql-client-common"
    fi
fi

# Verifica se o MongoDB está rodando via Docker
if docker ps | grep -q mongo; then
    echo "📦 MongoDB encontrado via Docker"
    if wait_for_service "MongoDB" "localhost" "27017"; then
        echo "✅ MongoDB de teste configurado automaticamente"
    else
        echo "❌ MongoDB não ficou pronto"
    fi
else
    echo "⚠️  MongoDB não encontrado via Docker"
fi

# Verifica Redis
if docker ps | grep -q redis; then
    echo "📦 Redis encontrado via Docker"
    if wait_for_service "Redis" "localhost" "6379"; then
        echo "✅ Redis de teste configurado automaticamente"
    else
        echo "❌ Redis não ficou pronto"
    fi
else
    echo "⚠️  Redis não encontrado via Docker"
fi

# Verifica RabbitMQ
if docker ps | grep -q rabbitmq; then
    echo "📦 RabbitMQ encontrado via Docker"
    if wait_for_service "RabbitMQ" "localhost" "5672"; then
        echo "✅ RabbitMQ de teste configurado automaticamente"
    else
        echo "❌ RabbitMQ não ficou pronto"
    fi
else
    echo "⚠️  RabbitMQ não encontrado via Docker"
fi

echo ""
echo "✅ Ambiente de teste configurado!"
echo "📝 Certifique-se de que os serviços estão rodando:"
echo "   - PostgreSQL: localhost:5432"
echo "   - MongoDB: localhost:27017"
echo "   - Redis: localhost:6379"
echo "   - RabbitMQ: localhost:5672"
echo ""
echo "🚀 Para iniciar os serviços, execute:"
echo "   docker-compose -f docker-compose.dev.yml up -d"
