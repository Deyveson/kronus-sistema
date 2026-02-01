import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ServicoService } from '../../services/servico.service';
import { ProfissionalService } from '../../services/profissional.service';
import { AuthService } from '../../services/auth.service';
import { Servico, ServicoCreate, Profissional } from '../../models/api.models';

@Component({
  selector: 'app-servicos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Sidebar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './servicos.html',
  styleUrl: './servicos.scss',
})
export class Servicos implements OnInit {
  searchText = '';
  selectedCategory = 'todas';
  selectedFilter = 'todos';
  servicos: Servico[] = [];
  profissionais: Profissional[] = [];
  loading = false;
  userName = '';
  userInitials = '';

  // Dialog
  showDialog = false;
  dialogMode: 'create' | 'edit' = 'create';
  servicoForm: FormGroup;
  servicoEditando: Servico | null = null;
  salvando = false;

  tiposServico = [
    'Consulta',
    'Retorno',
    'Procedimento',
    'Avaliação'
  ];

  categories = [
    { label: 'Todas as Categorias', value: 'todas' },
  ];

  constructor(
    private readonly servicoService: ServicoService,
    private readonly profissionalService: ProfissionalService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.servicoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Consulta', [Validators.required]],
      descricao: [''],
      duracao: [30, [Validators.required, Validators.min(5)]],
      valor: [0, [Validators.required, Validators.min(0)]],
      profissionais_habilitados: [[]]
    });
  }

  ngOnInit(): void {
    this.carregarServicos();
    this.carregarProfissionais();
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nome;
      const names = user.nome.split(' ');
      this.userInitials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      this.userInitials = this.userInitials.toUpperCase();
    }
  }

  carregarProfissionais(): void {
    this.profissionalService.listar(0, 100, true).subscribe({
      next: (profissionais) => {
        this.profissionais = profissionais;
      },
      error: (error) => {
        console.error('Erro ao carregar profissionais:', error);
      }
    });
  }

  carregarServicos(): void {
    console.log('[carregarServicos] Iniciando carregamento...');
    this.loading = true;
    this.cdr.detectChanges();
    console.log('[carregarServicos] Loading ativado:', this.loading);
    
    const ativo = this.selectedFilter === 'ativos' ? true :
                   this.selectedFilter === 'inativos' ? false : undefined;

    this.servicoService.listar(0, 100, ativo).subscribe({
      next: (servicos) => {
        console.log('[carregarServicos] SUCCESS - Serviços recebidos:', servicos.length);
        console.log('[carregarServicos] Dados:', servicos);
        this.servicos = servicos;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('[carregarServicos] Loading desativado, serviços no array:', this.servicos.length);
      },
      error: (error) => {
        console.error('[carregarServicos] ERROR:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Erro ao carregar serviços', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro:', error);
      }
    });
  }

  get servicosFiltrados(): Servico[] {
    return this.servicos.filter((servico) => {
      const matchSearch =
        servico.nome.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (servico.descricao && servico.descricao.toLowerCase().includes(this.searchText.toLowerCase()));

      const matchStatus = 
        this.selectedFilter === 'todos' ||
        (this.selectedFilter === 'ativos' && servico.ativo) ||
        (this.selectedFilter === 'inativos' && !servico.ativo);

      return matchSearch && matchStatus;
    });
  }

  get totalServicos(): number {
    return this.servicos.length;
  }

  get servicosAtivos(): number {
    return this.servicos.filter(s => s.ativo).length;
  }

  get servicosInativos(): number {
    return this.servicos.filter(s => !s.ativo).length;
  }

  get receitaTotal(): number {
    return this.servicos.reduce((total, s) => total + s.valor, 0);
  }

  onFilterChange(): void {
    this.carregarServicos();
  }

  novoServico() {
    this.dialogMode = 'create';
    this.servicoEditando = null;
    this.servicoForm.reset({
      tipo: 'Consulta',
      duracao: 30,
      valor: 0,
      profissionais_habilitados: []
    });
    this.showDialog = true;
  }

  editarServico(servico: Servico) {
    this.dialogMode = 'edit';
    this.servicoEditando = servico;
    this.servicoForm.patchValue({
      nome: servico.nome,
      tipo: servico.tipo,
      descricao: servico.descricao || '',
      duracao: servico.duracao,
      valor: servico.valor,
      profissionais_habilitados: servico.profissionais_habilitados || []
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.servicoForm.reset();
    this.servicoEditando = null;
  }

  salvarServico(): void {
    if (this.servicoForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.salvando = true;
    const formValue = this.servicoForm.value;
    
    const servicoData: ServicoCreate = {
      nome: formValue.nome,
      tipo: formValue.tipo,
      descricao: formValue.descricao || undefined,
      duracao: parseInt(formValue.duracao),
      valor: parseFloat(formValue.valor),
      profissionais_habilitados: formValue.profissionais_habilitados || [],
      ativo: true
    };

    if (this.dialogMode === 'create') {
      this.servicoService.criar(servicoData).subscribe({
        next: (novo) => {
          this.servicos.push(novo);
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Serviço criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarServicos();
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao criar serviço', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    } else if (this.servicoEditando) {
      this.servicoService.atualizar(this.servicoEditando.id, servicoData).subscribe({
        next: (atualizado) => {
          const index = this.servicos.findIndex(s => s.id === atualizado.id);
          if (index !== -1) {
            this.servicos[index] = atualizado;
          }
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Serviço atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao atualizar serviço', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    }
  }

  deletarServico(id: string) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      this.servicoService.deletar(id).subscribe({
        next: () => {
          this.servicos = this.servicos.filter(s => s.id !== id);
          this.snackBar.open('Serviço excluído com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erro ao excluir serviço', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  toggleStatus(servico: Servico) {
    const novoStatus = !servico.ativo;
    
    this.servicoService.atualizar(servico.id, { ativo: novoStatus }).subscribe({
      next: (atualizado) => {
        servico.ativo = atualizado.ativo;
        this.cdr.detectChanges();
        this.snackBar.open(
          `Serviço ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Erro ao alterar status', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getStatusText(ativo: boolean): string {
    return ativo ? 'ATIVO' : 'INATIVO';
  }

  getTipoBadgeColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'Consulta': 'consulta',
      'Retorno': 'retorno',
      'Procedimento': 'procedimento',
      'Avaliação': 'avaliacao',
    };
    return colors[tipo] || 'consulta';
  }

  get servicosSemProfissionais(): number {
    return this.servicos.filter(s => !s.profissionais_habilitados || s.profissionais_habilitados.length === 0).length;
  }

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
