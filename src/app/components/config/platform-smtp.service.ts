import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../core/token/token.service';

const API = environment.BASE_URL;

export interface PlatformSmtp {
  smtpHost: string;
  smtpPort: number | null;
  smtpSecure: boolean | null;
  smtpUser: string;
  smtpFromEmail: string;
  smtpFromName: string;
  hasPass: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlatformSmtpService {
  constructor(private http: HttpClient, private token: TokenService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `${this.token.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  get(): Observable<PlatformSmtp> {
    return this.http.get<PlatformSmtp>(`${API}settings/smtp`, { headers: this.headers() }).pipe(take(1));
  }

  update(payload: any): Observable<PlatformSmtp> {
    return this.http.put<PlatformSmtp>(`${API}settings/smtp`, payload, { headers: this.headers() }).pipe(take(1));
  }

  test(): Observable<{ ok: boolean; error?: string }> {
    return this.http.post<{ ok: boolean; error?: string }>(`${API}settings/smtp/test`, {}, { headers: this.headers() }).pipe(take(1));
  }
}
