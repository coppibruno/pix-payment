const amqp = require('amqplib');

async function testRabbitMQ() {
  try {
    console.log('🔌 Testando conexão com RabbitMQ...');

    // Tenta conectar com credenciais
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    console.log('✅ Conectado ao RabbitMQ com sucesso!');

    const channel = await connection.createChannel();
    console.log('✅ Canal criado com sucesso!');

    // Declara a fila
    await channel.assertQueue('pix_payments', { durable: true });
    console.log('✅ Fila pix_payments criada/verificada!');

    // Envia uma mensagem de teste
    const testMessage = {
      charge_id: 'test-123',
      timestamp: new Date().toISOString(),
      message_id: 'test-msg-123',
    };

    await channel.sendToQueue(
      'pix_payments',
      Buffer.from(JSON.stringify(testMessage)),
      {
        persistent: true,
        messageId: testMessage.message_id,
      },
    );

    console.log('✅ Mensagem de teste enviada para a fila!');

    // Fecha a conexão
    await channel.close();
    await connection.close();

    console.log('🎉 Teste do RabbitMQ concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao testar RabbitMQ:', error.message);
    console.log('\n💡 Dicas para resolver:');
    console.log(
      '1. Certifique-se de que o RabbitMQ está rodando: docker-compose -f docker-compose.dev.yml up -d',
    );
    console.log('2. Verifique se a porta 5672 está disponível');
    console.log(
      '3. Acesse o painel do RabbitMQ em: http://localhost:15672 (admin/admin)',
    );
  }
}

testRabbitMQ();
