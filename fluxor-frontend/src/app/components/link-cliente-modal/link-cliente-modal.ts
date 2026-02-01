import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

export interface LinkClienteData {
  clienteId: string;
  clienteNome: string;
  token: string;
  link: string;
}

@Component({
  selector: 'app-link-cliente-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './link-cliente-modal.html',
  styleUrl: './link-cliente-modal.scss'
})
export class LinkClienteModal {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LinkClienteData,
    private dialogRef: MatDialogRef<LinkClienteModal>,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  copiarLink(): void {
    const copied = this.clipboard.copy(this.data.link);
    if (copied) {
      this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Erro ao copiar link', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  abrirLink(): void {
    window.open(this.data.link, '_blank');
  }

  compartilharWhatsApp(): void {
    const mensagem = encodeURIComponent(
      `Olá! 👋\n\nAqui está seu link para agendar consultas online:\n\n${this.data.link}\n\nClique no link para escolher o melhor horário para você!`
    );
    const whatsappUrl = `https://wa.me/?text=${mensagem}`;
    window.open(whatsappUrl, '_blank');
  }

  gerarQRCode(): void {
    // Por enquanto, redireciona para um serviço de QR Code
    // Posteriormente pode-se implementar geração local
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.data.link)}`;
    window.open(qrCodeUrl, '_blank');
    
    this.snackBar.open('QR Code aberto em nova aba', 'Fechar', {
      duration: 2000
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
