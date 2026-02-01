import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Servico, ServicoCreate } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  private apiUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  private enrichServico(srv: any): Servico {
    return {
      ...srv,
      id: srv._id || srv.id,
      preco: srv.valor,
      profissionaisHabilitados: srv.profissionais_habilitados,
      profissionais: srv.profissionais_habilitados?.length || 0,
      status: srv.ativo ? 'ativo' : 'inativo'
    };
  }

  listar(skip: number = 0, limit: number = 100, ativo?: boolean): Observable<Servico[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (ativo !== undefined) {
      params = params.set('ativo', ativo.toString());
    }

    return this.http.get<Servico[]>(this.apiUrl, { params })
      .pipe(map(servs => servs.map(s => this.enrichServico(s))));
  }

  obter(id: string): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`)
      .pipe(map(s => this.enrichServico(s)));
  }

  criar(servico: ServicoCreate): Observable<Servico> {
    console.log('[ServicoService] Criando serviço:', servico);
    console.log('[ServicoService] URL:', this.apiUrl);
    return this.http.post<Servico>(this.apiUrl, servico)
      .pipe(map(s => {
        console.log('[ServicoService] Serviço criado com sucesso:', s);
        return this.enrichServico(s);
      }));
  }

  atualizar(id: string, servico: Partial<ServicoCreate>): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, servico)
      .pipe(map(s => this.enrichServico(s)));
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
