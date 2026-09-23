import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly rejectLabel = input('No');
  readonly acceptLabel = input('Yes');
  readonly testId = input('confirm-dialog');

  readonly accepted = output<void>();
  readonly rejected = output<void>();

  accept(): void {
    this.accepted.emit();
  }

  reject(): void {
    this.rejected.emit();
  }
}
