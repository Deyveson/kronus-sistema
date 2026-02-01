import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { ProfissionalService } from '../../services/profissional.service';
import { ClienteService } from '../../services/cliente.service';
import { ServicoService } from '../../services/servico.service';
import { Agendamento, Profissional, Cliente, Servico, AgendamentoCreate } from '../../models/api.models';

interface TimeSlot {
  time: string;
  hour: number;
}

@Component({
  selector: 'app-agenda',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Sidebar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda implements OnInit {
  selectedDate = new Date();
  selectedView: 'day' | 'week' = 'day';
  selectedProfessional = 'todos';
  
  profissionais: Profissional[] = [];
  agendamentos: Agendamento[] = [];
  clientes: Cliente[] = [];
  servicos: Servico[] = [];
  loading = false;
  
  userName = '';
  userInitials = '';

  // Dialog
  showDialog = false;
  dialogMode: 'create' | 'edit' = 'create';
  dialogData = {
    cliente_id: '',
    profissional_id: '',
    servico_id: '',
    data: '',
    hora: '',
    observacoes: '',
    status: 'agendado'
  };
  agendamentoEditando: Agendamento | null = null;

  statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'em_atendimento', label: 'Em Atendimento' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  timeSlots: TimeSlot[] = [
    { time: '08:00', hour: 8 },
    { time: '08:30', hour: 8.5 },
    { time: '09:00', hour: 9 },
    { time: '09:30', hour: 9.5 },
    { time: '10:00', hour: 10 },
    { time: '10:30', hour: 10.5 },
    { time: '11:00', hour: 11 },
    { time: '11:30', hour: 11.5 },
    { time: '12:00', hour: 12 },
    { time: '12:30', hour: 12.5 },
    { time: '13:00', hour: 13 },
    { time: '13:30', hour: 13.5 },
    { time: '14:00', hour: 14 },
    { time: '14:30', hour: 14.5 },
    { time: '15:00', hour: 15 },
    { time: '15:30', hour: 15.5 },
    { time: '16:00', hour: 16 },
    { time: '16:30', hour: 16.5 },
    { time: '17:00', hour: 17 },
    { time: '17:30', hour: 17.5 },
    { time: '18:00', hour: 18 }
  ];
  
  /**
   * Parseia uma string de data/hora sem conversão de timezone.
   * A data vem do backend já no fuso local (America/Manaus).
   */
  private parseDateTimeLocal(dateStr: string): Date {
    if (!dateStr) return new Date();
    // Remove 'Z' se existir para evitar conversão UTC
    const cleanStr = dateStr.replace('Z', '');
    // Parseia a string diretamente
    const [datePart, timePart] = cleanStr.split('T');
    if (!datePart) return new Date();
    
    const [year, month, day] = datePart.split('-').map(Number);
    let hours = 0, minutes = 0, seconds = 0;
    
    if (timePart) {
      const timeComponents = timePart.split(':');
      hours = parseInt(timeComponents[0] || '0', 10);
      minutes = parseInt(timeComponents[1] || '0', 10);
      seconds = parseInt(timeComponents[2]?.split('.')[0] || '0', 10);
    }
    
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  constructor(
    private readonly agendamentoService: AgendamentoService,
    private readonly profissionalService: ProfissionalService,
    private readonly clienteService: ClienteService,
    private readonly servicoService: ServicoService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.nome;
        this.userInitials = user.nome
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
      }
    });
    
    this.carregarProfissionais();
    this.carregarClientes();
    this.carregarServicos();
    this.carregarAgendamentos();
  }

  carregarProfissionais(): void {
    this.profissionalService.listar(0, 100, true).subscribe({
      next: (profissionais) => {
        this.profissionais = profissionais;
        console.log('[Agenda] Profissionais carregados:', this.profissionais.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar profissionais', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar profissionais:', error);
      }
    });
  }

  carregarClientes(): void {
    this.clienteService.listar(0, 100, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        console.log('[Agenda] Clientes carregados:', this.clientes.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  carregarServicos(): void {
    this.servicoService.listar(0, 100, true).subscribe({
      next: (servicos) => {
        this.servicos = servicos;
        console.log('[Agenda] Serviços carregados:', this.servicos.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar serviços', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar serviços:', error);
      }
    });
  }

  carregarAgendamentos(): void {
    this.loading = true;
    let dataInicio: string;
    let dataFim: string;

    if (this.selectedView === 'week') {
      // Para visualização semanal, buscar toda a semana
      const weekDays = this.getWeekDays();
      dataInicio = this.getStartOfDay(weekDays[0]);
      dataFim = this.getEndOfDay(weekDays[6]);
    } else {
      // Para visualização diária, buscar apenas o dia selecionado
      dataInicio = this.getStartOfDay(this.selectedDate);
      dataFim = this.getEndOfDay(this.selectedDate);
    }

    console.log('[Agenda] Carregando agendamentos:', { dataInicio, dataFim, profissional: this.selectedProfessional });

    this.agendamentoService.listar(0, 100, undefined, dataInicio, dataFim).subscribe({
      next: (agendamentos) => {
        console.log('[Agenda] Agendamentos recebidos do backend:', agendamentos);
        // Filtrar por profissional se selecionado
        if (this.selectedProfessional && this.selectedProfessional !== 'todos') {
          this.agendamentos = agendamentos.filter(a => a.profissional_id === this.selectedProfessional);
        } else {
          this.agendamentos = agendamentos;
        }
        console.log('[Agenda] Agendamentos carregados:', this.agendamentos.length);
        console.log('[Agenda] Primeiro agendamento:', this.agendamentos[0]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar agendamentos', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar agendamentos:', error);
      }
    });
  }

  get profissionaisFiltrados(): Profissional[] {
    if (this.selectedProfessional === 'todos') {
      return this.profissionais;
    }
    return this.profissionais.filter(p => p.id === this.selectedProfessional);
  }

  formatDate(date: Date): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  }

  getWeekDays(): Date[] {
    const weekDays: Date[] = [];
    const currentDate = new Date(this.selectedDate);
    
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  }

  getDayName(date: Date): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  changeDate(days: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate = newDate;
    this.carregarAgendamentos();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.carregarAgendamentos();
  }

  setView(view: 'day' | 'week'): void {
    this.selectedView = view;
    this.carregarAgendamentos();
  }

  onProfissionalChange(): void {
    console.log('[Agenda] Profissional alterado:', this.selectedProfessional);
    this.carregarAgendamentos();
  }

  onDateChange(event: any): void {
    const newDate = new Date(event.target.value);
    if (!isNaN(newDate.getTime())) {
      this.selectedDate = newDate;
      this.carregarAgendamentos();
    }
  }

  newAppointment(): void {
    this.dialogMode = 'create';
    this.agendamentoEditando = null;
    this.dialogData = {
      cliente_id: '',
      profissional_id: '',
      servico_id: '',
      data: this.selectedDate.toISOString().split('T')[0],
      hora: '09:00',
      observacoes: '',
      status: 'agendado'
    };
    this.showDialog = true;
  }

  editarAgendamento(agendamento: Agendamento): void {
    console.log('[Agenda] Editando agendamento:', agendamento);
    this.dialogMode = 'edit';
    this.agendamentoEditando = agendamento;
    
    // Parsear data_hora diretamente da string (já está no fuso local)
    let dataStr = '';
    let horaStr = '09:00';
    
    if (agendamento.data_hora) {
      // data_hora pode vir como "2026-02-02T13:00:00" ou "2026-02-02T13:00:00Z"
      const dtStr = agendamento.data_hora.replace('Z', '');
      const parts = dtStr.split('T');
      if (parts.length >= 2) {
        dataStr = parts[0];
        const timeParts = parts[1].split(':');
        if (timeParts.length >= 2) {
          horaStr = `${timeParts[0]}:${timeParts[1]}`;
        }
      }
    }
    
    this.dialogData = {
      cliente_id: agendamento.cliente_id,
      profissional_id: agendamento.profissional_id,
      servico_id: agendamento.servico_id,
      data: dataStr,
      hora: horaStr,
      observacoes: agendamento.observacoes || '',
      status: agendamento.status
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  salvarAgendamento(): void {
    // Validação dos campos obrigatórios
    if (!this.dialogData.cliente_id || !this.dialogData.profissional_id || !this.dialogData.servico_id) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validação de data e hora
    if (!this.dialogData.data || !this.dialogData.hora) {
      this.snackBar.open('Data e hora são obrigatórios', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dataHora = new Date(`${this.dialogData.data}T${this.dialogData.hora}:00`);
    
    // Validação se a data é válida
    if (isNaN(dataHora.getTime())) {
      this.snackBar.open('Data ou hora inválida', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Formatar data/hora no formato local (sem conversão UTC)
    const dataHoraLocal = `${this.dialogData.data}T${this.dialogData.hora}:00`;
    
    const agendamentoData: AgendamentoCreate = {
      cliente_id: this.dialogData.cliente_id,
      profissional_id: this.dialogData.profissional_id,
      servico_id: this.dialogData.servico_id,
      data_hora: dataHoraLocal,
      status: this.dialogData.status,
      observacoes: this.dialogData.observacoes
    };

    console.log('Salvando agendamento:', agendamentoData);

    this.loading = true;

    if (this.dialogMode === 'create') {
      this.agendamentoService.criar(agendamentoData).subscribe({
        next: () => {
          this.loading = false;
          this.showDialog = false;
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarAgendamentos();
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro ao criar agendamento: ' + (error?.error?.detail || error?.message || 'Erro desconhecido'), 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro ao criar agendamento:', error);
        }
      });
    } else if (this.agendamentoEditando) {
      console.log('[Agenda] Atualizando agendamento com ID:', this.agendamentoEditando.id);
      this.agendamentoService.atualizar(this.agendamentoEditando.id, agendamentoData).subscribe({
        next: () => {
          this.loading = false;
          this.showDialog = false;
          this.snackBar.open('Agendamento atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarAgendamentos();
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro ao atualizar agendamento: ' + (error?.error?.detail || error?.message || 'Erro desconhecido'), 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro ao atualizar agendamento:', error);
        }
      });
    }
  }

  cancelarAgendamento(): void {
    if (!this.agendamentoEditando) return;

    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      this.loading = true;
      this.agendamentoService.atualizar(this.agendamentoEditando.id, { status: 'cancelado' }).subscribe({
        next: () => {
          this.loading = false;
          this.showDialog = false;
          this.snackBar.open('Agendamento cancelado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarAgendamentos();
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro ao cancelar agendamento', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    }
  }

  recoverSchedule(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  getAppointmentStyle(agendamento: Agendamento): any {
    const startDate = this.parseDateTimeLocal(agendamento.data_hora);
    const endDate = this.parseDateTimeLocal(agendamento.data_hora);
    endDate.setMinutes(endDate.getMinutes() + agendamento.duracao);

    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    const duration = endHour - startHour;
    
    const top = (startHour - 8) * 120;
    const height = duration * 120;

    return {
      top: `${top}px`,
      height: `${height}px`
    };
  }

  getAppointmentsForProfessional(profissionalId: string): Agendamento[] {
    return this.agendamentos.filter(apt => apt.profissional_id === profissionalId);
  }

  getAppointmentsForDay(day: Date): Agendamento[] {
    return this.agendamentos.filter(apt => {
      const aptDate = this.parseDateTimeLocal(apt.data_hora);
      return aptDate.getDate() === day.getDate() &&
             aptDate.getMonth() === day.getMonth() &&
             aptDate.getFullYear() === day.getFullYear();
    });
  }

  getProfessionalColor(profissionalId: string): string {
    const colors = ['#7c3aed', '#10b981', '#ec4899', '#3b82f6', '#f59e0b'];
    const index = this.profissionais.findIndex(p => p.id === profissionalId);
    return index >= 0 ? colors[index % colors.length] : '#ccc';
  }

  getAppointmentColor(agendamento: Agendamento): any {
    const color = this.getProfessionalColor(agendamento.profissional_id);
    if (agendamento.status === 'cancelado') {
      return {
        background: '#d1d5db',
        color: '#6b7280',
        textDecoration: 'line-through'
      };
    }
    return {
      background: color,
      color: 'white'
    };
  }

  getAppointmentTime(agendamento: Agendamento): string {
    const date = this.parseDateTimeLocal(agendamento.data_hora);
    const endDate = this.parseDateTimeLocal(agendamento.data_hora);
    endDate.setMinutes(endDate.getMinutes() + agendamento.duracao);
    
    const startTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    return `${startTime} - ${endTime}`;
  }

  getAppointmentTimeRange(agendamento: Agendamento): string {
    return this.getAppointmentTime(agendamento);
  }

  private getStartOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  private getEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
