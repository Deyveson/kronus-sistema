// Modelos de dados
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'profissional' | 'recepcionista';
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ClienteCreate {
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  registro_profissional?: string;
  telefone: string;
  email?: string;
  horario_trabalho?: any;
  acesso_sistema: boolean;
  acessoSistema?: boolean;  // alias camelCase para templates
  ativo: boolean;
  status?: 'ativo' | 'inativo';  // computed field para templates
  criado_em: string;
  atualizado_em: string;
}

export interface ProfissionalCreate {
  nome: string;
  especialidade: string;
  registro_profissional?: string;
  telefone: string;
  email?: string;
  horario_trabalho?: any;
  acesso_sistema?: boolean;
  ativo?: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  tipo: string; // Consulta, Retorno, Procedimento, Avaliação
  descricao?: string;
  duracao: number; // em minutos
  valor: number;
  preco?: number;  // alias para valor (para templates)
  profissionais_habilitados: string[]; // IDs dos profissionais
  profissionaisHabilitados?: string[];  // alias camelCase
  profissionais?: number;  // computed: count
  ativo: boolean;
  status?: 'ativo' | 'inativo';  // computed field para templates
  criado_em: string;
  atualizado_em: string;
}

export interface ServicoCreate {
  nome: string;
  tipo: string;
  descricao?: string;
  duracao: number;
  valor: number;
  profissionais_habilitados?: string[];
  ativo?: boolean;
}

export interface Agendamento {
  id: string;
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'finalizado' | 'cancelado';
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Campos expandidos
  cliente_nome: string;
  profissional_nome: string;
  servico_nome: string;
  duracao: number;
}

export interface AgendamentoCreate {
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string;
  status?: string;
  observacoes?: string;
}

export interface ListaEspera {
  id: string;
  cliente_id: string;
  servico_id: string;
  prioridade: number;
  observacoes?: string;
  status: 'aguardando' | 'contatado' | 'agendado' | 'cancelado';
  criado_em: string;
  atualizado_em: string;
  // Campos expandidos
  cliente_nome: string;
  cliente_telefone: string;
  servico_nome: string;
  profissional_id?: string;
  profissional_nome?: string;
  // Campos compatibilidade com templates
  nomePaciente: string;
  servico: string;
  profissional: string;
  dataPreferia: string;
  horario: string;
  observacao: string;
  diasEspera: number;
}

export interface ListaEsperaCreate {
  cliente_id: string;
  servico_id: string;
  prioridade?: number;
  observacoes?: string;
  status?: string;
}

export interface DashboardData {
  total_clientes: number;
  total_profissionais: number;
  total_servicos: number;
  agendamentos_hoje: number;
  agendamentos_por_status: {
    agendado: number;
    confirmado: number;
    finalizado: number;
    cancelado: number;
  };
  total_lista_espera: number;
  receita_mensal?: number;
  tempo_medio?: number;
  taxa_comparecimento?: number;
  satisfacao?: number;
  no_show?: number;
  novos_clientes?: number;
  variacao_agendamentos?: number;
  variacao_clientes?: number;
  variacao_receita?: number;
  variacao_tempo?: number;
}

export interface AtividadeRecente {
  id: string;
  tipo: 'novo_cliente' | 'agendamento_confirmado' | 'agendamento_cancelado' | 'relatorio_gerado';
  titulo: string;
  subtitulo: string;
  tempo: string;
  icone: string;
  cor: string;
}

export interface ProximoAgendamento {
  id: string;
  cliente_nome: string;
  cliente_iniciais: string;
  servico_nome: string;
  data_hora: string;
  hora: string;
  data_texto: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'finalizado' | 'cancelado';
}

export interface DadosGrafico {
  labels: string[];
  receitas: number[];
  consultas: number[];
}
