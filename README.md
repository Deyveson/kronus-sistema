# Fluxor - Sistema de Gestão de Agendamentos

Sistema completo de gestão de agendamentos para clínicas e consultórios.

## 📁 Estrutura do Projeto

```
Projeto Fluxor/
├── docker-compose.yml          # Orquestração dos containers
├── fluxor-backend/             # API FastAPI
│   ├── app/
│   │   ├── core/               # Configurações e segurança
│   │   │   ├── config.py       # Settings da aplicação
│   │   │   └── security.py     # JWT e autenticação
│   │   ├── database/           # Conexão MongoDB
│   │   │   └── mongodb.py      # Motor async client
│   │   ├── models/             # Modelos de domínio
│   │   ├── schemas/            # Schemas Pydantic
│   │   │   └── __init__.py     # Todos os schemas
│   │   ├── routes/             # Endpoints da API
│   │   │   ├── auth.py
│   │   │   ├── clientes.py
│   │   │   ├── profissionais.py
│   │   │   ├── servicos.py
│   │   │   ├── agendamentos.py
│   │   │   ├── lista_espera.py
│   │   │   └── relatorios.py
│   │   ├── services/           # Lógica de negócio
│   │   └── main.py             # Entrada da aplicação
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
└── fluxor-frontend/            # Angular 21
    ├── src/
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

## 🚀 Início Rápido

### Pré-requisitos

- Docker Desktop instalado
- Git

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repo>
cd "Projeto Fluxor"
```

2. Copie o arquivo de ambiente (backend):
```bash
cd fluxor-backend
copy .env.example .env
```

3. Ajuste as variáveis no `.env` conforme necessário

4. Volte para a pasta raiz e inicie os containers:
```bash
cd ..
docker-compose up -d
```

### Acessos

- **Frontend**: http://localhost:4200
- **API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

### Credenciais Padrão

Execute o script `populate_db.py` para criar o usuário admin:

```bash
cd fluxor-backend
python populate_db.py
```

**Login:**
- Email: admin@fluxor.com
- Senha: admin123

## 🛠️ Desenvolvimento

### Backend (FastAPI)

```bash
cd fluxor-backend

# Instalar dependências
pip install -r requirements.txt

# Rodar em modo desenvolvimento
uvicorn app.main:app --reload
```

### Frontend (Angular)

```bash
cd fluxor-frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
ng serve
```

## 📦 Build para Produção

```bash
# Da pasta raiz
docker-compose -f docker-compose.yml up --build -d
```

## 🏗️ Arquitetura

### Backend
- **FastAPI**: Framework web assíncrono
- **MongoDB**: Banco de dados NoSQL
- **Motor**: Driver assíncrono para MongoDB
- **JWT**: Autenticação por tokens
- **Pydantic**: Validação de dados

### Frontend
- **Angular 21**: Framework standalone components
- **Material Design**: UI/UX components
- **RxJS**: Programação reativa
- **TypeScript**: Tipagem estática

## 🔒 Segurança

- Senhas hasheadas com bcrypt + SHA256
- Tokens JWT com expiração configurável
- CORS configurado para origens específicas
- Validação de dados em todas as requisições

## 📝 Variáveis de Ambiente

### Backend (.env)

```env
# Aplicação
APP_NAME=Fluxor API
DEBUG=False

# MongoDB
MONGODB_URL=mongodb://admin:senha@mongodb:27017/fluxor?authSource=admin
DATABASE_NAME=fluxor

# JWT
SECRET_KEY=sua-chave-secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:80
```

## 🧪 Popular Banco de Dados

```bash
cd fluxor-backend
python populate_db.py
```

Isso criará:
- 1 usuário admin
- 5 profissionais exemplo
- 6 serviços exemplo
- 3 clientes exemplo

## 📚 Endpoints da API

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Usuário atual

### Clientes
- `GET /clientes` - Listar
- `POST /clientes` - Criar
- `GET /clientes/{id}` - Obter
- `PUT /clientes/{id}` - Atualizar
- `DELETE /clientes/{id}` - Deletar

### Profissionais
- `GET /profissionais` - Listar
- `POST /profissionais` - Criar
- (+ CRUD completo)

### Serviços
- `GET /servicos` - Listar
- (+ CRUD completo)

### Agendamentos
- `GET /agendamentos` - Listar (com dados expandidos)
- (+ CRUD completo)

### Lista de Espera
- `GET /lista-espera` - Listar (com dados expandidos)
- (+ CRUD completo)

### Relatórios
- `GET /relatorios/dashboard` - Dashboard
- `GET /relatorios/resumo` - Resumo financeiro

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Projeto proprietário - Todos os direitos reservados
