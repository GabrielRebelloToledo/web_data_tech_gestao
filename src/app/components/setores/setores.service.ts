import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';

const API = environment.BASE_URL;

@Injectable({ providedIn: 'root' })
export class SetoresService {
  constructor(private http: HttpClient, private token: TokenService) {}

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }

  // ── Empresas (seletor) ────────────────────────────────────────────────
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${API}companies/list`, { headers: this.getHeaders() });
  }

  // ── Árvore de setores (por empresa) ───────────────────────────────────
  getTree(companieId: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}compdep/tree/${companieId}`, { headers: this.getHeaders() });
  }

  createNode(payload: any): Observable<any> {
    return this.http.post<any>(`${API}compdep/`, payload, { headers: this.getHeaders() });
  }

  updateNode(id: any, payload: any): Observable<any> {
    return this.http.put<any>(`${API}compdep/update/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteNode(id: any): Observable<any> {
    return this.http.delete<any>(`${API}compdep/delete/${id}`, { headers: this.getHeaders() });
  }

  // ── Catálogo de setores ───────────────────────────────────────────────
  // Disponível para a empresa montar a árvore (próprio + grupo se opt-in)
  getAvailableCatalog(companieId: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}departments/available/${companieId}`, { headers: this.getHeaders() });
  }

  // Catálogo de um dono específico (empresa OU grupo)
  getCatalogByOwner(params: { companieId?: any; groupId?: any }): Observable<any[]> {
    const qs = params.companieId != null
      ? `companieId=${params.companieId}`
      : `groupId=${params.groupId}`;
    return this.http.get<any[]>(`${API}departments/by-owner?${qs}`, { headers: this.getHeaders() });
  }

  createCatalogItem(payload: { department: string; companieId?: any; groupId?: any }): Observable<any> {
    return this.http.post<any>(`${API}departments/`, payload, { headers: this.getHeaders() });
  }

  deleteCatalogItem(id: any): Observable<any> {
    return this.http.delete<any>(`${API}departments/delete/${id}`, { headers: this.getHeaders() });
  }

  // ── Grupos econômicos ─────────────────────────────────────────────────
  getGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${API}groups/list`, { headers: this.getHeaders() });
  }

  createGroup(payload: { name: string }): Observable<any> {
    return this.http.post<any>(`${API}groups/`, payload, { headers: this.getHeaders() });
  }

  assignCompany(payload: { companieId: any; groupId: any; useGroupCatalog?: string }): Observable<any> {
    return this.http.put<any>(`${API}groups/assign-company`, payload, { headers: this.getHeaders() });
  }

  // ── Atendentes por nó (usuários avulsos) ──────────────────────────────
  listNodeUsers(idDepartComp: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}compdepuser/list/${idDepartComp}`, { headers: this.getHeaders() });
  }

  addNodeUser(idDepartComp: any, userId: any): Observable<any> {
    return this.http.post<any>(`${API}compdepuser`, { idDepartComp, userId }, { headers: this.getHeaders() });
  }

  removeNodeUser(idDepCompUser: any): Observable<any> {
    return this.http.delete<any>(`${API}compdepuser/delete/${idDepCompUser}`, { headers: this.getHeaders() });
  }

  // ── Grupos de usuários por nó ─────────────────────────────────────────
  listNodeGroups(idDepartComp: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}usergroups/node/${idDepartComp}`, { headers: this.getHeaders() });
  }

  linkNodeGroup(idDepartComp: any, userGroupId: any): Observable<any> {
    return this.http.post<any>(`${API}usergroups/link`, { idDepartComp, userGroupId }, { headers: this.getHeaders() });
  }

  unlinkNodeGroup(id: any): Observable<any> {
    return this.http.delete<any>(`${API}usergroups/unlink/${id}`, { headers: this.getHeaders() });
  }

  // ── Listas para seletores ─────────────────────────────────────────────
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API}sessions/list`, { headers: this.getHeaders() });
  }

  getAllUserGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${API}usergroups/list`, { headers: this.getHeaders() });
  }
}
