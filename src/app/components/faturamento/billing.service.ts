import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';

const API = environment.BASE_URL;

export interface ApontamentoPayload {
  calledId?: number | string;
  hours: number;
  description: string;
  date: string;
}

export interface GeneratePayload {
  companieId: number | string;
  apontamentoIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }

  // ── Apontamentos ───────────────────────────────────────────────────────
  listApontamentos(calledId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${API}billing/apontamentos/called/${calledId}`, { headers: this.getHeaders() });
  }

  createApontamento(payload: ApontamentoPayload): Observable<any> {
    return this.http.post<any>(`${API}billing/apontamentos`, payload, { headers: this.getHeaders() });
  }

  updateApontamento(id: string | number, payload: ApontamentoPayload): Observable<any> {
    return this.http.post<any>(`${API}billing/apontamentos/update/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteApontamento(id: string | number): Observable<any> {
    return this.http.delete<any>(`${API}billing/apontamentos/delete/${id}`, { headers: this.getHeaders() });
  }

  // ── Faturamento ────────────────────────────────────────────────────────
  getOpen(companieId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${API}billing/open/${companieId}`, { headers: this.getHeaders() });
  }

  listFaturamentos(params?: { status?: string; companieId?: string | number }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.companieId != null && params.companieId !== '') {
      httpParams = httpParams.set('companieId', String(params.companieId));
    }
    return this.http.get<any[]>(`${API}billing/faturamentos`, { headers: this.getHeaders(), params: httpParams });
  }

  showFaturamento(id: string | number): Observable<any> {
    return this.http.get<any>(`${API}billing/faturamentos/${id}`, { headers: this.getHeaders() });
  }

  generate(payload: GeneratePayload): Observable<any> {
    return this.http.post<any>(`${API}billing/faturamentos/generate`, payload, { headers: this.getHeaders() });
  }

  pay(id: string | number): Observable<any> {
    return this.http.post<any>(`${API}billing/faturamentos/${id}/pay`, {}, { headers: this.getHeaders() });
  }

  estornar(id: string | number): Observable<any> {
    return this.http.delete<any>(`${API}billing/faturamentos/${id}`, { headers: this.getHeaders() });
  }

  // ── Empresas ───────────────────────────────────────────────────────────
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${API}companies/list`, { headers: this.getHeaders() });
  }
}
