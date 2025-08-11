# certbot-automation
Automação de geração de certificados e configurações do Nginx utilizando o [certbot](https://certbot.eff.org/).

Tecnologias utilizadas:
- TypeScript
- Bun
- MongoDB
- Azure Blob Storage
- Bash

## Descrição
A automação funciona da seguinte forma:
- Na inicialização, a função principal faz um sync com dados já existentes no Azure Blob Storage.
- A cada 15 minutos, a função principal tenta fazer a renovação dos certificados e refaz o processo de sync para manter os dados atualizados.
- Quando um novo domínio é inserido no banco de dados, a função principal:
  - Gera um certificado no Let's Encrypt
  - Copia os certificados para o Azure Blob Storage
  - Cria um arquivo de configuração para o Nginx
  - Faz um sync com o Azure Blob Storage

## Pré-requisitos
- Docker
- Docker Compose
- Nginx configurado

## Build do container

```bash
docker build -t certbot-automation .
```

## Executando o container

- Crie um docker compose na raiz do projeto com a seguinte estrutura (substituindo as variáveis de ambiente conforme a tabela logo abaixo):
```yaml
services:
  certbot-automation:
    image: certbot-automation:latest
    build: .
    container_name: certbot-automation
    restart: unless-stopped
    environment:
      - NODE_ENV=staging
      - MONGODB_URI=mongodb://mongodb:27017/certbot-automation
      - MONGODB_URI_PARAMS=?retryWrites=true&w=majority&appName=certbot-automation
      - MONGODB_DB=certbot-automation
      - MONGODB_COLLECTION=domains
      - MONGODB_USERNAME=certbot-automation
      - MONGODB_PASSWORD=certbot-automation
      - AZCOPY_ROOT_FOLDER=/etc/azure-storage
      - AZCOPY_SAS_URI=https://storage.azure.com/project-name-staging-storage?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2023-11-02T00:00:00Z&st=2023-10-31T23:59:59Z&spr=https&sig=xxxx
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
      - /etc/azure-storage:/etc/azure-storage
```

Tabela de variáveis de ambiente:

| Variável de ambiente | Exemplo | Descrição |
| --- | --- | --- |
| NODE_ENV | staging | Valores: development, staging, production |
| MONGODB_URI | cluster0.xxxxxxxx.mongodb.net | URI base do MongoDB |
| MONGODB_URI_PARAMS | ?retryWrites=true&w=majority&appName=certbot-automation | Parâmetros do MongoDB (Opcional) |
| MONGODB_DB | certbot-automation | Nome do banco |
| MONGODB_COLLECTION | domains | Nome da collection |
| MONGODB_USERNAME | certbot-automation | Nome do usuário |
| MONGODB_PASSWORD | certbot-automation | Senha do usuário |
| AZCOPY_ROOT_FOLDER | /etc/azure-storage | Caminho raiz do Azure Blob Storage, onde serão salvos os arquivos de configuração |
| AZCOPY_SAS_URI | https://storage.azure.com/project-name-staging-storage?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2023-11-02T00:00:00Z&st=2023-10-31T23:59:59Z&spr=https&sig=xxxx| URI do Azure Blob Storage com o token SAS |