import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { ComboboxComponent } from '../shared/combobox/combobox.component';
import {
  PermissionsService,
  FeatureConfig,
  FeaturesResponse,
  PermissionGrant
} from '../core/permissions/permissions.service';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';

const API = environment.BASE_URL;

interface SessionUser {
  id: number;
  name: string;
  email: string;
  type: string;
}

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ComboboxComponent
  ],
  templateUrl: './permissoes.component.html',
  styleUrl: './permissoes.component.css'
})
export class PermissoesComponent implements OnInit {

  users = signal<SessionUser[]>([]);
  loadingUsers = signal<boolean>(true);

  selectedUserId = signal<number | null>(null);
  selectedUser = computed<SessionUser | null>(() =>
    this.users().find((u: SessionUser) => Number(u.id) === Number(this.selectedUserId())) || null
  );
  selectedUserIsAdmin = computed<boolean>(() =>
    (this.selectedUser()?.type || '').toUpperCase() === 'ADMIN'
  );

  features = signal<FeatureConfig[]>([]);
  actionLabels = signal<{ [action: string]: string }>({});

  // Pares marcados na matriz, no formato "FEATURE:ACTION".
  granted = signal<Set<string>>(new Set<string>());

  loadingMatrix = signal<boolean>(false);
  saving = signal<boolean>(false);

  // Opções para o combobox de usuário (com tipo no rótulo).
  userOptions = computed(() =>
    this.users().map((u: SessionUser) => ({
      id: u.id,
      name: `${u.name} — ${u.type === 'ADMIN' ? 'Administrador' : 'Usuário'}`
    }))
  );

  private featuresLoaded = false;

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private perm: PermissionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.http.get<SessionUser[]>(`${API}sessions/list`, { headers: this.getHeaders() }).subscribe({
      next: (data: SessionUser[]) => {
        this.users.set(data || []);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
        this.snackBar.open('Não foi possível carregar os usuários', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  async onUserChange(id: number | null): Promise<void> {
    this.selectedUserId.set(id != null ? Number(id) : null);
    this.granted.set(new Set<string>());
    if (id == null) return;

    this.loadingMatrix.set(true);
    try {
      if (!this.featuresLoaded) {
        const feats: FeaturesResponse = await this.perm.getFeatures();
        this.features.set(feats?.features || []);
        this.actionLabels.set(feats?.actionLabels || {});
        this.featuresLoaded = true;
      }

      // ADMIN tem acesso total — não há matriz para gerir.
      if (this.selectedUserIsAdmin()) {
        this.granted.set(new Set<string>());
        this.loadingMatrix.set(false);
        return;
      }

      const current: PermissionGrant[] = await this.perm.getUserPermissions(id);
      const set = new Set<string>();
      (current || []).forEach((p: PermissionGrant) => {
        if (p?.feature && p?.action) set.add(`${p.feature}:${p.action}`);
      });
      this.granted.set(set);
    } catch {
      this.snackBar.open('Não foi possível carregar as permissões do usuário', 'Fechar', {
        duration: 3000, panelClass: ['snackbar-error']
      });
    } finally {
      this.loadingMatrix.set(false);
    }
  }

  actionLabel(action: string): string {
    return this.actionLabels()[action] || action;
  }

  isChecked(feature: string, action: string): boolean {
    return this.granted().has(`${feature}:${action}`);
  }

  toggle(feature: string, action: string): void {
    if (this.selectedUserIsAdmin()) return;
    const key = `${feature}:${action}`;
    const next = new Set(this.granted());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.granted.set(next);
  }

  async save(): Promise<void> {
    const userId = this.selectedUserId();
    if (userId == null || this.selectedUserIsAdmin()) return;

    this.saving.set(true);
    const grants: PermissionGrant[] = Array.from(this.granted()).map((key: string) => {
      const [feature, action] = key.split(':');
      return { feature, action };
    });

    try {
      await this.perm.setUserPermissions(userId, grants);
      this.snackBar.open('Permissões salvas', 'Fechar', {
        duration: 2500, panelClass: ['snackbar-success']
      });
    } catch (err: any) {
      const msg = err?.error?.message?.message || 'Não foi possível salvar as permissões';
      this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
    } finally {
      this.saving.set(false);
    }
  }
}
