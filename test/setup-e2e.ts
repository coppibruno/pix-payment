import { config } from 'dotenv';
import { resolve } from 'path';

// Carrega variáveis de ambiente para testes
config({ path: resolve(__dirname, '../test.env') });

// Configurações globais para testes E2E
beforeAll(async () => {
  // Aguarda um tempo para garantir que os serviços estejam prontos
  console.log('⏳ Aguardando serviços ficarem prontos...');
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log('✅ Serviços prontos para testes E2E');
});

afterAll(async () => {
  // Cleanup se necessário
  console.log('🧹 Limpando recursos após testes E2E...');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('✅ Limpeza concluída');
});
