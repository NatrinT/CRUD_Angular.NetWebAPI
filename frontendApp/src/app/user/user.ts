// user.ts

import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserItemComponent } from '../user-item/user-item';
import { UserFormComponent } from '../user-form/user-form';
import { lastValueFrom } from 'rxjs'; // ⬅️ เพิ่ม lastValueFrom
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { EditUserModalComponent } from "../user-edit-form/user-edit-form";

export interface UserType {
  id: number;
  fullname: string;
  email: string;
  role: string;
  createdDate: string;
}

export interface PagedResult<T> {
  dataSource: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, UserItemComponent, UserFormComponent, NgbModule, EditUserModalComponent],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})

export class UserComponent implements OnInit {

  users = signal<UserType[]>([]);
  showUserForm = signal(false);
  showUserEditForm = signal(false);
  editingUserId = signal<number | null>(null);
  currentUserId = signal<number | null>(null);
  currentUserRole = signal<string | null>(null);
  currentUserName = signal('Loading...'); 
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(6);
  totalCount = signal(0);

  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7054/api/User';

  readonly totalPagesCalc = computed(() => {
    return Math.ceil(this.totalCount() / this.pageSize());
  });

  readonly currentDisplayEnd = computed(() => {
    const currentEnd = this.currentPage() * this.pageSize();
    const total = this.totalCount();
    return Math.min(currentEnd, total);
  });


  loadAuthDetails(): void {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (userId && userRole) {
      this.currentUserId.set(parseInt(userId, 10));
      this.currentUserRole.set(userRole);

      this.fetchUserName(parseInt(userId, 10));
    } else {
      this.currentUserName.set('Guest');
    }
  }

  async fetchUserName(id: number): Promise<void> {
    try {
      const userDetail: UserType = await lastValueFrom(
        this.http.get<UserType>(`${this.apiUrl}/${id}`)
      );
      console.log(userDetail.fullname);

      this.currentUserName.set(userDetail.fullname);
    } catch (error) {
      console.error('Failed to fetch current user details:', error);
      this.currentUserName.set('Admin User');
    }
  }

  loadUsers(): void {
    let params = new HttpParams();
    params = params.set('PageNumber', this.currentPage());
    params = params.set('PageSize', this.pageSize());

    const searchTermValue = this.searchTerm();
    if (searchTermValue) {
      params = params.set('Search', searchTermValue);
    }

    console.log('Sending request with params:', params.toString());

    this.http.get<PagedResult<UserType>>(this.apiUrl, { params }).subscribe({
      next: (pagedData) => {
        this.users.set(pagedData.dataSource);
        this.totalCount.set(pagedData.totalCount);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  ngOnInit(): void {
    this.loadAuthDetails();
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(newPage: number): void {
    const total = this.totalPagesCalc();
    if (newPage >= 1 && newPage <= total) {
      this.currentPage.set(newPage);
      this.loadUsers();
    }
  }

  onPageSizeChange(event: any): void {
    const newSize = parseInt(event.target.value);
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onUserDelete(userId: number): void {
    if (!confirm(`Are you sure you want to delete user ID ${userId}?`)) {
      return;
    }
    this.http.delete(`${this.apiUrl}/${userId}`).subscribe({
    next: () => {
      this.loadUsers(); // ⬅️ เรียกโหลดข้อมูลใหม่หลังลบ
      alert(`User ID ${userId} deleted successfully.`);
    },
    error: (err) => {
    }
  });
  }


  onUserEdit(user: UserType): void {
    console.log('Edit user:', user);
    this.editingUserId.set(user.id);
    this.showUserEditForm.set(true);
  }


  onAddUser(): void {
    this.showUserForm.set(true);
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

    this.currentUserName.set('Guest');
    this.currentUserRole.set(null);

    this.router.navigate(['/login']);
  }

  handleFormSubmitted(success: boolean): void {
    this.showUserForm.set(false);
    if (success) {
      this.loadUsers();
    }
  }
  handleFormEditSubmitted(success: boolean): void {
    this.showUserEditForm.set(false); 
    this.editingUserId.set(null); 
    if (success) {
      this.loadUsers(); 
    }
  }
}