import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { observeOn } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtelierService {
  private apiUrl = `${environment.apiUrl}/Admin`; 
  private api = `${environment.apiUrl}/Atelier`; 

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getHeaders(): HttpHeaders {
    console.log(this.cookieService.get('access_token'));
    
    const token = this.cookieService.get('access_token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  addAtelier(atelier: any){
    return this.http.post(this.apiUrl + "/addAtelier" , atelier, {
      headers: this.getHeaders()
    })
  }

  GetAtelier(){
    return this.http.get(this.api + "/GetAllAtelier" , {
      headers: this.getHeaders()
    })
  }
  
  DeleteAtelier(id : number){
    return this.http.delete(this.apiUrl + "/DeleteAtelier/" + id  , {
      headers: this.getHeaders()
    })
  }
  
  AddSousAtelier(body : any ){
    return this.http.post(this.apiUrl + "/addSousAtelier" , body ,{
      headers: this.getHeaders(),
      observe: 'response'
    })
  }

  Edite(body : any ){
    return this.http.post(this.apiUrl + "/EditSousAtelier" , body, {
      headers: this.getHeaders()
    })
  }


  GetSousAtelierById(id : number ){
    return this.http.get(this.api + "/GetSousAtelier/" + id  , {
      headers: this.getHeaders()
    })
    
  }

  
  DeleteSousAtelier(body : any ){
    return this.http.delete(this.apiUrl + "/DeleteSousAtelier" , {
      headers: this.getHeaders(),
      body
    })
  }

  UpdateAtelier(atelier: any) {
    
    return this.http.post(this.apiUrl + "/EditAtelier" , atelier, {
      headers: this.getHeaders()
    }) 
  
  }
}
