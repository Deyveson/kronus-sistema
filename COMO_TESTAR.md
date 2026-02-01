# Como Testar o Sistema Fluxor

## 1. Iniciar os Containers

```bash
cd "c:\Users\deyve\OneDrive\Documentos\Repositorio\Projeto Fluxor"
docker-compose up -d
```

## 2. Verificar se os Serviços Estão Rodando

- **MongoDB**: http://localhost:27017
- **API Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:4200

## 3. Criar Usuário Administrador

### Opção 1: Via API Docs (Swagger)
1. Acesse http://localhost:8000/docs
2. Vá em `POST /auth/register`
3. Clique em "Try it out"
4. Use este JSON:
```json
{
  "nome": "Admin Sistema",
  "email": "admin@sistema.com",
  "senha": "admin123",
  "tipo": "admin"
}
```
5. Clique em "Execute"

### Opção 2: Via PowerShell
```powershell
Invoke-WebRequest -Uri http://localhost:8000/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    nome = "Admin Sistema"
    email = "admin@sistema.com"
    senha = "admin123"
    tipo = "admin"
  } | ConvertTo-Json)
```

## 4. Fazer Login no Frontend

1. Acesse http://localhost:4200
2. Você será redirecionado para `/login`
3. Use as credenciais:
   - **Email**: admin@sistema.com
   - **Senha**: senha123
4. Clique em "Entrar"
5. Você será redirecionado para o Dashboard

## 5. Testar Cadastros

### Cadastrar Cliente
1. No menu lateral, clique em "Clientes"
2. Clique no botão "+ Novo Cliente"
3. Preencha os dados:
   - **Nome**: João da Silva (obrigatório)
   - **Email**: joao@email.com
   - **Telefone**: 11999999999 (obrigatório)
   - **CPF**: 12345678900
   - **Data de Nascimento**: 01/01/1990
   - **Endereço**: Rua Exemplo, 123
   - **Observações**: Cliente preferencial
4. Clique em "Salvar"

### Cadastrar Profissional
1. No menu lateral, clique em "Profissionais"
2. Clique no botão "+ Novo Profissional"
3. Preencha os dados:
   - **Nome**: Dra. Maria Santos (obrigatório)
   - **Especialidade**: Psicóloga (obrigatório)
   - **Registro Profissional**: CRP 12345
   - **Telefone**: 11988888888 (obrigatório)
   - **Email**: maria@clinica.com
   - **Acesso ao Sistema**: Marque se quiser que o profissional possa fazer login
4. Clique em "Salvar"

### Cadastrar Serviço
1. No menu lateral, clique em "Serviços"
2. Clique no botão "+ Novo Serviço"
3. Preencha os dados:
   - **Nome**: Consulta Psicológica (obrigatório)
   - **Tipo**: Consulta (obrigatório)
   - **Duração**: 60 (minutos, obrigatório)
   - **Valor**: 150.00 (obrigatório)
   - **Profissionais Habilitados**: Selecione os profissionais (Ctrl+Clique para múltiplos)
   - **Descrição**: Consulta individual
4. Clique em "Salvar"

### Criar Agendamento
1. No menu lateral, clique em "Agenda"
2. Clique no botão "+ Novo Agendamento"
3. Preencha os dados:
   - **Cliente**: Selecione um cliente cadastrado
   - **Serviço**: Selecione um serviço
   - **Profissional**: Selecione um profissional
   - **Data**: Selecione a data
   - **Hora**: Selecione o horário
   - **Observações**: Informações adicionais
4. Clique em "Criar Agendamento"

## 6. Editar Agendamento

1. Na tela de Agenda, clique em qualquer agendamento no calendário
2. O diálogo de edição abrirá
3. Você pode:
   - Alterar dados do agendamento
   - Mudar o status (Agendado → Confirmado → Em Atendimento → Finalizado)
   - Cancelar o agendamento (botão vermelho)
4. Clique em "Atualizar Agendamento"

## 7. Troubleshooting

### Erro 401 - Unauthorized
- **Causa**: Token expirou ou não está sendo enviado
- **Solução**: Faça logout e login novamente

### Erro 422 - Unprocessable Entity
- **Causa**: Dados inválidos no formulário
- **Solução**: Verifique os campos obrigatórios e formatos (email, telefone)

### Erro CORS
- **Causa**: Configuração de CORS no backend
- **Solução**: Reinicie os containers: `docker-compose restart`

### Frontend não carrega
- **Causa**: Container não iniciou
- **Solução**: 
  ```bash
  docker-compose logs frontend
  docker-compose restart frontend
  ```

### API não responde
- **Causa**: Container não iniciou ou erro no código
- **Solução**:
  ```bash
  docker logs fluxor-api
  docker-compose restart api
  ```

## 8. Verificar Logs

### Logs do Backend
```bash
docker logs fluxor-api --tail 50 -f
```

### Logs do Frontend
```bash
docker logs fluxor-frontend --tail 50 -f
```

### Logs do MongoDB
```bash
docker logs fluxor-mongodb --tail 50 -f
```

## 9. Resetar Dados (Desenvolvimento)

Para limpar todos os dados e recomeçar:

```bash
docker-compose down -v
docker-compose up -d
```

**ATENÇÃO**: Isso apagará todos os dados do banco!

## 10. Credenciais Padrão

### Usuário Admin Criado
- **Email**: admin@sistema.com
- **Senha**: senha123
- **Tipo**: admin

### MongoDB
- **Usuário**: admin
- **Senha**: fluxor123
- **Database**: fluxor_db
- **Porta**: 27017

## 11. URLs Importantes

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
