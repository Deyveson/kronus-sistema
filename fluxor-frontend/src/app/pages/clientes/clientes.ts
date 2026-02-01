import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { Cliente, ClienteCreate } from '../../models/api.models';

@Component({
  selector: 'app-clientes',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes implements OnInit {
  searchText = '';
  selectedFilter = 'todos';
  clientes: Cliente[] = [];
  loading = false;
  userName = '';
  userInitials = '';
  
  // Dialog
  showDialog = false;
  dialogMode: 'create' | 'edit' = 'create';
  clienteForm: FormGroup;
  clienteEditando: Cliente | null = null;
  salvando = false;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      telefone: ['', [Validators.required]],
      cpf: [''],
      data_nascimento: [''],
      endereco: [''],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    console.log('[ngOnInit] Iniciando componente Clientes');
    console.log('[ngOnInit] loading inicial:', this.loading);
    console.log('[ngOnInit] clientes inicial:', this.clientes.length);
    
    this.carregarClientes();
    
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nome;
      const names = user.nome.split(' ');
      this.userInitials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      this.userInitials = this.userInitials.toUpperCase();
    }
    console.log('[ngOnInit] Finalizado');
  }

  carregarClientes(): void {
    console.log('[carregarClientes] Iniciando...');
    this.loading = true;
    console.log('[carregarClientes] loading=true, forçando detectChanges');
    this.cdr.detectChanges();
    
    // Fallback: garantir que loading será false após 10 segundos
    setTimeout(() => {
      if (this.loading) {
        console.warn('[carregarClientes] TIMEOUT: Forçando loading = false após 10 segundos');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 10000);
    
    const ativo = this.selectedFilter === 'ativos' ? true : 
                   this.selectedFilter === 'inativos' ? false : undefined;

    console.log('[carregarClientes] Chamando clienteService.listar com ativo=', ativo);
    
    this.clienteService.listar(0, 100, ativo).subscribe({
      next: (clientes) => {
        console.log('[carregarClientes] SUCCESS - Clientes recebidos:', clientes.length, clientes);
        this.clientes = clientes;
        this.loading = false;
        console.log('[carregarClientes] loading=false, forçando detectChanges');
        this.cdr.detectChanges();
        console.log('[carregarClientes] State final - loading:', this.loading, 'clientes:', this.clientes.length);
      },
      error: (error) => {
        console.error('[carregarClientes] ERROR:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  get clientesFiltrados(): Cliente[] {
    const filtered = this.clientes.filter(cliente => {
      const matchSearch = 
        cliente.nome.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (cliente.cpf && cliente.cpf.includes(this.searchText)) ||
        cliente.telefone.includes(this.searchText) ||
        (cliente.email && cliente.email.toLowerCase().includes(this.searchText.toLowerCase()));

      if (this.selectedFilter === 'todos') return matchSearch;
      if (this.selectedFilter === 'ativos')
        return matchSearch && cliente.ativo;
      if (this.selectedFilter === 'inativos')
        return matchSearch && !cliente.ativo;

      return matchSearch;
    });
    console.log('clientesFiltrados:', filtered.length, 'loading:', this.loading);
    return filtered;
  }

  get totalClientes(): number {
    return this.clientes.length;
  }

  get clientesAtivos(): number {
    return this.clientes.filter(c => c.ativo).length;
  }

  get clientesInativos(): number {
    return this.clientes.filter(c => !c.ativo).length;
  }

  get clientesComConsulta(): number {
    // Por enquanto retorna 0, você pode implementar lógica de agendamentos depois
    return 0;
  }

  onFilterChange(): void {
    this.carregarClientes();
  }

  novoCliente(): void {
    this.dialogMode = 'create';
    this.clienteEditando = null;
    this.clienteForm.reset();
    this.showDialog = true;
  }

  editarCliente(cliente: Cliente): void {
    this.dialogMode = 'edit';
    this.clienteEditando = cliente;
    this.clienteForm.patchValue({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      cpf: cliente.cpf || '',
      data_nascimento: cliente.data_nascimento ? new Date(cliente.data_nascimento) : '',
      endereco: cliente.endereco || '',
      observacoes: cliente.observacoes || ''
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.clienteForm.reset();
    this.clienteEditando = null;
  }

  salvarCliente(): void {
    if (this.clienteForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.salvando = true;
    const formValue = this.clienteForm.value;
    
    const clienteData: ClienteCreate = {
      nome: formValue.nome,
      email: formValue.email || undefined,
      telefone: formValue.telefone,
      cpf: formValue.cpf || undefined,
      data_nascimento: formValue.data_nascimento ? new Date(formValue.data_nascimento).toISOString() : undefined,
      endereco: formValue.endereco || undefined,
      observacoes: formValue.observacoes || undefined,
      ativo: true
    };

    if (this.dialogMode === 'create') {
      this.clienteService.criar(clienteData).subscribe({
        next: (novoCliente) => {
          this.clientes.push(novoCliente);
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Cliente criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.carregarClientes();
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao criar cliente', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    } else if (this.clienteEditando) {
      this.clienteService.atualizar(this.clienteEditando.id, clienteData).subscribe({
        next: (clienteAtualizado) => {
          const index = this.clientes.findIndex(c => c.id === clienteAtualizado.id);
          if (index !== -1) {
            this.clientes[index] = clienteAtualizado;
          }
          this.salvando = false;
          this.showDialog = false;
          this.snackBar.open('Cliente atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.salvando = false;
          this.snackBar.open('Erro ao atualizar cliente', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro:', error);
        }
      });
    }
  }

  deletarCliente(id: string): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.deletar(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.snackBar.open('Cliente excluído com sucesso!', 'Fechar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir cliente', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erro ao excluir cliente:', error);
        }
      });
    }
  }

  visualizarDetalhes(cliente: Cliente): void {
    console.log('Visualizar detalhes:', cliente);
  }

  toggleStatus(cliente: Cliente): void {
    const novoStatus = !cliente.ativo;
    
    this.clienteService.atualizar(cliente.id, { ativo: novoStatus }).subscribe({
      next: (clienteAtualizado) => {
        cliente.ativo = clienteAtualizado.ativo;
        this.cdr.detectChanges();
        this.snackBar.open(
          `Cliente ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Erro ao alterar status do cliente', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro ao alterar status:', error);
      }
    });
  }

  formatarData(dataISO?: string): string {
    if (!dataISO) return 'N/A';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  }

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', {
      duration: 2000
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
