import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayModule, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.css'
})
export class ComboboxComponent {
  @Input() options: any[] = [];
  @Input() labelKey: string = 'name';
  @Input() valueKey: string = 'id';
  @Input() value: any = null;
  @Input() placeholder: string = 'Selecione…';
  @Input() searchPlaceholder: string = 'Buscar…';
  @Input() emptyMessage: string = 'Nenhum resultado';
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('trigger', { read: CdkOverlayOrigin }) origin!: CdkOverlayOrigin;
  @ViewChild('triggerEl') triggerEl?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  isOpen = signal<boolean>(false);
  query = signal<string>('');
  activeIndex = signal<number>(-1);

  triggerWidth = signal<number>(0);

  positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 6 },
    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -6 }
  ];

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(o =>
      String(this.getLabel(o) ?? '').toLowerCase().includes(q)
    );
  });

  constructor(private hostRef: ElementRef<HTMLElement>) {}

  getLabel(option: any): string {
    if (option == null) return '';
    return option[this.labelKey] ?? '';
  }

  getValue(option: any): any {
    if (option == null) return null;
    return option[this.valueKey];
  }

  selectedLabel(): string {
    const match = this.options.find(o => this.sameValue(this.getValue(o), this.value));
    return match ? this.getLabel(match) : '';
  }

  private sameValue(a: any, b: any): boolean {
    if (a == null || b == null) return a === b;
    return String(a) === String(b);
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen() ? this.closePanel() : this.openPanel();
  }

  openPanel() {
    if (this.disabled) return;
    this.query.set('');
    const idx = this.options.findIndex(o => this.sameValue(this.getValue(o), this.value));
    this.activeIndex.set(idx >= 0 ? idx : 0);
    const rect = this.triggerEl?.nativeElement?.getBoundingClientRect();
    if (rect) this.triggerWidth.set(rect.width);
    this.isOpen.set(true);
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 30);
  }

  closePanel() {
    this.isOpen.set(false);
    this.query.set('');
    this.activeIndex.set(-1);
  }

  choose(option: any) {
    const v = this.getValue(option);
    this.value = v;
    this.valueChange.emit(v);
    this.closePanel();
  }

  onSearch(value: string) {
    this.query.set(value);
    this.activeIndex.set(this.filtered().length ? 0 : -1);
  }

  isActive(i: number) { return this.activeIndex() === i; }

  isSelected(option: any) {
    return this.sameValue(this.getValue(option), this.value);
  }

  onKeydown(ev: KeyboardEvent) {
    if (!this.isOpen()) return;
    const list = this.filtered();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.activeIndex.set(Math.min(list.length - 1, this.activeIndex() + 1));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.activeIndex.set(Math.max(0, this.activeIndex() - 1));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const idx = this.activeIndex();
      if (idx >= 0 && list[idx]) this.choose(list[idx]);
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      this.closePanel();
    }
  }

  clear(ev: MouseEvent) {
    ev.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.isOpen()) this.closePanel(); }
}
