import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RelatorioService } from '../../services/relatorio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-relatorios',
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class Relatorios implements OnInit {
  selectedPeriod = 'ultimo-mes';
  selectedProfissional = 'todos';
  selectedServico = 'todos';
  activeTab = 'visao-geral';
  loading = false;
  userName = '';
  userInitials = '';

  periods = [
    { label: 'Últimos 7 dias', value: 'ultimos-7' },
    { label: 'Último mês', value: 'ultimo-mes' },
    { label: 'Últimos 3 meses', value: 'ultimos-3' },
    { label: 'Último ano', value: 'ultimo-ano' },
    { label: 'Personalizado', value: 'personalizado' },
  ];

  profissionais = [
    { label: 'Todos os profissionais', value: 'todos' },
  ];

  servicos = [
    { label: 'Todos os serviços', value: 'todos' },
  ];

  tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: 'visibility' },
    { id: 'funil-conversao', label: 'Funil de Conversão', icon: 'show_chart' },
    { id: 'por-profissional', label: 'Por Profissional', icon: 'person' },
    { id: 'por-servico', label: 'Por Serviço', icon: 'assignment' },
    { id: 'financeiro', label: 'Financeiro', icon: 'attach_money' },
    { id: 'retorno', label: 'Retorno', icon: 'repeat' },
    { id: 'origem', label: 'Origem', icon: 'source' },
    { id: 'exportacoes', label: 'Exportações', icon: 'download' },
  ];

  indicadores = {
    contatosRecebidos: {
      valor: 0,
      variacao: 0,
      label: 'Contatos Recebidos',
      icon: 'contacts',
      cor: 'blue'
    },
    agendamentosCriados: {
      valor: 0,
      variacao: 0,
      label: 'Agendamentos Criados',
      icon: 'calendar_today',
      cor: 'green'
    },
    atendimentosRealizados: {
      valor: 0,
      variacao: 0,
      label: 'Atendimentos Realizados',
      icon: 'task_alt',
      cor: 'purple'
    },
    taxaConversao: {
      valor: 0,
      variacao: 0,
      label: 'Taxa de Conversão',
      icon: 'trending_up',
      cor: 'orange',
      unidade: '%'
    }
  };

  metricas = [
    {
      titulo: 'Receita Total',
      valor: 'R$ 0,00',
      cor: 'green',
      icon: 'attach_money'
    },
    {
      titulo: 'Ticket Médio',
      valor: 'R$ 0,00',
      cor: 'blue',
      icon: 'receipt'
    },
    {
      titulo: 'Atendimentos',
      valor: '0',
      cor: 'purple',
      icon: 'people'
    },
    {
      titulo: 'Taxa de Cancelamento',
      valor: '0%',
      cor: 'red',
      icon: 'cancel'
    }
  ];

  constructor(
    private relatorioService: RelatorioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nome;
      const names = user.nome.split(' ');
      this.userInitials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      this.userInitials = this.userInitials.toUpperCase();
    }
    this.carregarRelatorios();
  }

  carregarRelatorios(): void {
    this.loading = true;
    const { dataInicio, dataFim } = this.getPeriodoDatas();

    this.relatorioService.resumo(dataInicio, dataFim).subscribe({
      next: (resumo) => {
        this.indicadores.agendamentosCriados.valor = resumo.total_agendamentos;
        this.indicadores.atendimentosRealizados.valor = resumo.agendamentos_confirmados;
        this.metricas[0].valor = this.formatarValor(resumo.receita_total);
        this.metricas[1].valor = this.formatarValor(resumo.ticket_medio);
        this.metricas[2].valor = resumo.total_agendamentos.toString();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar relatórios', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro:', error);
      }
    });
  }

  getPeriodoDatas(): { dataInicio: string, dataFim: string } {
    const dataFim = new Date();
    const dataInicio = new Date();

    switch (this.selectedPeriod) {
      case 'ultimos-7':
        dataInicio.setDate(dataFim.getDate() - 7);
        break;
      case 'ultimo-mes':
        dataInicio.setMonth(dataFim.getMonth() - 1);
        break;
      case 'ultimos-3':
        dataInicio.setMonth(dataFim.getMonth() - 3);
        break;
      case 'ultimo-ano':
        dataInicio.setFullYear(dataFim.getFullYear() - 1);
        break;
      default:
        dataInicio.setMonth(dataFim.getMonth() - 1);
    }

    return {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString()
    };
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onPeriodChange(): void {
    this.carregarRelatorios();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    if (tabId !== 'exportacoes') {
      this.snackBar.open('Aba em desenvolvimento', 'Fechar', { duration: 2000 });
    }
  }

  exportarRelatorio(formato: string): void {
    this.snackBar.open(`Exportação em ${formato.toUpperCase()} em desenvolvimento`, 'Fechar', { duration: 2000 });
  }
  selectTab(tabId: string): void {
    this.setActiveTab(tabId);
  }

  exportarDados(): void {
    this.exportarRelatorio('pdf');
  }

  // Dados mock para as abas em desenvolvimento
  funilConversao: any[] = [];
  desempenhoProfissional: any[] = [];
  desempenhoServico: any[] = [];
  receitaPorCategoria: any[] = [];
  servicosComMaiorRetorno: any[] = [];
  desempenhoOrigem: any[] = [];

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}