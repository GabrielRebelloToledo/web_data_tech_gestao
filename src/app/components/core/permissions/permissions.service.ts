import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { TokenService } from '../token/token.service';
import { environment } from '../../../../environments/environment';

const API = environment.BASE_URL;

export interface PermissionGrant {
  feature: string;
  action: string;
}

export interface FeatureConfig {
  feature: string;
  label: string;
  actions: string[];
}

export interface FeaturesResponse {
  actions: string[];
  actionLabels: { [action: string]: string };
  features: FeatureConfig[];
}

interface MeState {
  isAdmin: boolean;
  set: Set<string>;
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {

  readonly me = signal<MeState>({ isAdmin: false, set: new Set<string>() });

  constructor(private http: HttpClient, private token: TokenService) {}

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });
  }

  async load(): Promise<void> {
    // Sem token (não logado) não há o que carregar.
    if (!this.token.hasToken()) {
      this.me.set({ isAdmin: false, set: new Set<string>() });
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<{ type: string; isAdmin: boolean; permissions: PermissionGrant[] }>(
          `${API}permissions/me`,
          { headers: this.getHeaders() }
        )
      );

      const set = new Set<string>();
      (data?.permissions || []).forEach((p: PermissionGrant) => {
        if (p?.feature && p?.action) {
          set.add(`${p.feature}:${p.action}`);
        }
      });

      this.me.set({ isAdmin: !!data?.isAdmin, set });
    } catch {
      // Erro (ex.: não logado / token expirado) não pode quebrar o bootstrap.
      this.me.set({ isAdmin: false, set: new Set<string>() });
    }
  }

  can(feature: string, action: string): boolean {
    const state = this.me();
    return state.isAdmin || state.set.has(`${feature}:${action}`);
  }

  isAdmin(): boolean {
    return this.me().isAdmin;
  }

  getFeatures(): Promise<FeaturesResponse> {
    return firstValueFrom(
      this.http.get<FeaturesResponse>(`${API}permissions/features`, { headers: this.getHeaders() })
    );
  }

  getUserPermissions(userId: number | string): Promise<PermissionGrant[]> {
    return firstValueFrom(
      this.http.get<PermissionGrant[]>(`${API}permissions/user/${userId}`, { headers: this.getHeaders() })
    );
  }

  setUserPermissions(userId: number | string, grants: PermissionGrant[]): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${API}permissions/user/${userId}`, { grants }, { headers: this.getHeaders() })
    );
  }
}
