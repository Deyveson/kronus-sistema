import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar token ao header se estiver autenticado
    const token = this.authService.getToken();
    if (token) {
      console.log('[AuthInterceptor] Token encontrado, adicionando ao request');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.warn('[AuthInterceptor] Nenhum token encontrado no localStorage');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[AuthInterceptor] Erro na requisição:', {
          url: request.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
        if (error.status === 401) {
          // Token inválido ou expirado - fazer logout
          console.warn('[AuthInterceptor] Token inválido/expirado, fazendo logout');
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
