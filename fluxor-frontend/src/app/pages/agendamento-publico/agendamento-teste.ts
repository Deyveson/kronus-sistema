import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agendamento-teste',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1>Teste de Agendamento Online</h1>
      <p>Se você está vendo isso, o componente está funcionando!</p>
    </div>
  `,
  styles: [`
    h1 { color: #667eea; }
    p { color: #718096; }
  `]
})
export class AgendamentoTeste {}
