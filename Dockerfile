FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Compila a aplicação
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
