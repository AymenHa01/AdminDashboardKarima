import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`; 

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  login(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post<any>(`${this.API_URL}/login`, params.toString(), { headers })
      .pipe(
        tap(response => {
          if (response && response.access_token) {
            this.cookieService.set('access_token', response.access_token, {
              secure: true,
              sameSite: 'Strict',
              expires: 1 
            });
          }
        })
      );
  }

  getToken(): string {
    return this.cookieService.get('access_token');
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('access_token');
  }

  logout(): void {
    this.cookieService.delete('access_token');
  }
}
