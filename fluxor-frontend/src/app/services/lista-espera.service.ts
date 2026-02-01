import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ListaEspera, ListaEsperaCreate } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ListaEsperaService {
  private apiUrl = `${environment.apiUrl}/lista-espera`;

  constructor(private http: HttpClient) {}

  private enrichListaEspera(item: ListaEspera): ListaEspera {
    const criadoEm = new Date(item.criado_em);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - criadoEm.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...item,
      nomePaciente: item.cliente_nome,
      servico: item.servico_nome,
      profissional: item.profissional_nome || '',
      dataPreferia: '',  // Pode ser adicionado ao schema se necessário
      horario: '',  // Pode ser adicionado ao schema se necessário
      observacao: item.observacoes || '',
      diasEspera: diffDays
    };
  }

  listar(skip: number = 0, limit: number = 100, prioridade?: string): Observable<ListaEspera[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (prioridade) {
      params = params.set('prioridade', prioridade);
    }

    return this.http.get<ListaEspera[]>(this.apiUrl, { params })
      .pipe(map(items => items.map(i => this.enrichListaEspera(i))));
  }

  buscarPorId(id: string): Observable<ListaEspera> {
    return this.http.get<ListaEspera>(`${this.apiUrl}/${id}`)
      .pipe(map(i => this.enrichListaEspera(i)));
  }

  criar(listaEspera: ListaEsperaCreate): Observable<ListaEspera> {
    return this.http.post<ListaEspera>(this.apiUrl, listaEspera)
      .pipe(map(i => this.enrichListaEspera(i)));
  }

  atualizar(id: string, listaEspera: Partial<ListaEspera>): Observable<ListaEspera> {
    return this.http.put<ListaEspera>(`${this.apiUrl}/${id}`, listaEspera)
      .pipe(map(i => this.enrichListaEspera(i)));
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
