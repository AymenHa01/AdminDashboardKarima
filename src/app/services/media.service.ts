import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = `${environment.apiUrl}/Admin`; 

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

  addMedia(filename: string,  id: string) {
    if (!filename  || !id) {
      return throwError(() => new Error('Missing required parameters'));
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return throwError(() => new Error('Invalid ID format'));
    }

    return this.http.post(`${this.apiUrl}/AddMediaToAtelier?Path=${encodeURIComponent(filename)}&id=${numericId}`, {
      headers: this.getHeaders()
    });
  }

  getMediaByTypeAndId(type: string, id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return throwError(() => new Error('Invalid ID format'));
    }

    // Type codes: E = Evenement, F = Formation, S = SousAtelier
    return this.http.get(`${this.apiUrl}/GetMedia?type=${type}&id=${numericId}`, {
      headers: this.getHeaders()
    });
  }

  deleteMedia(mediaId: string) {
    const numericMediaId = parseInt(mediaId, 10);
    if (isNaN(numericMediaId)) {
      return throwError(() => new Error('Invalid media ID format'));
    }

    return this.http.delete(`${this.apiUrl}/DeleteMedia?id=${numericMediaId}`, {
      headers: this.getHeaders()
    });
  }

  addMediaFormation(path: string, id: number): Observable<void> {
    if (!path || !id) {
      return throwError(() => new Error('Missing required parameters'));
    }

    return this.http.post<void>(
      `${this.apiUrl}/AddMediaFormation?path=${encodeURIComponent(path)}&id=${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  addMediaToEvent(path: string, id: number): Observable<void> {
   if (!path || !id) {
      return throwError(() => new Error('Missing required parameters'));
    }

    return this.http.post<void>(
      `${this.apiUrl}/AddMediaToEvent?path=${encodeURIComponent(path)}&id=${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  addMediaToAtelier(mediaAtelier: any): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/AddMediaToAtelier`,
      mediaAtelier,
      { headers: this.getHeaders() }
    );
  }




  deleteMediaFormation(mediaId: string): Observable<void> {
    const numericMediaId = parseInt(mediaId, 10);
    if (isNaN(numericMediaId)) {
      return throwError(() => new Error('Invalid media ID format'));
    }
    return this.http.delete<void>(`${this.apiUrl}/DeleteMediaFormation?mediaId=${numericMediaId}`, {
      headers: this.getHeaders()
    });
  }

  deleteMediaEvent(mediaId: string): Observable<void> {
    const numericMediaId = parseInt(mediaId, 10);
    if (isNaN(numericMediaId)) {
      return throwError(() => new Error('Invalid media ID format'));
    }

    return this.http.delete<void>(`${this.apiUrl}/DeleteMediaEvent?mediaId=${numericMediaId}`, {
      headers: this.getHeaders()
    });
  }

  deleteMediaAtelier(mediaId: string): Observable<void> {
    const numericMediaId = parseInt(mediaId, 10);
    if (isNaN(numericMediaId)) {
      return throwError(() => new Error('Invalid media ID format'));
    }

    return this.http.delete<void>(`${this.apiUrl}/DeleteMediaAtelier?mediaId=${numericMediaId}`, {
      headers: this.getHeaders()
    });
  }


  
}
