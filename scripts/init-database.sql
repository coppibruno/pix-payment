-- Script de inicialização do banco de dados PostgreSQL
-- Execute este script após criar o banco de dados

-- Cria a tabela charges se não existir
CREATE TABLE IF NOT EXISTS charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_name VARCHAR(255) NOT NULL,
    payer_document VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    pix_key VARCHAR(255) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(status);
CREATE INDEX IF NOT EXISTS idx_charges_payer_document ON charges(payer_document);
CREATE INDEX IF NOT EXISTS idx_charges_created_at ON charges(created_at);

-- Cria trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_charges_updated_at 
    BEFORE UPDATE ON charges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insere dados de exemplo (opcional)
INSERT INTO charges (id, payer_name, payer_document, amount, description, pix_key, expiration_date, status)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'João Silva', '12345678901', 10000, 'Pagamento de serviços', 'pix-abc123', NOW() + INTERVAL '24 hours', 'pending'),
    ('123e4567-e89b-12d3-a456-426614174001', 'Maria Santos', '98765432100', 25000, 'Pagamento de produtos', 'pix-def456', NOW() + INTERVAL '24 hours', 'pending')
ON CONFLICT (id) DO NOTHING;
