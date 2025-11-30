// src/app/user/user-item/user-item.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // สำหรับ *ngIf, pipe
import { UserType } from '../user/user';

@Component({
  selector: '[app-user-item]', 
  host: { 'role': 'row' }, 
  imports: [CommonModule],
  templateUrl: './user-item.html',
  styleUrls: ['./user-item.css']
})
export class UserItemComponent {
  @Input() user!: UserType; 

  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<UserType>();

  onEdit(): void {
    this.edit.emit(this.user);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.user.fullname}?`)) {
      this.delete.emit(this.user.id);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  
  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'super admin': return 'badge bg-primary';
      case 'admin': return 'badge bg-info';
      case 'hr admin': return 'badge bg-warning text-dark';
      case 'employee': return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  }
}