import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtisteService {
  private apiUrl = `${environment.apiUrl}/Admin`; 
  private tableau = `${environment.apiUrl}/Tableaux`; 

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('access_token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  AddArtiste(body: any) {
    return this.http.post(this.apiUrl + "/createArtiste", body, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  GetAllArtistes() {
    return this.http.get(this.tableau + "/GetArtiste", {
      headers: this.getHeaders()
    });
  }

  DeleteArtiste(id: number) {
    return this.http.delete(this.apiUrl + "/DeletArtiste/" + id, {
      headers: this.getHeaders(),
    });
  }

  // Tableau methods
  AddTableau(tableau: any) {
    return this.http.post(this.tableau + "/AddTableau", tableau, {
      headers: this.getHeaders()
    });
  }

  GetTableauxByArtiste(artisteId: number) {
    return this.http.get(this.tableau + `/GetTableaux/${artisteId}`, {
      headers: this.getHeaders()
    });
  }

  DeleteTableau(tableauId: number) {
    return this.http.delete(this.tableau + `/DeleteTableau/${tableauId}`, {
      headers: this.getHeaders()
    });
  }
}
