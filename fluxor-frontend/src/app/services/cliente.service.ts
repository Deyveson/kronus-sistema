import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cliente, ClienteCreate } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar(skip: number = 0, limit: number = 100, ativo?: boolean): Observable<Cliente[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (ativo !== undefined) {
      params = params.set('ativo', ativo.toString());
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(clientes => clientes.map(cliente => ({
        ...cliente,
        id: cliente._id || cliente.id
      })))
    );
  }

  obter(id: string): Observable<Cliente> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(cliente => ({
        ...cliente,
        id: cliente._id || cliente.id
      }))
    );
  }

  criar(cliente: ClienteCreate): Observable<Cliente> {
    console.log('[ClienteService] Criando cliente:', cliente);
    console.log('[ClienteService] URL:', this.apiUrl);
    return this.http.post<Cliente>(this.apiUrl, cliente).pipe(
      map(response => {
        console.log('[ClienteService] Cliente criado com sucesso:', response);
        return response;
      })
    );
  }

  atualizar(id: string, cliente: Partial<ClienteCreate>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
