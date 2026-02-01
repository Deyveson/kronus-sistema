import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { ProfissionalService } from '../../services/profissional.service';
import { ServicoService } from '../../services/servico.service';
import { AgendamentoService } from '../../services/agendamento.service';

@Component({
  selector: 'app-teste',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="teste-container">
      <mat-card>
        <h1>🧪 Página de Testes - Integração Backend</h1>
        
        <div class="status-section">
          <h2>Status da Autenticação</h2>
          <p><strong>Usuário Logado:</strong> {{ currentUser ? currentUser.nome : 'Não autenticado' }}</p>
          <p><strong>Email:</strong> {{ currentUser?.email }}</p>
          <p><strong>Tipo:</strong> {{ currentUser?.tipo }}</p>
          <p><strong>Token:</strong> {{ hasToken ? '✅ Presente' : '❌ Ausente' }}</p>
        </div>

        <div class="actions-section">
          <h2>Testes de Integração</h2>
          
          <div class="test-group">
            <h3>1. Teste de Cliente</h3>
            <button mat-raised-button color="primary" (click)="testarCriarCliente()">
              Criar Cliente de Teste
            </button>
            <button mat-raised-button (click)="testarListarClientes()">
              Listar Clientes
            </button>
          </div>

          <div class="test-group">
            <h3>2. Teste de Profissional</h3>
            <button mat-raised-button color="primary" (click)="testarCriarProfissional()">
              Criar Profissional de Teste
            </button>
            <button mat-raised-button (click)="testarListarProfissionais()">
              Listar Profissionais
            </button>
          </div>

          <div class="test-group">
            <h3>3. Teste de Serviço</h3>
            <button mat-raised-button color="primary" (click)="testarCriarServico()">
              Criar Serviço de Teste
            </button>
            <button mat-raised-button (click)="testarListarServicos()">
              Listar Serviços
            </button>
          </div>

          <div class="test-group">
            <h3>4. Teste de Agendamento</h3>
            <button mat-raised-button color="primary" (click)="testarCriarAgendamento()">
              Criar Agendamento de Teste
            </button>
            <button mat-raised-button (click)="testarListarAgendamentos()">
              Listar Agendamentos
            </button>
          </div>
        </div>

        <div class="console-section">
          <h2>📋 Console de Resultados</h2>
          <p><em>Verifique o console do navegador (F12) para ver os logs detalhados</em></p>
          <div class="console-output">
            <div *ngFor="let log of logs" [class]="'log-' + log.type">
              {{ log.message }}
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .teste-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      padding: 24px;
    }

    h1 {
      color: #1976d2;
      margin-bottom: 24px;
    }

    h2 {
      color: #424242;
      margin-top: 24px;
      margin-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    h3 {
      color: #616161;
      margin-bottom: 12px;
    }

    .status-section {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .status-section p {
      margin: 8px 0;
      font-size: 14px;
    }

    .test-group {
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
    }

    .test-group button {
      margin-right: 12px;
      margin-bottom: 8px;
    }

    .console-section {
      margin-top: 24px;
    }

    .console-output {
      background: #263238;
      color: #aed581;
      padding: 16px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      max-height: 400px;
      overflow-y: auto;
    }

    .log-success {
      color: #4caf50;
    }

    .log-error {
      color: #f44336;
    }

    .log-info {
      color: #2196f3;
    }

    .log-warning {
      color: #ff9800;
    }
  `]
})
export class Teste implements OnInit {
  currentUser: any = null;
  hasToken = false;
  logs: Array<{ type: string; message: string }> = [];

  constructor(
    private readonly authService: AuthService,
    private readonly clienteService: ClienteService,
    private readonly profissionalService: ProfissionalService,
    private readonly servicoService: ServicoService,
    private readonly agendamentoService: AgendamentoService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.hasToken = !!this.authService.getToken();
    this.addLog('info', '🚀 Página de testes carregada');
    
    if (!this.hasToken) {
      this.addLog('warning', '⚠️  Nenhum token encontrado. Faça login primeiro!');
    }
  }

  private addLog(type: string, message: string): void {
    this.logs.push({ type, message: `[${new Date().toLocaleTimeString()}] ${message}` });
    console.log(`[Teste] ${message}`);
  }

  testarCriarCliente(): void {
    this.addLog('info', 'Criando cliente de teste...');
    const cliente = {
      nome: `Cliente Teste ${Date.now()}`,
      email: `teste${Date.now()}@email.com`,
      telefone: '11999999999',
      cpf: '12345678900'
    };

    this.clienteService.criar(cliente).subscribe({
      next: (response) => {
        this.addLog('success', `✅ Cliente criado: ${response.nome} (ID: ${response.id})`);
        this.snackBar.open('Cliente criado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao criar cliente: ${error.message}`);
        this.snackBar.open('Erro ao criar cliente', 'Fechar', { duration: 3000 });
      }
    });
  }

  testarListarClientes(): void {
    this.addLog('info', 'Listando clientes...');
    this.clienteService.listar(0, 10).subscribe({
      next: (clientes) => {
        this.addLog('success', `✅ ${clientes.length} cliente(s) encontrado(s)`);
        clientes.forEach(c => this.addLog('info', `  - ${c.nome} (${c.email})`));
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao listar clientes: ${error.message}`);
      }
    });
  }

  testarCriarProfissional(): void {
    this.addLog('info', 'Criando profissional de teste...');
    const profissional = {
      nome: `Dr(a). Teste ${Date.now()}`,
      especialidade: 'Psicologia',
      telefone: '11988888888',
      email: `profissional${Date.now()}@clinica.com`,
      acesso_sistema: false
    };

    this.profissionalService.criar(profissional).subscribe({
      next: (response) => {
        this.addLog('success', `✅ Profissional criado: ${response.nome} (ID: ${response.id})`);
        this.snackBar.open('Profissional criado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao criar profissional: ${error.message}`);
        this.snackBar.open('Erro ao criar profissional', 'Fechar', { duration: 3000 });
      }
    });
  }

  testarListarProfissionais(): void {
    this.addLog('info', 'Listando profissionais...');
    this.profissionalService.listar(0, 10).subscribe({
      next: (profissionais) => {
        this.addLog('success', `✅ ${profissionais.length} profissional(is) encontrado(s)`);
        profissionais.forEach(p => this.addLog('info', `  - ${p.nome} - ${p.especialidade}`));
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao listar profissionais: ${error.message}`);
      }
    });
  }

  testarCriarServico(): void {
    this.addLog('info', 'Criando serviço de teste...');
    const servico = {
      nome: `Serviço Teste ${Date.now()}`,
      tipo: 'Consulta',
      duracao: 60,
      valor: 150.00,
      descricao: 'Serviço de teste'
    };

    this.servicoService.criar(servico).subscribe({
      next: (response) => {
        this.addLog('success', `✅ Serviço criado: ${response.nome} (ID: ${response.id})`);
        this.snackBar.open('Serviço criado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao criar serviço: ${error.message}`);
        this.snackBar.open('Erro ao criar serviço', 'Fechar', { duration: 3000 });
      }
    });
  }

  testarListarServicos(): void {
    this.addLog('info', 'Listando serviços...');
    this.servicoService.listar(0, 10).subscribe({
      next: (servicos) => {
        this.addLog('success', `✅ ${servicos.length} serviço(s) encontrado(s)`);
        servicos.forEach(s => this.addLog('info', `  - ${s.nome} - R$ ${s.valor}`));
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao listar serviços: ${error.message}`);
      }
    });
  }

  testarCriarAgendamento(): void {
    this.addLog('warning', '⚠️  Para criar agendamento, é necessário ter cliente, profissional e serviço cadastrados');
    this.addLog('info', 'Listando dados necessários...');
    
    // Primeiro, vamos listar para ver se temos dados
    this.clienteService.listar(0, 1).subscribe({
      next: (clientes) => {
        if (clientes.length === 0) {
          this.addLog('error', '❌ Nenhum cliente cadastrado. Crie um cliente primeiro!');
          return;
        }
        
        const cliente = clientes[0];
        this.addLog('info', `Cliente encontrado: ${cliente.nome}`);
        
        // Buscar profissional
        this.profissionalService.listar(0, 1).subscribe({
          next: (profissionais) => {
            if (profissionais.length === 0) {
              this.addLog('error', '❌ Nenhum profissional cadastrado. Crie um profissional primeiro!');
              return;
            }
            
            const profissional = profissionais[0];
            this.addLog('info', `Profissional encontrado: ${profissional.nome}`);
            
            // Buscar serviço
            this.servicoService.listar(0, 1).subscribe({
              next: (servicos) => {
                if (servicos.length === 0) {
                  this.addLog('error', '❌ Nenhum serviço cadastrado. Crie um serviço primeiro!');
                  return;
                }
                
                const servico = servicos[0];
                this.addLog('info', `Serviço encontrado: ${servico.nome}`);
                
                // Criar agendamento
                const hoje = new Date();
                const dataStr = hoje.toISOString().split('T')[0];
                const dataHoraLocal = `${dataStr}T14:00:00`;
                
                const agendamento = {
                  cliente_id: cliente.id,
                  profissional_id: profissional.id,
                  servico_id: servico.id,
                  data_hora: dataHoraLocal,
                  status: 'agendado' as const,
                  observacoes: 'Agendamento de teste'
                };
                
                this.addLog('info', 'Criando agendamento...');
                this.agendamentoService.criar(agendamento).subscribe({
                  next: (response) => {
                    this.addLog('success', `✅ Agendamento criado (ID: ${response.id})`);
                    this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
                  },
                  error: (error) => {
                    this.addLog('error', `❌ Erro ao criar agendamento: ${error.message}`);
                    this.snackBar.open('Erro ao criar agendamento', 'Fechar', { duration: 3000 });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  testarListarAgendamentos(): void {
    this.addLog('info', 'Listando agendamentos...');
    this.agendamentoService.listar(0, 10).subscribe({
      next: (agendamentos) => {
        this.addLog('success', `✅ ${agendamentos.length} agendamento(s) encontrado(s)`);
        agendamentos.forEach(a => this.addLog('info', `  - ${a.cliente_nome || 'Cliente'} com ${a.profissional_nome || 'Profissional'}`));
      },
      error: (error) => {
        this.addLog('error', `❌ Erro ao listar agendamentos: ${error.message}`);
      }
    });
  }
}
