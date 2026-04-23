import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})



export class ConfirmDialogService {
  constructor(private dialog: MatDialog) { }

  confirmar(mensagem: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensagem },
    });

    return dialogRef.afterClosed().toPromise();
  }
}