import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData, AtividadeRecente, ProximoAgendamento, DadosGrafico } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  obterDashboard(periodo: string = 'ultimos-7-dias'): Observable<DashboardData> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, { params });
  }

  obterAtividadesRecentes(limit: number = 10): Observable<AtividadeRecente[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<AtividadeRecente[]>(`${this.apiUrl}/atividades-recentes`, { params });
  }

  obterProximosAgendamentos(limit: number = 5, profissionalId?: string): Observable<ProximoAgendamento[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (profissionalId) {
      params = params.set('profissional_id', profissionalId);
    }
    return this.http.get<ProximoAgendamento[]>(`${this.apiUrl}/proximos-agendamentos`, { params });
  }

  obterDadosGrafico(periodo: string = 'ultimos-7-dias', profissionalId?: string): Observable<DadosGrafico> {
    let params = new HttpParams().set('periodo', periodo);
    if (profissionalId) {
      params = params.set('profissional_id', profissionalId);
    }
    return this.http.get<DadosGrafico>(`${this.apiUrl}/dados-grafico`, { params });
  }

  resumo(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams()
      .set('data_inicio', dataInicio)
      .set('data_fim', dataFim);
    
    return this.http.get(`${this.apiUrl}/resumo`, { params });
  }

  obterAgendamentosPorPeriodo(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams()
      .set('data_inicio', dataInicio)
      .set('data_fim', dataFim);
    
    return this.http.get(`${this.apiUrl}/agendamentos-por-periodo`, { params });
  }

  obterReceitaPorPeriodo(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams()
      .set('data_inicio', dataInicio)
      .set('data_fim', dataFim);
    
    return this.http.get(`${this.apiUrl}/receita-por-periodo`, { params });
  }
}
