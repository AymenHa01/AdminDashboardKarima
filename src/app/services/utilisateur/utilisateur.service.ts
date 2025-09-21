import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private url = `${environment.apiUrl}/Adhrent`;
  private adminUrl = `${environment.apiUrl}/Adhrent`;

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

  // Get all users
  gertAllUsers() {
    return this.http.get(this.adminUrl + '/getAllUsers', {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  // Get user participations (events, formations, ateliers)
  getUserParticipations(userId: number) {
    return this.http.get(this.url + `/getAlladhrentParticiapation/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Get specific event by ID
  getEvent(eventId: number) {
    return this.http.get(this.url + `/GetEvents/${eventId}`, {
      headers: this.getHeaders()
    });
  }

  // Get specific sous atelier by ID
  getSousAtelier(atelierId: number) {
    return this.http.get(this.url + `/GetSousAtelier/${atelierId}`, {
      headers: this.getHeaders()
    });
  }

  // Get specific formation by ID
  getFormation(formationId: number) {
    return this.http.get(this.url + `/GetFormation/${formationId}`, {
      headers: this.getHeaders()
    });
  }





}
