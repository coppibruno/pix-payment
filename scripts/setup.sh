#!/bin/bash

echo "🚀 Configurando o projeto Gateway Pix..."

# Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verifica se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Cria o arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
fi

# Instala as dependências
echo "📦 Instalando dependências..."
npm install

# Inicia os serviços de banco de dados
echo "🐳 Iniciando serviços de banco de dados..."
docker-compose -f docker-compose.dev.yml up -d

# Aguarda os serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Executa o script de inicialização do banco
echo "🗄️ Inicializando banco de dados..."
docker exec -i pix_payment_postgres_dev psql -U postgres -d pix_payment < scripts/init-database.sql

echo "✅ Setup concluído!"
echo ""
echo "🎯 Para executar a aplicação:"
echo "   npm run start:dev"
echo ""
echo "📚 Documentação da API:"
echo "   http://localhost:3000/api"
echo ""
echo "🔧 Serviços disponíveis:"
echo "   PostgreSQL: localhost:5432"
echo "   MongoDB: localhost:27017"
echo "   Redis: localhost:6379"
echo "   RabbitMQ Management: http://localhost:15672 (admin/admin)"
echo ""
echo "🧪 Para executar os testes:"
echo "   npm run test"
echo "   npm run test:e2e"
