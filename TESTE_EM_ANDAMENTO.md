# 🧪 TESTE EM ANDAMENTO - Agendamento Online

## ✅ Status: Pronto para Testar

### 📋 Checklist de Teste

#### **Etapa 1: Preparação** ✅
- [x] Containers rodando
- [x] Frontend reconstruído com correções
- [x] Backend funcionando

#### **Etapa 2: Cadastrar Dados (FAÇA AGORA)** 🔄
- [ ] **Criar Cliente:**
  - Vá para: http://localhost:4200/clientes
  - Clique em "+ Novo Cliente"
  - Nome: **João Silva Teste**
  - CPF: **123.456.789-01** (IMPORTANTE: anote este CPF)
  - Telefone: **(11) 98765-4321**
  - Email: **joao@teste.com**
  - Salvar

- [ ] **Verificar Serviço Ativo:**
  - Vá para: http://localhost:4200/servicos
  - Certifique-se que existe pelo menos 1 serviço ATIVO
  - Se não existir, crie: Nome "Consulta", Duração 30min, Preço R$ 50,00

- [ ] **Verificar Profissional Ativo:**
  - Vá para: http://localhost:4200/profissionais
  - Certifique-se que existe pelo menos 1 profissional ATIVO
  - Se não existir, crie: Nome "Dr. Carlos", Especialidade "Clínico Geral"

#### **Etapa 3: Gerar Link do Cliente** ⏳
- [ ] Voltar para: http://localhost:4200/dashboard
- [ ] Procurar o card **"Link do Cliente"**
- [ ] Clicar no card
- [ ] Modal deve abrir mostrando:
  - Nome do cliente: **João Silva Teste**
  - Link gerado (algo como: http://localhost:4200/agendamento-online?token=xxxxx)
  - 3 botões verticais com ícones à esquerda:
    - 🔗 Abrir Link
    - 💬 WhatsApp
    - 📱 QR Code

#### **Etapa 4: Copiar e Acessar Link** ⏳
- [ ] Clicar no botão **"Copiar"** (ao lado do link)
- [ ] Deve aparecer notificação: "Link copiado para a área de transferência!"
- [ ] Abrir uma **nova aba anônima** no navegador (Ctrl+Shift+N)
- [ ] Colar o link copiado e acessar

#### **Etapa 5: Tela de Agendamento do Cliente** ⏳
- [ ] A página deve carregar automaticamente mostrando:
  - Header roxo com ícone de calendário
  - Título: "Agendamento Online"
  - Indicadores de etapa: (1) ✓ (2) ○ (3) ○
  - Mensagem: **"Olá, João Silva Teste!"**
  - Card branco com formulário

- [ ] Formulário deve ter:
  - Dropdown **Serviço** (deve listar serviços ativos)
  - Dropdown **Profissional** (inicialmente desabilitado)
  - Campo **Data** (inicialmente desabilitado)
  - Grid de **Horários** (vazio inicialmente)
  - Campo **Observações**

#### **Etapa 6: Preencher Agendamento** ⏳
- [ ] **Selecionar Serviço:**
  - Clicar no dropdown "Selecione o serviço"
  - Escolher um serviço (ex: "Consulta - R$ 50,00")
  - ✅ Dropdown de profissional deve habilitar automaticamente

- [ ] **Selecionar Profissional:**
  - Clicar no dropdown "Selecione o profissional"
  - Escolher um profissional (ex: "Dr. Carlos - Clínico Geral")
  - ✅ Campo de data deve habilitar automaticamente

- [ ] **Selecionar Data:**
  - Clicar no campo de data (ícone de calendário)
  - Escolher uma data futura (ex: amanhã)
  - ✅ Grid de horários deve carregar automaticamente

- [ ] **Selecionar Horário:**
  - Verificar que aparecem botões com horários (8:00, 8:30, 9:00, etc.)
  - Clicar em um horário disponível
  - ✅ Horário deve ficar roxo (selecionado)

- [ ] **Observações (opcional):**
  - Adicionar texto: "Primeira consulta"

- [ ] **Confirmar:**
  - Clicar no botão **"Confirmar Agendamento"**
  - Aguardar processamento

#### **Etapa 7: Tela de Confirmação** ⏳
- [ ] Deve aparecer:
  - Ícone verde de check ✓
  - Título: "Agendamento Confirmado!"
  - Card com detalhes:
    - 👤 **Profissional:** Dr. Carlos
    - 🏥 **Serviço:** Consulta
    - 📅 **Data e Horário:** [data escolhida] às [hora escolhida]
    - 📝 **Observações:** Primeira consulta
  - Caixa azul com informações sobre confirmação
  - Botão **"Novo Agendamento"**

#### **Etapa 8: Verificar na Agenda do Admin** ⏳
- [ ] Voltar para a aba do admin
- [ ] Ir para: http://localhost:4200/agenda
- [ ] Procurar o agendamento criado
- [ ] Verificar que aparece:
  - Nome: **João Silva Teste**
  - Profissional: Dr. Carlos
  - Serviço: Consulta
  - Data/Hora: [conforme selecionado]
  - Status: Agendado
  - Origem: **"Link Online"** ou similar

---

## 📸 O que Observar

### ✅ Coisas que DEVEM funcionar:
- Modal com layout correto (ícones à esquerda)
- Token valida automaticamente ao abrir link
- Dropdowns carregam dados dinamicamente
- Grid de horários aparece após selecionar data
- Botão "Confirmar" fica habilitado quando todos campos preenchidos
- Tela de confirmação mostra dados corretos
- Agendamento aparece na agenda do admin

### ❌ Problemas a reportar:
- Modal não abre ou dá erro 404
- Link copiado não funciona
- Página de agendamento fica em branco
- Dropdowns não carregam ou ficam vazios
- Horários não aparecem
- Erro ao confirmar agendamento
- Agendamento não aparece na agenda

---

## 🐛 Se der erro:

**Erro 404 ao gerar link:**
- Verificar logs: `docker logs fluxor-api --tail 20`

**Página em branco ao acessar link:**
- Verificar console do navegador (F12)
- Verificar se token está na URL

**Dropdowns vazios:**
- Verificar se serviços e profissionais estão ativos
- Verificar logs do backend

**Horários não carregam:**
- Verificar se profissional e data foram selecionados
- Ver console do navegador para erros de API

---

**🚀 PODE COMEÇAR O TESTE! Siga cada etapa marcando com [x] quando concluir.**

