import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private apiUrl = `${environment.apiUrl}/Admin`; 
  private api = `${environment.apiUrl}/Evenemet`; 

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('access_token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  AddEvenemt(body: any) {
    return this.http.post(this.apiUrl + "/AddEvenement", body, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  GetAllevents() {
    return this.http.get(this.api + "/GetAll", {
      headers: this.getHeaders()
    });
  }

  DeleteEvents(id: number) {
    return this.http.delete(this.api + "/DeleteEvenement/" + id, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }
}
