import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgendamentoOnlineService, Servico, Profissional } from '../../services/agendamento-online.service';

interface ClienteData {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

interface NovoCliente {
  nome: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  genero: string;
}

@Component({
  selector: 'app-agendamento-publico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './agendamento-publico.html',
  styleUrl: './agendamento-publico.scss'
})
export class AgendamentoPublico implements OnInit {
  // Controle de etapas
  etapaAtual = 1;
  loading = false;

  // Token da URL
  token = '';

  // Dados do cliente
  cliente: ClienteData | null = null;
  servicos: Servico[] = [];
  profissionais: Profissional[] = [];
  horariosDisponiveis: string[] = [];

  // Formulário
  cpf = '';
  servicoSelecionado: string | null = null;
  profissionalSelecionado: string | null = null;
  dataSelecionada: Date | null = null;
  dataSelecionadaInput = '';
  dataMinimaStr = '';
  horarioSelecionado: string | null = null;
  observacoes = '';

  // Novo cliente (cadastro)
  novoCliente: NovoCliente = {
    nome: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    genero: ''
  };

  // Data mínima para o datepicker
  dataMinima = new Date();

  constructor(
    private route: ActivatedRoute,
    private agendamentoService: AgendamentoOnlineService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Configurar data mínima como string para input type="date"
    this.dataMinimaStr = this.formatarData(this.dataMinima);
    
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
      // Página pública - não precisa validar token
      // Qualquer pessoa pode acessar e agendar
    });
  }

  // ETAPA 1: Validar CPF
  validarCpf(): void {
    console.log('[validarCpf] Iniciando validação, CPF:', this.cpf);
    
    if (!this.cpf || this.cpf.length < 11) {
      this.mostrarErro('Digite um CPF válido');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    console.log('[validarCpf] Loading ativado:', this.loading);
    
    // Primeiro tenta validar o CPF para ver se o cliente já existe
    this.agendamentoService.validarCpf(this.cpf).subscribe({
      next: (response) => {
        console.log('[validarCpf] SUCCESS - Resposta:', response);
        this.cliente = {
          id: response.cliente._id,
          nome: response.cliente.nome,
          telefone: response.cliente.telefone,
          email: response.cliente.email
        };
        console.log('[validarCpf] Cliente carregado:', this.cliente);
        // Cliente encontrado - vai direto para etapa 3 (agendamento)
        this.carregarServicos();
        this.etapaAtual = 3;
        console.log('[validarCpf] Mudando para etapa 3 (cliente existente)');
      },
      error: (error) => {
        // Se CPF não existe, vai para etapa 2 (cadastro)
        console.log('[validarCpf] CPF não cadastrado, indo para cadastro');
        this.novoCliente = {
          nome: '',
          telefone: '',
          email: '',
          dataNascimento: '',
          genero: ''
        };
        this.loading = false;
        this.etapaAtual = 2;
        this.cdr.detectChanges();
      }
    });
  }

  // ETAPA 2: Cadastrar novo cliente
  cadastrarCliente(): void {
    if (!this.novoCliente.nome || !this.novoCliente.telefone || !this.novoCliente.email) {
      this.mostrarErro('Preencha os campos obrigatórios');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // Simular cadastro - na prática, chamar API de cadastro
    // Por enquanto, criar cliente local e continuar
    this.cliente = {
      id: '',
      nome: this.novoCliente.nome,
      telefone: this.novoCliente.telefone,
      email: this.novoCliente.email
    };

    // Carregar serviços e ir para etapa 3
    this.carregarServicos();
    this.etapaAtual = 3;
  }

  // ETAPA 2: Carregar serviços
  carregarServicos(): void {
    // Loading já está true do validarCpf, não precisa setar de novo
    const tokenParaUsar = this.token || 'publico';
    console.log('[carregarServicos] Chamando API com token:', tokenParaUsar);
    
    this.agendamentoService.listarServicosDisponiveis(tokenParaUsar).subscribe({
      next: (servicos) => {
        console.log('[carregarServicos] Serviços recebidos:', servicos);
        this.servicos = servicos;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('[carregarServicos] Loading desativado, detectChanges chamado');
      },
      error: (error) => {
        console.error('[carregarServicos] Erro ao carregar serviços:', error);
        this.mostrarErro('Erro ao carregar serviços');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selecionarServico(): void {
    if (!this.servicoSelecionado) {
      this.mostrarErro('Selecione um serviço');
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    
    const tokenParaUsar = this.token || 'publico';
    this.agendamentoService.listarProfissionaisDisponiveis(tokenParaUsar, this.servicoSelecionado).subscribe({
      next: (profissionais) => {
        this.profissionais = profissionais;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar profissionais:', error);
        this.mostrarErro('Erro ao carregar profissionais');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selecionarProfissional(): void {
    // Carregar horários quando profissional selecionado
    if (this.profissionalSelecionado && this.dataSelecionadaInput) {
      this.onDataChange();
    }
  }

  // ETAPA 3: Selecionar data e horário
  onDataChange(): void {
    if (!this.dataSelecionadaInput || !this.profissionalSelecionado) return;

    this.dataSelecionada = new Date(this.dataSelecionadaInput + 'T12:00:00');
    this.loading = true;
    this.cdr.detectChanges();
    
    const tokenParaUsar = this.token || 'publico';
    
    this.agendamentoService.obterDisponibilidade(tokenParaUsar, this.profissionalSelecionado, this.dataSelecionadaInput).subscribe({
      next: (response) => {
        this.horariosDisponiveis = response.horarios_disponiveis || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar disponibilidade:', error);
        this.mostrarErro('Erro ao carregar horários disponíveis');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDataSelecionada(): void {
    if (!this.dataSelecionada || !this.profissionalSelecionado) return;

    this.loading = true;
    this.cdr.detectChanges();
    
    const dataFormatada = this.formatarData(this.dataSelecionada);
    const tokenParaUsar = this.token || 'publico';
    
    this.agendamentoService.obterDisponibilidade(tokenParaUsar, this.profissionalSelecionado, dataFormatada).subscribe({
      next: (response) => {
        this.horariosDisponiveis = response.horarios_disponiveis || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar disponibilidade:', error);
        this.mostrarErro('Erro ao carregar horários disponíveis');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Confirmar agendamento
  confirmarAgendamento(): void {
    if (!this.servicoSelecionado || !this.profissionalSelecionado || !this.dataSelecionadaInput || !this.horarioSelecionado) {
      this.mostrarErro('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    const dataHora = `${this.dataSelecionadaInput}T${this.horarioSelecionado}`;
    const tokenParaUsar = this.token || 'publico';

    this.agendamentoService.criarAgendamentoPublico(
      tokenParaUsar,
      this.servicoSelecionado,
      this.profissionalSelecionado,
      dataHora,
      this.observacoes
    ).subscribe({
      next: (response) => {
        this.mostrarSucesso('Agendamento realizado com sucesso!');
        this.etapaAtual = 4; // Tela de sucesso
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao criar agendamento:', error);
        this.mostrarErro(error.error?.detail || 'Erro ao criar agendamento');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Novo agendamento - resetar tudo
  novoAgendamento(): void {
    this.etapaAtual = 1;
    this.cpf = '';
    this.cliente = null;
    this.novoCliente = {
      nome: '',
      telefone: '',
      email: '',
      dataNascimento: '',
      genero: ''
    };
    this.servicoSelecionado = '';
    this.profissionalSelecionado = '';
    this.dataSelecionada = null;
    this.dataSelecionadaInput = '';
    this.horarioSelecionado = '';
    this.observacoes = '';
    this.horariosDisponiveis = [];
    this.cdr.detectChanges();
  }

  // Navegação
  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  // Utilitários
  formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  formatarCpf(cpf: string): string {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  getServicoNome(): string {
    const servico = this.servicos.find(s => s._id === this.servicoSelecionado);
    return servico?.nome || '';
  }

  getProfissionalNome(): string {
    const profissional = this.profissionais.find(p => p._id === this.profissionalSelecionado);
    return profissional?.nome || '';
  }

  mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }

  mostrarSucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'OK', {
      duration: 5000,
      panelClass: ['snackbar-success']
    });
  }
}
