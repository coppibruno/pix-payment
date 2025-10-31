-- Script de inicialização do banco de dados PostgreSQL
-- Execute este script após criar o banco de dados

-- Cria a tabela customers se não existir
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria a tabela charges se não existir
CREATE TABLE IF NOT EXISTS charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    payer_name VARCHAR(255) NOT NULL,
    payer_document VARCHAR(20) NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    payment_method VARCHAR(20) NOT NULL,
    -- Campos específicos para PIX
    pix_key VARCHAR(255),
    expiration_date TIMESTAMP,
    -- Campos específicos para Cartão de Crédito
    card_number VARCHAR(19),
    card_expiry VARCHAR(5),
    card_cvv VARCHAR(4),
    card_holder_name VARCHAR(100),
    installments INTEGER,
    -- Campos específicos para Boleto
    bank_slip_code VARCHAR(47),
    bank_slip_url VARCHAR(255),
    due_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_charges_customer_id ON charges(customer_id);
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

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charges_updated_at 
    BEFORE UPDATE ON charges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insere dados de exemplo (opcional)
INSERT INTO customers (id, name, email, document, phone)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'João Silva', 'joao@email.com', '12345678901', '11999999999'),
    ('123e4567-e89b-12d3-a456-426614174001', 'Maria Santos', 'maria@email.com', '98765432100', '11888888888')
ON CONFLICT (id) DO NOTHING;

INSERT INTO charges (id, customer_id, payer_name, payer_document, amount, description, payment_method, pix_key, expiration_date, status)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'João Silva', '12345678901', 10000, 'Pagamento de serviços', 'pix', 'pix-abc123', NOW() + INTERVAL '24 hours', 'pending'),
    ('123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174001', 'Maria Santos', '98765432100', 25000, 'Pagamento de produtos', 'pix', 'pix-def456', NOW() + INTERVAL '24 hours', 'pending')
ON CONFLICT (id) DO NOTHING;
