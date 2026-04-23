import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormComponent, TabConfig } from '../form/form.component';
import { UserService } from '../core/user/user.service';
import { PerfilComponent } from '../perfil/perfil.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from '../core/theme/theme.service';

type NavItem = {
  key: string;
  label: string;
  icon: string;
  route?: string;
  action?: 'new-ticket';
  adminOnly?: boolean;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, PerfilComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent implements OnInit {
  @Input() activePage: string = '';
  @Input() breadcrumbs: { label: string; route?: string }[] = [];
  @Input() pageTitle?: string;

  usuario = '';
  idUser: any;
  type: any;
  userInitials = '';

  collapsed = signal(false);
  mobileOpen = signal(false);
  userMenuOpen = signal(false);
  profileModalOpen = signal(false);
  profileLoading = false;
  themeDark = computed(() => this.themeService.isDark());

  operationalItems: NavItem[] = [
    { key: 'home', label: 'Início', icon: 'dashboard', route: '/inicio' },
    { key: 'new', label: 'Abrir Chamado', icon: 'add_circle', action: 'new-ticket' },
  ];

  adminItems: NavItem[] = [
    { key: 'companies', label: 'Empresas', icon: 'business', route: '/companies', adminOnly: true },
    { key: 'departments', label: 'Departamentos', icon: 'apartment', route: '/departments', adminOnly: true },
    { key: 'usuarios', label: 'Usuários', icon: 'group', route: '/usuarios', adminOnly: true },
    { key: 'images', label: 'Imagens', icon: 'image', route: '/images', adminOnly: true },
  ];

  constructor(
    private dialog: MatDialog,
    private user: UserService,
    private router: Router,
    private themeService: ThemeService,
    private host: ElementRef<HTMLElement>
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.userMenuOpen()) return;
    const menuEl = this.host.nativeElement.querySelector('.user-menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.userMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
    if (this.mobileOpen()) this.mobileOpen.set(false);
  }

  ngOnInit(): void {
    this.usuario = this.user.user?.name || '';
    this.idUser = this.user.user?.id;
    this.type = this.user.user?.type;
    this.userInitials = (this.usuario || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');

    try {
      const sidebar = localStorage.getItem('datatech-sidebar');
      if (sidebar === 'collapsed') this.collapsed.set(true);
    } catch {}
  }

  isAdmin() { return this.type === 'ADMIN'; }

  toggleCollapse() {
    this.collapsed.update(v => !v);
    try { localStorage.setItem('datatech-sidebar', this.collapsed() ? 'collapsed' : 'expanded'); } catch {}
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }

  toggleUserMenu() { this.userMenuOpen.update(v => !v); }
  closeUserMenu() { this.userMenuOpen.set(false); }

  toggleTheme() {
    this.themeService.toggle();
  }

  handleItem(item: NavItem) {
    this.closeMobile();
    if (item.action === 'new-ticket') return this.openNewTicket();
    if (item.route) this.router.navigate([item.route]);
  }

  openNewTicket() {
    const id = this.user.user.id;

    const formConfig: TabConfig[] = [{
      title: 'Abertura de Chamado',
      fields: [
        { name: 'userId', placeholder: 'Cód. do Usuário', type: 'number', required: true },
        { name: 'anydesk', placeholder: 'Cód. do AnyDesk', type: 'number', required: true },
        { name: 'telephone', placeholder: 'Telefone de Contato', type: 'number', required: true },
        { name: 'status', placeholder: 'Status', type: 'select', optionsUrl: `status/list`, required: true, visible: true, defaultValueName: 'Aguardando' },
        { name: 'companieIdP', placeholder: 'Empresa Abertura', type: 'select', optionsUrl: `usercompanies/show/${id}`, required: true },
        { name: 'idDepCall', placeholder: 'Chamado para', type: 'select', optionsUrl: `compdepuser/listdepcall/${id}`, required: true },
        { name: 'emailscopy', placeholder: 'E-mails em Cópia — separe por ;', type: 'txtarea', required: false },
        { name: 'reason', placeholder: 'Motivo da Abertura', type: 'txtarea', required: true },
        { name: 'file1', placeholder: 'Arquivo 1', type: 'file', required: false },
        { name: 'file2', placeholder: 'Arquivo 2', type: 'file', required: false },
        { name: 'file3', placeholder: 'Arquivo 3', type: 'file', required: false },
        { name: 'file4', placeholder: 'Arquivo 4', type: 'file', required: false },
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      panelClass: 'shell-dialog',
      data: { tabs: formConfig, url: 'called' }
    });
  }

  openProfile() {
    this.profileModalOpen.set(true);
    this.closeUserMenu();
  }

  closeProfile() { this.profileModalOpen.set(false); }

  onProfileLoadingFinished(done: boolean) { this.profileLoading = !done; }

  logout() {
    this.user.logout();
    window.location.hash = '/';
    window.location.reload();
  }
}
