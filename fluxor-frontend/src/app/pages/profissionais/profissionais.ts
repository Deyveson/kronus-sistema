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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProfissionalService } from '../../services/profissional.service';
import { AuthService } from '../../services/auth.service';
import { Profissional, ProfissionalCreate } from '../../models/api.models';

@Component({
  selector: 'app-profissionais',
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
    MatCheckboxModule
  ],
  templateUrl: './profissionais.html',
  styleUrl: './profissionais.scss',
})
export class Profissionais implements OnInit {
  searchText = '';
  selectedFilter = 'todos';
  selectedEspecialidade = 'todas';
  profissionais: Profissional[] = [];
  loading = false;
  userName = '';
  userInitials = '';

  // Dialog
  showDialog = false;
  dialogMode: 'create' | 'edit' = 'create';
  profissionalForm: FormGroup;
  profissionalEditando: Profissional | null = null;
  salvando = false;

  especialidades = [
    { label: 'Todas as Especialidades', value: 'todas' },
  ];

  constructor(
    private readonly profissionalService: ProfissionalService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.profissionalForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      especialidade: ['', [Validators.required]],
      registro_profissional: [''],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      acesso_sistema: [false]
    });
  }

  ngOnInit(): void {
    console.log('[Profissionais ngOnInit] Iniciando componente');
    console.log('[Profissionais ngOnInit] loading inicial:', this.loading);
    console.log('[Profissionais ngOnInit] profissionais inicial:', this.profissionais.length);
    
    this.carregarProfissionais();
    
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nome;
      const names = user.nome.split(' ');
      this.userInitials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      this.userInitials = this.userInitials.toUpperCase();
    }
    console.log('[Profissionais ngOnInit] Finalizado');
  }

  carregarProfissionais(): void {
    console.log('[carregarProfissionais] Iniciando...');
    this.loading = true;
    console.log('[carregarProfissionais] loading=true, forçando detectChanges');
    this.cdr.detectChanges();
    
    // Fallback: garantir que loading será false após 10 segundos
    setTimeout(() => {
      if (this.loading) {
        console.warn('[carregarProfissionais] TIMEOUT: Forçando loading = false');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 10000);
    
    const ativo = this.selectedFilter === 'ativos' ? true :
                   this.selectedFilter === 'inativos' ? false : undefined;

    console.log('[carregarProfissionais] Chamando profissionalService.listar com ativo=', ativo);
    
    this.profissionalService.listar(0, 100, ativo).subscribe({
      next: (profissionais) => {
        console.log('[carregarProfissionais] SUCCESS - Profissionais recebidos:', profissionais.length, profissionais);
        this.profissionais = profissionais;
        const especialidadesUnicas = [...new Set(profissionais.map(p => p.especialidade))];
        this.especialidades = [
          { label: 'Todas as Especialidades', value: 'todas' },
          ...especialidadesUnicas.map(esp => ({ label: esp, value: esp.toLowerCase() }))
        ];
        this.loading = false;
        console.log('[carregarProfissionais] loading=false, forçando detectChanges');
        this.cdr.detectChanges();
        console.log('[carregarProfissionais] State final - loading:', this.loading, 'profissionais:', this.profissionais.length);
      },
      error: (error) => {
        console.error('[carregarProfissionais] ERROR:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Erro ao carregar profissionais', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro:', error);
      }
    });
  }

  get profissionaisFiltrados(): Profissional[] {
    return this.profissionais.filter((prof) => {
      const matchSearch =
        prof.nome.toLowerCase().includes(this.searchText.toLowerCase()) ||
        prof.especialidade.toLowerCase().includes(this.searchText.toLowerCase());

      const matchEspecialidade =
        this.selectedEspecialidade === 'todas' ||
        prof.especialidade.toLowerCase() === this.selectedEspecialidade.toLowerCase();

      const matchStatus = 
        this.selectedFilter === 'todos' ||
        (this.selectedFilter === 'ativos' && prof.ativo) ||
        (this.selectedFilter === 'inativos' && !prof.ativo);

      return matchSearch && matchEspecialidade && matchStatus;
    });
  }

  get totalProfissionais(): number {
    return this.profissionais.length;
  }

  get profissionaisAtivos(): number {
    return this.profissionais.filter(p => p.ativo).length;
  }

  get profissionaisInativos(): number {
    return this.profissionais.filter(p => !p.ativo).length;
  }

  get profissionaisSemAcesso(): number {
    return this.profissionais.filter(p => !p.acesso_sistema).length;
  }

  onFilterChange(): void {
    this.carregarProfissionais();
  }

  novoProfissional() {
    this.dialogMode = 'create';
    this.profissionalEditando = null;
    this.profissionalForm.reset({ acesso_sistema: false });
    this.showDialog = true;
  }

  editarProfissional(profissional: Profissional) {
    this.dialogMode = 'edit';
    this.profissionalEditando = profissional;
    this.profissionalForm.patchValue({
      nome: profissional.nome,
      especialidade: profissional.especialidade,
      registro_profissional: profissional.registro_profissional || '',
      telefone: profissional.telefone,
      email: profissional.email || '',
      acesso_sistema: profissional.acesso_sistema
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.profissionalForm.reset();
    this.profissionalEditando = null;
  }

  salvarProfissional(): void {
    if (this.profissionalForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.salvando = true;
    const formValue = this.profissionalForm.value;
    
    const profissionalData: ProfissionalCreate = {
      nome: formValue.nome,
      especialidade: formValue.especialidade,
      registro_profissional: formValue.registro_profissional || undefined,
      telefone: formValue.telefone,
      email: formValue.email || undefined,
      acesso_sistema: formValue.acesso_sistema,
      ativo: true
    };

    if (this.dialogMode === 'create') {
      this.profissionalService.criar(profissionalData).subscribe({
        next: (novo) => {
          this.profissionais.push(novo);
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Profissional criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarProfissionais();
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao criar profissional', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    } else if (this.profissionalEditando) {
      this.profissionalService.atualizar(this.profissionalEditando.id, profissionalData).subscribe({
        next: (atualizado) => {
          const index = this.profissionais.findIndex(p => p.id === atualizado.id);
          if (index !== -1) {
            this.profissionais[index] = atualizado;
          }
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Profissional atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao atualizar profissional', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    }
  }

  deletarProfissional(id: string) {
    if (confirm('Tem certeza que deseja excluir este profissional?')) {
      this.profissionalService.deletar(id).subscribe({
        next: () => {
          this.profissionais = this.profissionais.filter(p => p.id !== id);
          this.snackBar.open('Profissional excluído com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir profissional', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  toggleStatus(profissional: Profissional) {
    const novoStatus = !profissional.ativo;
    
    this.profissionalService.atualizar(profissional.id, { ativo: novoStatus }).subscribe({
      next: (atualizado) => {
        profissional.ativo = atualizado.ativo;
        this.cdr.detectChanges();
        this.snackBar.open(
          `Profissional ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
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

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
