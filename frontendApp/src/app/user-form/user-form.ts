import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserType } from '../user/user';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface PermissionItem {
  role: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface UserFormModel extends UserType {
  firstname?: string;
  lastname?: string;
  mobileNo?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  permissions: PermissionItem[];
}

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserFormComponent {

  @Output() formSubmitted = new EventEmitter<boolean>();

  @Input() isEdit: boolean = false;

  currentAdminRole: string = 'Employee';

  private roleHierarchy: { [key: string]: number } = {
    'Super Admin': 4,
    'Admin': 3,
    'HR Admin': 2.5, 
    'Employee': 1,
    'Lorem Ipsum': 0
  };

  rolePermissions: PermissionItem[] = [
    { role: 'Super Admin', read: true, write: true, delete: true },
    { role: 'Admin', read: true, write: false, delete: false },
    { role: 'HR Admin', read: true, write: false, delete: false },
    { role: 'Employee', read: true, write: false, delete: false },
    { role: 'Lorem Ipsum', read: true, write: true, delete: true },
  ];

  userModel: UserFormModel = this.getInitialFormModel();

  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7054/api/User';

  constructor() {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      this.currentAdminRole = storedRole;
    }
  }

  isRoleHigherThanCurrent(formRole: string): boolean {
    const currentLevel = this.roleHierarchy[this.currentAdminRole] || 0;
    const formRoleLevel = this.roleHierarchy[formRole] || 0;

    return formRoleLevel > currentLevel;
  }

  getInitialFormModel(): UserFormModel {
    return {
      fullname: '',
      email: '',
      role: 'Admin', 
      createdDate: new Date().toISOString(),
      firstname: '',
      lastname: '',
      mobileNo: '',
      permissions: JSON.parse(JSON.stringify(this.rolePermissions)),
      username: '',
      password: '',
      confirmPassword: ''
    } as UserFormModel;
  }

  async onSubmit() {
    if (this.userModel.password !== this.userModel.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.userModel.fullname = (this.userModel.firstname?.trim() || '') + ' ' + (this.userModel.lastname?.trim() || '');
    this.userModel.fullname = this.userModel.fullname.trim();

    const userToCreate = {
      Fullname: this.userModel.fullname,
      Email: this.userModel.email,
      Role: this.userModel.role,
      CreatedDate: this.userModel.createdDate,
      Username: this.userModel.username,
      Password: this.userModel.password,
      MobileNo: this.userModel.mobileNo, 
      Permissions: this.userModel.permissions.map(p => ({
        RoleName: p.role,
        CanRead: p.read,
        CanWrite: p.write,
        CanDelete: p.delete,
      }))
    };


    try {
      const response = await lastValueFrom(this.http.post<any>(this.apiUrl, userToCreate));
      this.formSubmitted.emit(true); 
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add user. Check console for details.');
    }
  }

  onCancel() {
    this.formSubmitted.emit(false);
  }
}