# Fluxor Atendimento - Sistema de Gestão

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Angular](https://img.shields.io/badge/Angular-21.1.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **Fluxor Atendimento** é um sistema completo de gestão de atendimentos clínicos/consultório desenvolvido em Angular 21 com arquitetura moderna, design responsivo e interface intuitiva.

## 📋 Visão Geral

Sistema web para gerenciar:
- 📅 **Agenda** - Agendamentos e consultas
- 👥 **Clientes** - Gestão de pacientes/clientes
- 👨‍⚕️ **Profissionais** - Cadastro de médicos/terapeutas
- 💼 **Serviços** - Tipos de atendimento oferecidos
- ⏳ **Lista de Espera** - Fila de espera e consultas posteriores
- 📊 **Relatórios** - Analytics e indicadores de desempenho
- 📱 **Dashboard** - Visão geral do sistema

## 🚀 Tecnologias

### Frontend
- **Angular 21.1.0** - Framework SPA com componentes standalone
- **TypeScript 5.x** - Tipagem estática
- **Angular Material 21.x** - Componentes e ícones
- **SCSS** - Processador CSS com variables e mixins
- **RxJS** - Programação reativa

### Arquitetura
- ✅ Componentes standalone (sem NgModule)
- ✅ Lazy loading de rotas
- ✅ Estrutura modular por feature
- ✅ Serviços separados por domínio
- ✅ Tipagem TypeScript forte

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   └── sidebar/          # Navegação lateral
│   │       ├── sidebar.ts
│   │       ├── sidebar.html
│   │       └── sidebar.scss
│   ├── pages/
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── agenda/           # Agendamentos
│   │   ├── clientes/         # Gestão de clientes
│   │   ├── profissionais/    # Cadastro de profissionais
│   │   ├── servicos/         # Tipos de serviços
│   │   ├── lista-espera/     # Fila de espera
│   │   ├── relatorios/       # Analytics e relatórios
│   │   ├── login/            # Autenticação
│   │   └── [página]/
│   │       ├── [página].ts
│   │       ├── [página].html
│   │       └── [página].scss
│   ├── app.config.ts         # Configuração da aplicação
│   ├── app.routes.ts         # Rotas da aplicação
│   ├── app.ts                # Componente raiz
│   └── app.scss              # Estilos globais
├── index.html
├── main.ts
└── styles.scss               # Estilos base
```

## 🎨 Design System

### Cores Principais
```
Primary (Pink)     #ec4899  #f472b6  (ações, botões)
Success (Green)    #10b981  #6ee7b7  #a7f3d0  (ativos, sucesso)
Info (Blue)        #3b82f6  #60a5fa  #93c5fd  (informações)
Secondary (Purple) #a855f7  #d8b4fe  #e9d5ff  (secundário)
Warning (Orange)   #f59e0b  #fcd34d  #fde68a  (avisos)
Danger (Red)       #ef4444  #fee2e2  #fecaca  (erros, risco)
Neutral (Gray)     #1f2937  #6b7280  #e5e7eb  (textos, bordas)
```

### Tipografia
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Font Size**: 12px (labels) | 14px (body) | 16px (headings)
- **Font Weight**: 400 (regular) | 500 (medium) | 600 (bold)

### Espaçamento
- **Padding**: 16px, 20px, 24px, 32px
- **Gap/Margin**: 8px, 12px, 16px, 20px, 24px, 32px
- **Border Radius**: 8px, 12px, 16px

## 📱 Responsividade

### Breakpoints
| Resolução | Comportamento |
|-----------|---------------|
| `> 1200px` | Layout desktop completo (grids 3-4 colunas) |
| `768px - 1200px` | Tablet (grids 2 colunas) |
| `< 768px` | Mobile (single column stack) |

### Componentes Responsivos
- **Sidebar**: Fixa 275px com `flex-shrink: 0`
- **Grids**: Colapse automático por breakpoint
- **Tables**: Scroll horizontal em mobile
- **Cards**: Stack vertical em telas pequenas

## 🔑 Funcionalidades Principais

### Dashboard
- KPIs com indicadores principais
- Gráficos de atividades
- Calendário integrado
- Estatísticas em tempo real

### Agenda
- Visualização de agendamentos
- Filtros por data/profissional/cliente
- Status de comparecer/não-aparecer
- Integração com serviços

### Clientes
- Cadastro completo com CPF, telefone, email
- Busca avançada (nome, CPF, telefone, email)
- Filtros por status (ativo/inativo)
- Histórico de consultas
- Status de último atendimento (últimos 30 dias)

### Profissionais
- Registro de profissionais com especialidade
- Controle de acesso ao sistema
- Filtros por especialidade
- Status de ativo/inativo
- Histórico de atendimentos

### Serviços
- Cadastro de tipos de atendimento
- Categorias (consulta, retorno, procedimento, avaliação)
- Preços e duração
- Profissionais associados
- Status do serviço

### Lista de Espera
- Gerenciamento de fila de espera
- Priorização de pacientes
- Agendamento direto
- Notificações

### Relatórios (8 abas)
1. **Visão Geral** - KPIs e métricas financeiras
2. **Funil de Conversão** - 5 etapas de conversão com taxa de abandono
3. **Por Profissional** - Desempenho individual (atendimentos, taxa no-show, receita)
4. **Por Serviço** - Performance de cada serviço
5. **Financeiro** - Receita por categoria com progress bars
6. **Retorno** - Taxa de retorno de clientes
7. **Origem** - Canais de agendamento (online, lista de espera, manual)
8. **Exportações** - CSV, PDF, comparações

## 🛠️ Setup e Instalação

### Pré-requisitos
- Node.js 18.x ou superior
- npm 9.x ou superior

### Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Entre no diretório
cd fluxor-front-end

# Instale as dependências
npm install
```

### Development Server

```bash
# Inicie o servidor de desenvolvimento
npm start

# A aplicação estará disponível em http://localhost:4200
```

### Build para Produção

```bash
# Build otimizado
npm run build

# Output em dist/fluxor-front-end
```

### Testes

```bash
# Execute os testes unitários
npm test

# Com coverage
npm run test:coverage
```

## 🔐 Segurança

- ✅ Tipagem TypeScript em toda aplicação
- ✅ Validação de inputs em formulários
- ✅ XSS Protection (Angular built-in)
- ✅ CORS configurado
- ⚠️ **TODO**: Implementar autenticação com JWT
- ⚠️ **TODO**: HTTPS em produção
- ⚠️ **TODO**: Validação de roles/permissões

## 🚦 Status do Projeto

### ✅ Completo
- [x] Layout e navegação
- [x] Página de Dashboard
- [x] Página de Agenda
- [x] Página de Clientes (CRUD UI)
- [x] Página de Profissionais (CRUD UI)
- [x] Página de Serviços (CRUD UI)
- [x] Página de Lista de Espera
- [x] Página de Relatórios (8 abas)
- [x] Design System com cores padronizadas
- [x] Responsividade mobile/tablet/desktop
- [x] Componentes standalone

### 🚧 Em Desenvolvimento
- [ ] Autenticação e login
- [ ] Backend API integration
- [ ] Modais de CRUD (criar/editar/deletar)
- [ ] Validação de formulários
- [ ] Estados de loading
- [ ] Tratamento de erros
- [ ] Mensagens de sucesso/erro

### ⏳ Planejado
- [ ] Export PDF/Excel de relatórios
- [ ] Filtros avançados com date range
- [ ] Paginação de tabelas
- [ ] Busca em tempo real
- [ ] Notifications/Alertas
- [ ] Agendamento por drag & drop
- [ ] Calendário interativo
- [ ] Dashboard com mais gráficos
- [ ] PWA (Progressive Web App)

## 📈 Performance

- **Lazy Loading**: Rotas carregadas sob demanda
- **Standalone Components**: Sem NgModule, bundle menor
- **Tree Shaking**: Apenas código usado é empacotado
- **Responsive Images**: Otimizadas por breakpoint
- **CSS Scoped**: Estilos isolados por componente

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📝 Padrões de Código

### Naming Conventions
- **Componentes**: PascalCase (ClientesComponent)
- **Serviços**: PascalCase com Service suffix (ClientesService)
- **Variáveis**: camelCase
- **CSS Classes**: kebab-case (.content-header)
- **Arquivos**: kebab-case (clientes.component.ts)

### Comentários
```typescript
// Use comentários descritivos para lógica complexa
// FIXME: Identifique melhorias futuras
// TODO: Funcionalidades planejadas
```

## 🐛 Conhecidos Issues

- Sidebar redimensiona em transições de página em certos casos
- Modais de CRUD ainda não implementadas
- Backend API não conectada (dados hardcoded)
- Validação de formulários mínima

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro de 2026  
**Desenvolvido com ❤️ em Angular**

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
