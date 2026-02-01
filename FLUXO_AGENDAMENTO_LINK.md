# 🔗 Como Funciona o Link de Agendamento

## 📱 Fluxo Completo

### **1. Admin Gera o Link**
1. No **Dashboard**, clique no card "Link do Cliente"
2. Sistema abre modal com o link gerado
3. Link tem formato: `http://localhost:4200/agendamento-online?token=XXXXX`

### **2. Compartilhamento**
No modal, o admin pode:
- ✅ **Copiar** o link (botão "Copiar")
- ✅ **Abrir** em nova aba (botão "Abrir Link")
- ✅ **WhatsApp** - Envia mensagem pronta com o link
- ✅ **QR Code** - Gera QR Code do link

### **3. Cliente Acessa o Link**
Quando o cliente clica no link compartilhado:
- ✅ Token é validado automaticamente
- ✅ Dados do cliente são carregados
- ✅ Página já abre no formulário de agendamento (pula etapa do CPF)
- ✅ Cliente vê "Olá, [Nome do Cliente]!"

### **4. Cliente Agenda**
O cliente preenche:
1. **Serviço** - Seleciona o serviço desejado
2. **Profissional** - Escolhe quem vai atendê-lo
3. **Data** - Escolhe o dia no calendário
4. **Horário** - Clica em um dos horários disponíveis (grid 8h-18h)
5. **Observações** (opcional) - Adiciona informações extras

### **5. Confirmação**
- ✅ Sistema valida se horário está disponível
- ✅ Cria agendamento automaticamente
- ✅ Mostra tela de sucesso com todos os detalhes
- ✅ Agendamento aparece na agenda do admin com origem "Link Online"

## 🎯 Duas Formas de Agendar

### **Opção A: Via Link (Recomendado)**
```
Cliente recebe link → Clica → Vai direto pro formulário → Agenda
```
- **Vantagem:** Mais rápido, cliente já identificado
- **Uso:** Quando o admin compartilha o link

### **Opção B: Via CPF**
```
Cliente acessa /agendamento-online → Digite CPF → Valida → Agenda
```
- **Vantagem:** Útil se cliente perdeu o link
- **Uso:** Cliente pode acessar diretamente a URL sem token

## 🔐 Segurança

- ✅ Token único por cliente
- ✅ Token validado no backend antes de qualquer operação
- ✅ Cliente só agenda para si mesmo (não vê outros clientes)
- ✅ Horários verificados em tempo real para evitar conflitos

## 📊 Rastreamento

O sistema registra:
- **Acessos ao link** - Quantas vezes foi aberto
- **Agendamentos criados** - Quantos foram confirmados
- **Origem** - Diferencia agendamentos "admin" vs "link online"

## 🧪 Teste Rápido

1. **Criar cliente:**
   - Dashboard → Clientes → + Novo Cliente
   - Nome: João Teste
   - CPF: 123.456.789-01

2. **Gerar link:**
   - Dashboard → Card "Link do Cliente" → Clique
   - Copie o link gerado

3. **Testar agendamento:**
   - Cole o link em nova aba
   - Sistema carrega automaticamente
   - Preencha formulário e confirme

4. **Verificar:**
   - Volte para Agenda
   - Agendamento deve aparecer com origem "Link Online"

## 🎨 Personalização do Link

Para produção, altere a URL base em:
```typescript
// Backend: fluxor-backend/app/routes/agendamento_online.py
"link": f"https://seu-dominio.com/agendamento-online?token={token}"
```

## 📱 Mensagem WhatsApp Padrão

```
Olá! 👋

Aqui está seu link para agendar consultas online:

[LINK]

Clique no link para escolher o melhor horário para você!
```

## ✨ Próximas Melhorias

- [ ] Email de confirmação automático
- [ ] SMS de lembrete
- [ ] Cancelamento pelo cliente
- [ ] Reagendamento pelo link
- [ ] Expiração do link configurável
- [ ] Analytics completo de conversão

---

**Status:** ✅ Funcionando
**Última atualização:** 24/01/2026
