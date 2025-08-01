import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-success-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-success-dialog.component.html',
  styleUrls: ['./register-success-dialog.component.css']
})
export class RegisterSuccessDialogComponent {
  @Input() message: string = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
