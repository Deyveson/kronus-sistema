import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(private snackBar: MatSnackBar) {}

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Agenda', icon: 'calendar_today', route: '/agenda' },
    { label: 'Clientes', icon: 'people', route: '/clientes' },
    { label: 'Profissionais', icon: 'medical_services', route: '/profissionais' },
    { label: 'Serviços', icon: 'assignment', route: '/servicos' },
    { label: 'Lista de Espera', icon: 'schedule', route: '/lista-espera' },
    { label: 'Relatórios', icon: 'trending_up', route: '/relatorios' }
  ];

  abrirConfiguracoes(): void {
    this.snackBar.open('Configurações em desenvolvimento', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
