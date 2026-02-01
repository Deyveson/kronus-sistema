import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Agendamento, AgendamentoCreate } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = `${environment.apiUrl}/agendamentos`;

  constructor(private http: HttpClient) {}

  private enrichAgendamento(agend: Agendamento): Agendamento {
    // Já retorna os campos expandidos do backend (cliente_nome, profissional_nome, servico_nome, duracao)
    return agend;
  }

  listar(
    skip: number = 0,
    limit: number = 100,
    status?: string,
    dataInicio?: string,
    dataFim?: string
  ): Observable<Agendamento[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status_filtro', status);
    }
    if (dataInicio) {
      params = params.set('data_inicio', dataInicio);
    }
    if (dataFim) {
      params = params.set('data_fim', dataFim);
    }

    return this.http.get<Agendamento[]>(this.apiUrl, { params })
      .pipe(map(agends => agends.map(a => this.enrichAgendamento(a))));
  }

  obter(id: string): Observable<Agendamento> {
    return this.http.get<Agendamento>(`${this.apiUrl}/${id}`)
      .pipe(map(a => this.enrichAgendamento(a)));
  }

  criar(agendamento: AgendamentoCreate): Observable<Agendamento> {
    console.log('[AgendamentoService] Criando agendamento:', agendamento);
    console.log('[AgendamentoService] URL:', this.apiUrl);
    return this.http.post<Agendamento>(this.apiUrl, agendamento)
      .pipe(map(a => {
        console.log('[AgendamentoService] Agendamento criado com sucesso:', a);
        return this.enrichAgendamento(a);
      }));
  }

  atualizar(id: string, agendamento: Partial<AgendamentoCreate>): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}/${id}`, agendamento)
      .pipe(map(a => this.enrichAgendamento(a)));
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
