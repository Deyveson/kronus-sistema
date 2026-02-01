import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LinkCliente {
  cliente_id: string;
  cliente_nome: string;
  token: string;
  link: string;
  ativo: boolean;
}

export interface LinkEstatisticas {
  cliente_id: string;
  token: string;
  ativo: boolean;
  acessos: number;
  agendamentos_realizados: number;
  criado_em: string;
}

export interface ValidacaoCpfResponse {
  token: string;
  cliente: {
    _id: string;
    nome: string;
    telefone: string;
    email: string;
  };
}

export interface Servico {
  _id: string;
  nome: string;
  descricao?: string;
  duracao: number;
  preco: number;
}

export interface Profissional {
  _id: string;
  nome: string;
  especialidades: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoOnlineService {
  private apiUrl = `${environment.apiUrl}/agendamento-online`;

  constructor(private http: HttpClient) {}

  validarCpf(cpf: string): Observable<ValidacaoCpfResponse> {
    return this.http.post<ValidacaoCpfResponse>(`${this.apiUrl}/validar-cpf`, { cpf });
  }

  listarServicosDisponiveis(token: string): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/servicos-disponiveis/${token}`);
  }

  listarProfissionaisDisponiveis(token: string, servicoId?: string): Observable<Profissional[]> {
    const params: any = {};
    if (servicoId) {
      params.servico_id = servicoId;
    }
    return this.http.get<Profissional[]>(`${this.apiUrl}/profissionais-disponiveis/${token}`, servicoId ? { params } : {});
  }

  gerarLinkCliente(clienteId: string): Observable<LinkCliente> {
    return this.http.post<LinkCliente>(`${this.apiUrl}/gerar-link/${clienteId}`, {});
  }

  validarToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validar/${token}`);
  }

  criarAgendamentoPublico(
    token: string,
    servicoId: string,
    profissionalId: string,
    dataHora: string,
    observacoes?: string
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/agendar/${token}`, {
      servico_id: servicoId,
      profissional_id: profissionalId,
      data_hora: dataHora,
      observacoes
    });
  }

  obterDisponibilidade(token: string, profissionalId: string, data: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/disponibilidade/${token}`, {
      params: { profissional_id: profissionalId, data }
    });
  }

  desativarLink(clienteId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/desativar-link/${clienteId}`);
  }

  obterEstatisticas(clienteId: string): Observable<LinkEstatisticas> {
    return this.http.get<LinkEstatisticas>(`${this.apiUrl}/estatisticas/${clienteId}`);
  }
}
