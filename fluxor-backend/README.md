# Fluxor Backend

API RESTful desenvolvida com FastAPI e MongoDB para o sistema de gestão de agendamentos Fluxor.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver assíncrono para MongoDB
- **Pydantic** - Validação de dados
- **JWT** - Autenticação via tokens
- **Docker** - Containerização da aplicação

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Python 3.11+ (para desenvolvimento local)

## 🔧 Instalação e Execução

### Com Docker (Recomendado)

1. Clone o repositório e navegue até a pasta do backend:
```bash
cd fluxor-backend
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` e configure suas variáveis (principalmente o `SECRET_KEY`)

4. Suba os containers:
```bash
docker-compose up -d
```

5. A API estará disponível em:
- API: http://localhost:8000
- Documentação interativa (Swagger): http://localhost:8000/docs
- Documentação alternativa (ReDoc): http://localhost:8000/redoc

### Desenvolvimento Local (sem Docker)

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Configure as variáveis de ambiente no arquivo `.env`

3. Execute o MongoDB (pode usar Docker apenas para o MongoDB):
```bash
docker-compose up -d mongodb
```

4. Execute a aplicação:
```bash
uvicorn app.main:app --reload
```

## 📚 Estrutura do Projeto

```
fluxor-backend/
├── app/
│   ├── routes/              # Rotas da API
│   │   ├── auth.py         # Autenticação e usuários
│   │   ├── clientes.py     # Gestão de clientes
│   │   ├── profissionais.py # Gestão de profissionais
│   │   ├── servicos.py     # Gestão de serviços
│   │   ├── agendamentos.py # Gestão de agendamentos
│   │   ├── lista_espera.py # Lista de espera
│   │   └── relatorios.py   # Relatórios e dashboard
│   ├── auth.py             # Funções de autenticação
│   ├── config.py           # Configurações da aplicação
│   ├── database.py         # Conexão com MongoDB
│   ├── main.py             # Ponto de entrada da aplicação
│   └── schemas.py          # Modelos Pydantic
├── docker-compose.yml      # Configuração Docker
├── Dockerfile              # Imagem Docker da API
├── requirements.txt        # Dependências Python
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md              # Este arquivo
```

## 🔑 Endpoints da API

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /auth/me` - Obter dados do usuário logado
- `PUT /auth/me` - Atualizar dados do usuário logado

### Clientes
- `GET /clientes` - Listar clientes
- `GET /clientes/{id}` - Obter cliente específico
- `POST /clientes` - Criar novo cliente
- `PUT /clientes/{id}` - Atualizar cliente
- `DELETE /clientes/{id}` - Deletar cliente

### Profissionais
- `GET /profissionais` - Listar profissionais
- `GET /profissionais/{id}` - Obter profissional específico
- `POST /profissionais` - Criar novo profissional
- `PUT /profissionais/{id}` - Atualizar profissional
- `DELETE /profissionais/{id}` - Deletar profissional

### Serviços
- `GET /servicos` - Listar serviços
- `GET /servicos/{id}` - Obter serviço específico
- `POST /servicos` - Criar novo serviço
- `PUT /servicos/{id}` - Atualizar serviço
- `DELETE /servicos/{id}` - Deletar serviço

### Agendamentos
- `GET /agendamentos` - Listar agendamentos
- `GET /agendamentos/{id}` - Obter agendamento específico
- `POST /agendamentos` - Criar novo agendamento
- `PUT /agendamentos/{id}` - Atualizar agendamento
- `DELETE /agendamentos/{id}` - Deletar agendamento

### Lista de Espera
- `GET /lista-espera` - Listar itens da lista de espera
- `GET /lista-espera/{id}` - Obter item específico
- `POST /lista-espera` - Adicionar item à lista
- `PUT /lista-espera/{id}` - Atualizar item
- `DELETE /lista-espera/{id}` - Remover item

### Relatórios
- `GET /relatorios/dashboard` - Dados do dashboard
- `GET /relatorios/agendamentos-por-periodo` - Agendamentos em um período
- `GET /relatorios/receita-por-periodo` - Receita em um período

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login através do endpoint `/auth/login`
2. Use o token retornado no header `Authorization: Bearer {token}`

## 🗄️ MongoDB

As seguintes collections são criadas automaticamente:
- `usuarios` - Usuários do sistema
- `clientes` - Clientes
- `profissionais` - Profissionais
- `servicos` - Serviços oferecidos
- `agendamentos` - Agendamentos
- `lista_espera` - Lista de espera

## 📝 Variáveis de Ambiente

```env
MONGODB_URL=mongodb://admin:fluxor123@localhost:27017/fluxor?authSource=admin
SECRET_KEY=seu-secret-key-super-seguro-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🛠️ Comandos Úteis

### Ver logs dos containers
```bash
docker-compose logs -f
```

### Parar os containers
```bash
docker-compose down
```

### Remover volumes (limpar banco de dados)
```bash
docker-compose down -v
```

### Acessar o MongoDB via CLI
```bash
docker exec -it fluxor-mongodb mongosh -u admin -p fluxor123
```

## 📄 Licença

Este projeto é parte do sistema Fluxor.
