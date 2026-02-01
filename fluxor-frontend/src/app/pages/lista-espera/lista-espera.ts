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
import { ListaEsperaService } from '../../services/lista-espera.service';
import { AuthService } from '../../services/auth.service';
import { ListaEspera as ListaEsperaModel } from '../../models/api.models';

@Component({
  selector: 'app-lista-espera',
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
  templateUrl: './lista-espera.html',
  styleUrl: './lista-espera.scss',
})
export class ListaEspera implements OnInit {
  searchText = '';
  selectedFilter = 'todos';
  items: ListaEsperaModel[] = [];
  loading = false;
  userName = '';
  userInitials = '';

  constructor(
    private listaEsperaService: ListaEsperaService,
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
    this.carregarLista();
  }

  carregarLista(): void {
    this.loading = true;
    const prioridade = this.selectedFilter !== 'todos' ? this.selectedFilter : undefined;

    this.listaEsperaService.listar(0, 100, prioridade).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar lista de espera', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Erro:', error);
      }
    });
  }

  get itemsFiltrados(): ListaEsperaModel[] {
    return this.items.filter((item) => {
      const matchSearch =
        !this.searchText ||
        item.cliente_nome.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.servico_nome.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (item.profissional_nome && item.profissional_nome.toLowerCase().includes(this.searchText.toLowerCase()));

      return matchSearch;
    });
  }

  onFilterChange(): void {
    this.carregarLista();
  }

  getPrioridadeBadgeColor(prioridade: number | string): string {
    const prioridadeStr = typeof prioridade === 'number'
      ? this.getPrioridadeTexto(prioridade)
      : prioridade.toString();
    
    const colors: { [key: string]: string } = {
      urgente: 'urgente',
      alta: 'alta',
      media: 'media',
      baixa: 'baixa',
    };
    return colors[prioridadeStr.toLowerCase()] || '';
  }

  getPrioridadeTexto(prioridade: number): string {
    const prioridades: { [key: number]: string } = {
      1: 'Urgente',
      2: 'Alta',
      3: 'Média',
      4: 'Baixa',
    };
    return prioridades[prioridade] || 'Média';
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      aguardando: 'aguardando',
      contatado: 'contatado',
      confirmado: 'confirmado',
    };
    return colors[status] || '';
  }

  agendar(item: ListaEsperaModel): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  verDetalhes(item: ListaEsperaModel): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  adicionarLista(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  get totalItens(): number {
    return this.items.length;
  }

  get itensUrgentes(): number {
    return this.items.filter((i) => i.prioridade >= 4).length;
  }

  get itensAguardando(): number {
    return this.items.filter((i) => i.status === 'aguardando').length;
  }

  get itensContatados(): number {
    return this.items.filter((i) => i.status === 'contatado').length;
  }

  goToProfile(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
