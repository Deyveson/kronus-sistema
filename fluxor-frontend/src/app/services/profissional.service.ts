import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Profissional, ProfissionalCreate } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private apiUrl = `${environment.apiUrl}/profissionais`;

  constructor(private http: HttpClient) {}

  private enrichProfissional(prof: any): Profissional {
    return {
      ...prof,
      id: prof._id || prof.id,
      acessoSistema: prof.acesso_sistema,
      status: prof.ativo ? 'ativo' : 'inativo'
    };
  }

  listar(skip: number = 0, limit: number = 100, ativo?: boolean): Observable<Profissional[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (ativo !== undefined) {
      params = params.set('ativo', ativo.toString());
    }

    return this.http.get<Profissional[]>(this.apiUrl, { params })
      .pipe(map(profs => profs.map(p => this.enrichProfissional(p))));
  }

  obter(id: string): Observable<Profissional> {
    return this.http.get<Profissional>(`${this.apiUrl}/${id}`)
      .pipe(map(p => this.enrichProfissional(p)));
  }

  criar(profissional: ProfissionalCreate): Observable<Profissional> {
    console.log('[ProfissionalService] Criando profissional:', profissional);
    console.log('[ProfissionalService] URL:', this.apiUrl);
    return this.http.post<Profissional>(this.apiUrl, profissional)
      .pipe(map(p => {
        console.log('[ProfissionalService] Profissional criado com sucesso:', p);
        return this.enrichProfissional(p);
      }));
  }

  atualizar(id: string, profissional: Partial<ProfissionalCreate>): Observable<Profissional> {
    return this.http.put<Profissional>(`${this.apiUrl}/${id}`, profissional)
      .pipe(map(p => this.enrichProfissional(p)));
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
