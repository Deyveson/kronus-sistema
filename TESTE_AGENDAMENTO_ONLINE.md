# 🧪 Teste do Agendamento Online

## 📋 Pré-requisitos

✅ **Containers rodando:**
- fluxor-api (porta 8000)
- fluxor-frontend (porta 4200)  
- fluxor-mongodb (porta 27017)

## 🎯 Fluxo de Teste

### **Passo 1: Criar Cliente de Teste**

1. Acesse: http://localhost:4200/login
2. Faça login no sistema
3. Vá para **Clientes** no menu
4. Clique em **+ Novo Cliente**
5. Preencha:
   - **Nome:** João da Silva Teste
   - **CPF:** 123.456.789-01
   - **Telefone:** (11) 98765-4321
   - **Email:** joao.teste@email.com
   - **Data de Nascimento:** 15/05/1990
6. Clique em **Salvar**

### **Passo 2: Garantir que há Serviços e Profissionais Ativos**

**Criar/Verificar Serviço:**
1. Vá para **Serviços**
2. Crie ou ative um serviço (ex: "Corte de Cabelo", duração 30min, R$ 50,00)

**Criar/Verificar Profissional:**
1. Vá para **Profissionais**
2. Crie ou ative um profissional (ex: "Carlos Silva", especialidade "Corte")

### **Passo 3: Testar Agendamento Online**

1. **Acesse:** http://localhost:4200/agendamento-online

2. **Etapa 1 - Validação de CPF:**
   - Digite: `123.456.789-01`
   - Clique em **Verificar CPF**
   - ✅ **Esperado:** Deve aparecer "Olá, João da Silva Teste!" e avançar para etapa 2

3. **Etapa 2 - Preencher Agendamento:**
   - Selecione um **Serviço** no dropdown
   - Selecione um **Profissional** no dropdown (carrega automaticamente)
   - Escolha uma **Data** no calendário
   - Selecione um **Horário** disponível no grid
   - (Opcional) Adicione **Observações**
   - Clique em **Confirmar Agendamento**

4. **Etapa 3 - Confirmação:**
   - ✅ **Esperado:** Tela de sucesso com ícone de celebração
   - Deve mostrar:
     - Nome do profissional
     - Nome do serviço
     - Data e horário
     - Observações (se houver)
   - Botão **Novo Agendamento** para reiniciar

### **Passo 4: Verificar Agendamento Criado**

1. Volte para o sistema admin (http://localhost:4200/agenda)
2. Vá para **Agenda**
3. ✅ **Verifique:** O agendamento do João da Silva Teste deve aparecer na lista
4. ✅ **Origem:** Deve mostrar "Link Online" ou similar

## 🐛 Testes de Erro

### **Teste 1: CPF Não Cadastrado**
- Digite um CPF não cadastrado: `999.999.999-99`
- Clique em **Verificar CPF**
- ✅ **Esperado:** Mensagem de erro "CPF não encontrado"

### **Teste 2: Horário Já Agendado**
- Tente agendar no mesmo horário/profissional de um agendamento existente
- ✅ **Esperado:** Mensagem de erro "Horário já ocupado"

### **Teste 3: Campos Obrigatórios**
- Não preencha todos os campos
- Tente confirmar agendamento
- ✅ **Esperado:** Botão desabilitado ou mensagem de validação

## 📱 Teste de Responsividade

1. Abra o DevTools (F12)
2. Ative o modo responsivo
3. Teste em diferentes tamanhos:
   - **Mobile:** 375px
   - **Tablet:** 768px
   - **Desktop:** 1920px
4. ✅ **Verifique:** Layout se adapta corretamente

## 🔗 URLs Importantes

- **Login Admin:** http://localhost:4200/login
- **Dashboard:** http://localhost:4200/dashboard
- **Clientes:** http://localhost:4200/clientes
- **Serviços:** http://localhost:4200/servicos
- **Profissionais:** http://localhost:4200/profissionais
- **Agenda:** http://localhost:4200/agenda
- **Agendamento Online:** http://localhost:4200/agendamento-online

## 🎨 Checklist Visual

- [ ] Página tem fundo gradiente roxo/azul
- [ ] Card branco centralizado com bordas arredondadas
- [ ] 3 indicadores de etapa (círculos 1, 2, 3) no topo
- [ ] Input de CPF formata automaticamente (000.000.000-00)
- [ ] Grid de horários mostra botões clicáveis
- [ ] Horário selecionado fica roxo
- [ ] Loading spinners aparecem durante carregamento
- [ ] Tela de confirmação mostra ícone verde de sucesso
- [ ] Animações suaves entre etapas

## 📝 Dados de Teste Sugeridos

```
Cliente:
- Nome: João da Silva Teste
- CPF: 123.456.789-01
- Telefone: (11) 98765-4321
- Email: joao.teste@email.com

Serviço:
- Nome: Corte de Cabelo
- Duração: 30 minutos
- Preço: R$ 50,00

Profissional:
- Nome: Carlos Silva
- Especialidade: Barbeiro
```

## 🚀 Próximos Passos Após Teste

1. [ ] Testar em navegadores diferentes (Chrome, Firefox, Edge)
2. [ ] Testar envio de WhatsApp do link
3. [ ] Testar QR Code do link
4. [ ] Adicionar validações adicionais
5. [ ] Implementar notificações por email/SMS
6. [ ] Analytics de acessos ao link

---

**Status:** 🔄 Pronto para teste
**Última atualização:** 24/01/2026
