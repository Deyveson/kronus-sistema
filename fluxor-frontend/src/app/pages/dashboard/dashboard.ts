import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { RelatorioService } from '../../services/relatorio.service';
import { ProfissionalService } from '../../services/profissional.service';
import { ClienteService } from '../../services/cliente.service';
import { AgendamentoOnlineService } from '../../services/agendamento-online.service';
import { LinkClienteModal } from '../../components/link-cliente-modal/link-cliente-modal';
import { DashboardData, AtividadeRecente, ProximoAgendamento, DadosGrafico, Profissional } from '../../models/api.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, 
    FormsModule, 
    RouterOutlet,
    RouterLink,
    Sidebar, 
    MatIcon, 
    MatButtonModule, 
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  userName = '';
  userInitials = '';
  dashboardData: DashboardData | null = null;
  atividadesRecentes: AtividadeRecente[] = [];
  proximosAgendamentos: ProximoAgendamento[] = [];
  dadosGrafico: DadosGrafico | null = null;
  loading = false;
  isDarkMode = false;
  Math = Math; // Para usar no template
  
  // Filtros
  selectedPeriod = 'ultimos-7-dias';
  selectedProfessional = 'todos';
  
  periods = [
    { value: 'ultimos-7-dias', label: 'Últimos 7 dias' },
    { value: 'ultimos-30-dias', label: 'Últimos 30 dias' },
    { value: 'este-mes', label: 'Este mês' },
  ];
  
  professionals: { value: string, label: string }[] = [
    { value: 'todos', label: 'Todos' }
  ];

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private relatorioService: RelatorioService,
    private profissionalService: ProfissionalService,
    private clienteService: ClienteService,
    private agendamentoOnlineService: AgendamentoOnlineService,
    private snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    // Obter dados do usuário logado
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nome;
      const nameParts = user.nome.split(' ');
      this.userInitials = nameParts.length > 1 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : nameParts[0].substring(0, 2);
      this.userInitials = this.userInitials.toUpperCase();
    }
    
    // Carregar preferência de tema
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    }
  }

  ngOnInit(): void {
    this.carregarProfissionais();
    this.carregarDashboard();
  }

  carregarProfissionais(): void {
    this.profissionalService.listar(0, 100, true).subscribe({
      next: (profissionais) => {
        this.professionals = [
          { value: 'todos', label: 'Todos' },
          ...profissionais.map(p => ({ value: p.id, label: p.nome }))
        ];
      },
      error: (error) => {
        console.error('Erro ao carregar profissionais:', error);
      }
    });
  }

  carregarDashboard(): void {
    this.loading = true;
    
    const profissionalId = this.selectedProfessional === 'todos' ? undefined : this.selectedProfessional;
    
    forkJoin({
      dashboard: this.relatorioService.obterDashboard(this.selectedPeriod),
      atividades: this.relatorioService.obterAtividadesRecentes(10),
      agendamentos: this.relatorioService.obterProximosAgendamentos(5, profissionalId),
      grafico: this.relatorioService.obterDadosGrafico(this.selectedPeriod, profissionalId)
    }).subscribe({
      next: (data) => {
        this.dashboardData = data.dashboard;
        this.atividadesRecentes = data.atividades;
        this.proximosAgendamentos = data.agendamentos;
        this.dadosGrafico = data.grafico;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('[Dashboard] Dados carregados:', data);
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Erro ao carregar dados do dashboard', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar dashboard:', error);
      }
    });
  }

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', {
      duration: 2000
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.snackBar.open(
      this.isDarkMode ? 'Tema escuro ativado' : 'Tema claro ativado', 
      'OK', 
      { duration: 2000 }
    );
  }

  logout(): void {
    this.authService.logout();
  }

  applyFilters(): void {
    this.carregarDashboard();
  }

  novoAgendamento(): void {
    this.router.navigate(['/agenda']);
  }

  abrirLinkCliente(): void {
    // Abrir página de agendamento online diretamente
    window.open('/agendamento-online', '_blank');
  }

  cadastrarPaciente(): void {
    this.router.navigate(['/clientes']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'agendado': 'pending',
      'confirmado': 'confirmed',
      'em_atendimento': 'in-progress',
      'finalizado': 'completed',
      'cancelado': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  formatarReceita(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(valor / 1000) + 'k';
  }

  getMaxReceita(): number {
    if (!this.dadosGrafico || !this.dadosGrafico.receitas.length) return 1;
    return Math.max(...this.dadosGrafico.receitas, 1);
  }

  getMaxConsultas(): number {
    if (!this.dadosGrafico || !this.dadosGrafico.consultas.length) return 1;
    return Math.max(...this.dadosGrafico.consultas, 1);
  }
}

