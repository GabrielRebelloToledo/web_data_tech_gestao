import { Injectable } from '@angular/core';

// informe a key que será salva no localStorage
const KEY = 'DATATECHSISTEMASGESTAO';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private localStorage: Storage | undefined;

  constructor() {
    if (typeof window !== 'undefined') {
      this.localStorage = window.localStorage;
    }
  }

  hasToken() {
    return !!this.getToken(); // !! é utilizado para converter valores em booleanos
  }

  setToken(token: any) {
    if (this.localStorage) {
      this.localStorage.setItem(KEY, token);
    }
  }

  getToken() {
    if (this.localStorage) {
      return this.localStorage.getItem(KEY);
    }
    return null;
  }

  removeToken() {
    if (this.localStorage) {
      this.localStorage.removeItem(KEY);
    }
  }

  // Verifica se o token está expirado
  isTokenExpired(token: string | null): boolean {
    if (!token) {
      // Se o token estiver vazio, consideramos como expirado
      return true;
    }

    // Extrai a parte de dados do token JWT
    const tokenData = this.parseJwt(token);

    // Obtém a data de expiração do token (em segundos desde a época)
    const expirationDate = tokenData ? tokenData.exp * 1000 : null;

    if (!expirationDate) {
      // Se a data de expiração for inválida, consideramos o token como expirado
      return true;
    }

    // Obtém a data atual (em milissegundos desde a época)
    const currentDate = new Date().getTime();

    // Compara a data de expiração com a data atual
    return currentDate > expirationDate;
  }

  // Função auxiliar para decodificar o token JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }
}